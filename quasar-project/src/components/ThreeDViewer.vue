<template>
  <div ref="container" class="threejs-container" @wheel="onWheel" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default defineComponent({
  name: 'ThreeDViewer',
  setup() {
    const container = ref<HTMLDivElement>();
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let machineGroup: THREE.Group;
    let animationId: number;

    // Camera orbital controls variables
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let cameraRadius = 20;
    let cameraTheta = Math.PI / 4; // Horizontal angle
    const cameraPhi = Math.PI / 3; // Fixed vertical angle - no longer variable
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const init = () => {
      if (!container.value) return;

      // Scene setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e1e1e);

      // Camera setup with more parallel FOV
      camera = new THREE.PerspectiveCamera(
        25, // Much smaller FOV for more parallel/orthographic-like view
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
      );
      updateCameraPosition();

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.value.appendChild(renderer.domElement);

      // Create the cocktail machine
      createCocktailMachine();

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Add ground plane to receive shadows
      const planeGeometry = new THREE.PlaneGeometry(20, 15);
      const planeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2c2c2c,
        transparent: true,
        opacity: 0.8
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = 0;
      plane.receiveShadow = true;
      scene.add(plane);

      // Event listeners for mouse interaction
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('mouseleave', onMouseUp);

      // Event listeners for touch interaction
      renderer.domElement.addEventListener('touchstart', onTouchStart);
      renderer.domElement.addEventListener('touchmove', onTouchMove);
      renderer.domElement.addEventListener('touchend', onTouchEnd);

      // Prevent context menu on right click
      renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

      animate();
    };

    const createCocktailMachine = () => {
      // Create main group for the entire machine
      machineGroup = new THREE.Group();
      
      // Number of modules on each side
      const modulesPerSide = 8;
      
      // Materials for the side modules
      const moduleMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e }); // Slightly lighter for modules
      const towerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x7f8c8d, // Gray for towers
        transparent: true,
        opacity: 0.6 // Make towers more transparent to let light through
      });
      
      // Load the main machine component from GLTF
      const loader = new GLTFLoader();
      loader.load(
        '/models/main_module.glb', // Your exported main module file
        (gltf) => {
          const mainComponent = gltf.scene;
          
          // Scale and position the loaded model as needed
          mainComponent.scale.setScalar(.1); // Adjust scale if needed
          mainComponent.position.set(0, 0, 0); // Adjust position if needed
          
          // Enable shadows for all meshes in the model
          mainComponent.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          machineGroup.add(mainComponent);
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading GLTF model:', error);
          // Fallback: create a simple cube if model fails to load
          const fallbackGeometry = new THREE.BoxGeometry(2, 3, 1.5);
          const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
          const fallbackComponent = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
          fallbackComponent.position.y = 1.5;
          fallbackComponent.castShadow = true;
          machineGroup.add(fallbackComponent);
        }
      );
      
      // Create modules on both sides
      for (let side = 0; side < 2; side++) {
        const sideMultiplier = side === 0 ? -1 : 1; // Left side: -1, Right side: 1
        
        for (let i = 0; i < modulesPerSide; i++) {
          const moduleGroup = new THREE.Group();
          
          // Position modules next to the main component
          // First module (i=0) starts at distance 1.5 from center, others are spaced 0.6 apart
          const moduleX = sideMultiplier * (1.5 + i * 0.6);
          
          // Create one tower per module
          const towerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
          const towerMesh = new THREE.Mesh(towerGeometry, towerMaterial);
          
          // Position tower in the center of the module
          towerMesh.position.set(moduleX, 1.25, 0);
          towerMesh.castShadow = true;
          
          moduleGroup.add(towerMesh);
          
          // Add light strip inside the tower
          const lightStripGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8);
          const lightStripMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff, // Cyan color for the light strip
            emissive: 0x00aaaa, // Much brighter glow
            transparent: true,
            opacity: 1.0 // Full opacity for brighter appearance
          });
          const lightStrip = new THREE.Mesh(lightStripGeometry, lightStripMaterial);
          lightStrip.position.set(moduleX, 1.25, 0);
          
          moduleGroup.add(lightStrip);
          
          // Add point light inside the tower for actual illumination
          const pointLight = new THREE.PointLight(0x00ffff, 1.2, 4); // Much brighter and wider range
          pointLight.position.set(moduleX, 1.25, 0);
          moduleGroup.add(pointLight);
          
          // Add a small base platform for each module
          const baseGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.8);
          const baseMesh = new THREE.Mesh(baseGeometry, moduleMaterial);
          baseMesh.position.set(moduleX, 0.1, 0);
          baseMesh.castShadow = true;
          moduleGroup.add(baseMesh);
          
          machineGroup.add(moduleGroup);
        }
      }
      
      // Position the entire machine group
      machineGroup.position.y = 0;
      scene.add(machineGroup);
    };

    const updateCameraPosition = () => {
      // Convert spherical coordinates to Cartesian
      const x = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
      const y = cameraRadius * Math.cos(cameraPhi);
      const z = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
      
      camera.position.set(x, y, z);
      camera.lookAt(cameraTarget);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Machine stays fixed, no rotation

      renderer.render(scene, camera);
    };

    // Mouse event handlers
    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;

      // Update camera orbital angle (only horizontal rotation)
      cameraTheta += deltaX * 0.01;
      
      updateCameraPosition();

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    // Touch event handlers
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isMouseDown = true;
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isMouseDown || event.touches.length !== 1) return;

      event.preventDefault();
      const deltaX = event.touches[0].clientX - mouseX;

      // Update camera orbital angle (only horizontal rotation)
      cameraTheta += deltaX * 0.01;
      
      updateCameraPosition();

      mouseX = event.touches[0].clientX;
      mouseY = event.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isMouseDown = false;
    };

    // Zoom with mouse wheel
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = .4;
      
      if (event.deltaY > 0 && cameraRadius < 20) {
        // Zoom out
        cameraRadius += zoomSpeed;
      } else if (event.deltaY < 0 && cameraRadius > 15) {
        // Zoom in
        cameraRadius -= zoomSpeed;
      }
      
      updateCameraPosition();
    };

    // Handle window resize
    const onWindowResize = () => {
      if (!container.value) return;

      camera.aspect = container.value.clientWidth / container.value.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    };

    onMounted(() => {
      init();
      window.addEventListener('resize', onWindowResize);
    });

    onBeforeUnmount(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (renderer) {
        renderer.dispose();
      }
      window.removeEventListener('resize', onWindowResize);
    });

    return {
      container,
      onWheel,
    };
  },
});
</script>

<style scoped>
.threejs-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
}

.threejs-container:active {
  cursor: grabbing;
}
</style>
