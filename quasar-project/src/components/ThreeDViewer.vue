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
    let raycaster: THREE.Raycaster;
    let mouse: THREE.Vector2;
    let interactiveButtons: THREE.Mesh[] = [];

    // Camera orbital controls variables
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let cameraRadius = 20;
    let cameraTheta = Math.PI / 4; // Horizontal angle
    const cameraPhi = Math.PI / 3; // Fixed vertical angle - no longer variable
    const cameraTarget = new THREE.Vector3(0, 0, 0.2);

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

      // Initialize raycaster for mouse interaction
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.value.appendChild(renderer.domElement);

      // Create the cocktail machine
      createCocktailMachine();

      // Add lighting - increased for better global illumination
      const ambientLight = new THREE.AmbientLight(0x606060, 1.2); // Brighter ambient light
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Stronger directional light
      directionalLight.position.set(5, 8, 5);
      directionalLight.castShadow = true;
      // Configure shadow properties for better quality
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
      scene.add(directionalLight);

      // Add additional fill light from the opposite side
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-5, 3, -5);
      fillLight.castShadow = false; // No shadows for fill light
      scene.add(fillLight);

      // Add circular ground plane to receive shadows - larger, dark and reflective
      const circleGeometry = new THREE.CircleGeometry(9, 64); // Larger radius for more presence
      const circleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a, // Very dark gray, almost black
        shininess: 100, // High shininess for reflective effect
        specular: 0x444444, // Specular highlights for reflection
        transparent: false,
        opacity: 1.0
      });
      const circleFloor = new THREE.Mesh(circleGeometry, circleMaterial);
      circleFloor.rotation.x = -Math.PI / 2;
      circleFloor.position.y = 0;
      circleFloor.receiveShadow = true;
      scene.add(circleFloor);

      // Event listeners for mouse interaction
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('mouseleave', onMouseUp);
      renderer.domElement.addEventListener('click', onMouseClick);

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
          
          // Create two directional light strips - front (green) and back (red)
          
          // Front-facing light strip (green)
          const frontLightStripGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8);
          const frontLightStripMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00, // Green color for front-facing strip
            emissive: 0x003300, // Green glow
            transparent: true,
            opacity: 1.0
          });
          const frontLightStrip = new THREE.Mesh(frontLightStripGeometry, frontLightStripMaterial);
          frontLightStrip.position.set(moduleX - 0.08, 1.25, 0); // Offset towards front
          moduleGroup.add(frontLightStrip);
          
          // Back-facing light strip (red)
          const backLightStripGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8);
          const backLightStripMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000, // Red color for back-facing strip
            emissive: 0x330000, // Red glow
            transparent: true,
            opacity: 1.0
          });
          const backLightStrip = new THREE.Mesh(backLightStripGeometry, backLightStripMaterial);
          backLightStrip.position.set(moduleX + 0.08, 1.25, 0); // Offset towards back
          moduleGroup.add(backLightStrip);
          
          // Add simple point lights for illumination (simpler approach)
          const frontPointLight = new THREE.PointLight(0x00ff00, 0.5, 3);
          frontPointLight.position.set(moduleX - 0.08, 1.5, 0.5);
          moduleGroup.add(frontPointLight);
          
          const backPointLight = new THREE.PointLight(0xff0000, 0.5, 3);
          backPointLight.position.set(moduleX + 0.08, 1.5, -0.5);
          moduleGroup.add(backPointLight);
          
          // Create interactive buttons for bottle positions
          const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4CAF50, // Bright green to indicate it's interactive
            emissive: 0x0a1f0a, // Slight green glow
            transparent: true,
            opacity: 0.9
          });
          const buttonHoverMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x66BB6A, // Lighter green for hover
            emissive: 0x0f2f0f,
            transparent: true,
            opacity: 1.0
          });
          
          // Front button (positive Z) - laid flat on ground
          const frontButtonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12);
          const frontButton = new THREE.Mesh(frontButtonGeometry, buttonMaterial.clone());
          frontButton.position.set(moduleX, 0.025, 0.8); // Further away from machine
          // No rotation needed - cylinder is already vertical by default
          frontButton.userData = {
            type: 'bottle-button',
            moduleIndex: i,
            side: side,
            position: 'front',
            drink: null // Will store selected drink
          };
          moduleGroup.add(frontButton);
          interactiveButtons.push(frontButton);
          
          // Back button (negative Z) - laid flat on ground
          const backButtonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12);
          const backButton = new THREE.Mesh(backButtonGeometry, buttonMaterial.clone());
          backButton.position.set(moduleX, 0.025, -0.8); // Further away from machine
          // No rotation needed - cylinder is already vertical by default
          backButton.userData = {
            type: 'bottle-button',
            moduleIndex: i,
            side: side,
            position: 'back',
            drink: null // Will store selected drink
          };
          moduleGroup.add(backButton);
          interactiveButtons.push(backButton);
          
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
      // Handle camera rotation
      if (isMouseDown) {
        const deltaX = event.clientX - mouseX;

        // Update camera orbital angle (only horizontal rotation)
        cameraTheta += deltaX * 0.01;
        
        updateCameraPosition();

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
      
      // Handle button hover effects
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveButtons);

      // Reset all buttons to normal state
      interactiveButtons.forEach(button => {
        const material = button.material as THREE.MeshPhongMaterial;
        const buttonData = button.userData;
        if (buttonData.drink) {
          const drinkColors: Record<string, number> = {
            'Cola': 0x8B4513, // Saddle brown for cola
            'Orange Juice': 0xFF8C00, // Dark orange
            'Water': 0x4169E1, // Royal blue
            'Sprite': 0x32CD32 // Lime green
          };
          material.color.setHex(drinkColors[buttonData.drink] || 0x4CAF50);
          material.emissive.setHex(0x0a0a0a); // Slight glow for selected drinks
        } else {
          material.color.setHex(0x4CAF50); // Bright green for unselected
          material.emissive.setHex(0x0a1f0a); // Green glow
        }
        material.opacity = 0.9;
      });

      // Highlight hovered button
      if (intersects.length > 0) {
        const hoveredButton = intersects[0].object as THREE.Mesh;
        const material = hoveredButton.material as THREE.MeshPhongMaterial;
        material.opacity = 1.0;
        // Make it brighter and add stronger glow
        const currentColor = material.color.getHex();
        material.color.setHex(Math.min(0xffffff, currentColor + 0x333333));
        material.emissive.setHex(0x1a3a1a); // Stronger green glow on hover
        
        // Change cursor to pointer
        renderer.domElement.style.cursor = 'pointer';
      } else {
        // Reset cursor
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    // Handle mouse clicks for button interaction
    const onMouseClick = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(interactiveButtons);

      if (intersects.length > 0) {
        const clickedButton = intersects[0].object as THREE.Mesh;
        const buttonData = clickedButton.userData;
        
        if (buttonData.type === 'bottle-button') {
          onBottleButtonClick(buttonData);
        }
      }
    };

    // Handle bottle button clicks
    const onBottleButtonClick = (buttonData: any) => {
      console.log(`Clicked bottle button:`, {
        moduleIndex: buttonData.moduleIndex,
        side: buttonData.side === 0 ? 'left' : 'right',
        position: buttonData.position,
        currentDrink: buttonData.drink
      });
      
      // Here you can add logic to open a drink selection dialog
      // For now, let's cycle through some example drinks
      const drinks = ['Cola', 'Orange Juice', 'Water', 'Sprite', null];
      const currentIndex = drinks.indexOf(buttonData.drink);
      const nextIndex = (currentIndex + 1) % drinks.length;
      buttonData.drink = drinks[nextIndex];
      
      // Update button color based on selected drink
      updateButtonAppearance(buttonData);
      
      console.log(`Set drink to: ${buttonData.drink || 'None'}`);
    };

    // Update button appearance based on selected drink
    const updateButtonAppearance = (buttonData: any) => {
      // Find the button mesh
      const button = interactiveButtons.find(btn => 
        btn.userData.moduleIndex === buttonData.moduleIndex &&
        btn.userData.side === buttonData.side &&
        btn.userData.position === buttonData.position
      );
      
      if (button) {
        const material = button.material as THREE.MeshPhongMaterial;
        if (buttonData.drink) {
          // Color based on drink type - brighter, more vibrant colors
          const drinkColors: Record<string, number> = {
            'Cola': 0x8B4513, // Saddle brown for cola
            'Orange Juice': 0xFF8C00, // Dark orange
            'Water': 0x4169E1, // Royal blue
            'Sprite': 0x32CD32 // Lime green
          };
          material.color.setHex(drinkColors[buttonData.drink] || 0x4CAF50);
          material.emissive.setHex(0x0a0a0a); // Slight glow for selected drinks
        } else {
          // Bright green when no drink selected to indicate it's clickable
          material.color.setHex(0x4CAF50);
          material.emissive.setHex(0x0a1f0a); // Green glow to show it's interactive
        }
      }
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
