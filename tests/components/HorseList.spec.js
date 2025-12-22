import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import HorseList from '@/components/HorseList.vue'
import horsesModule from '@/store/modules/horses.js'

describe('HorseList Component', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      modules: {
        horses: horsesModule
      }
    })
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.horse-list').exists()).toBe(true)
      expect(wrapper.find('.horse-list-header').exists()).toBe(true)
    })

    it('should display the header text', () => {
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.horse-list-header h2').text()).toBe('Horse List (1-20)')
    })

    it('should display table headers', () => {
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      const headers = wrapper.findAll('.horse-list table thead th')
      expect(headers).toHaveLength(3)
      expect(headers[0].text()).toBe('Name')
      expect(headers[1].text()).toBe('Condition')
      expect(headers[2].text()).toBe('Color')
    })
  })

  describe('Horse List Display', () => {
    it('should display empty list when no horses', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          }
        }
      })
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      const rows = wrapper.findAll('.horse-list table tbody tr')
      expect(rows).toHaveLength(0)
    })

    it('should display horses from store', async () => {
      store.commit('horses/GENERATE_HORSES', 5)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('.horse-list table tbody tr')
      expect(rows).toHaveLength(5)
    })

    it('should display horse name, condition, and color', async () => {
      store.commit('horses/GENERATE_HORSES', 1)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const horse = store.state.horses.horses[0]
      const firstRow = wrapper.find('.horse-list table tbody tr')
      
      expect(firstRow.text()).toContain(horse.name)
      expect(firstRow.text()).toContain(horse.condition.toString())
      expect(firstRow.text()).toContain(horse.color)
    })

    it('should display color badge with background color', async () => {
      store.commit('horses/GENERATE_HORSES', 1)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const colorBadge = wrapper.find('.color-badge')
      expect(colorBadge.exists()).toBe(true)
      expect(colorBadge.attributes('style')).toContain('background-color')
    })

    it('should display all 20 horses when generated', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('.horse-list table tbody tr')
      expect(rows).toHaveLength(20)
    })
  })

  describe('Color Value Method', () => {
    it('should use getColorValue method from utility', async () => {
      store.commit('horses/GENERATE_HORSES', 1)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const horse = store.state.horses.horses[0]
      const colorValue = wrapper.vm.getColorValue(horse.color)
      
      expect(colorValue).toBeTruthy()
      expect(colorValue).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('should apply correct color to badge', async () => {
      store.commit('horses/GENERATE_HORSES', 1)
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const horse = store.state.horses.horses[0]
      const colorValue = wrapper.vm.getColorValue(horse.color)
      const colorBadge = wrapper.find('.color-badge')
      const style = colorBadge.attributes('style')
      
      expect(style).toContain('background-color')
      expect(colorValue).toBeTruthy()
    })
  })

  describe('Reactivity', () => {
    it('should update when horses are added to store', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          }
        }
      })
      
      wrapper = mount(HorseList, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.horse-list table tbody tr')).toHaveLength(0)

      emptyStore.commit('horses/GENERATE_HORSES', 3)
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.horse-list table tbody tr')).toHaveLength(3)
    })
  })
})