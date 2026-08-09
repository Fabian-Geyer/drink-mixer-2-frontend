import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import App from './App.vue'

describe('App', () => {
  it('redirects to the order page and renders the nav bar', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.get('h1').text()).toBe('Order')
    expect(wrapper.get('nav').text()).toContain('Barkeeper')
  })
})
