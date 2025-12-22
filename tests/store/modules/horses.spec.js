import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import horsesModule from '@/store/modules/horses.js'

describe('Horses Module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        horses: horsesModule
      }
    })
  })

  describe('State', () => {
    it('should initialize with empty horses array', () => {
      expect(store.state.horses.horses).toEqual([])
    })
  })

  describe('Mutations', () => {
    it('GENERATE_HORSES should populate horses array', () => {
      store.commit('horses/GENERATE_HORSES', 5)
      
      expect(store.state.horses.horses).toHaveLength(5)
      expect(store.state.horses.horses[0]).toHaveProperty('id')
      expect(store.state.horses.horses[0]).toHaveProperty('name')
      expect(store.state.horses.horses[0]).toHaveProperty('condition')
      expect(store.state.horses.horses[0]).toHaveProperty('color')
    })

    it('GENERATE_HORSES should generate 20 horses', () => {
      store.commit('horses/GENERATE_HORSES', 20)
      
      expect(store.state.horses.horses).toHaveLength(20)
    })

    it('GENERATE_HORSES should assign unique IDs', () => {
      store.commit('horses/GENERATE_HORSES', 10)
      
      const ids = store.state.horses.horses.map(h => h.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(10)
      expect(ids[0]).toBe(1)
      expect(ids[9]).toBe(10)
    })

    it('GENERATE_HORSES should assign valid condition scores', () => {
      store.commit('horses/GENERATE_HORSES', 10)
      
      store.state.horses.horses.forEach(horse => {
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })

    it('GENERATE_HORSES should assign unique colors', () => {
      store.commit('horses/GENERATE_HORSES', 10)
      
      const colors = store.state.horses.horses.map(h => h.color)
      const uniqueColors = new Set(colors)
      
      expect(uniqueColors.size).toBe(10)
    })

    it('GENERATE_HORSES should assign valid color names', () => {
      const validColors = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Pink', 'Cyan', 'Magenta', 'Lime', 'Teal', 'Indigo', 'Brown', 'Grey', 'Black', 'White', 'Coral', 'Gold', 'Silver', 'Navy']
      
      store.commit('horses/GENERATE_HORSES', 20)
      
      store.state.horses.horses.forEach(horse => {
        expect(validColors).toContain(horse.color)
      })
    })
  })

  describe('Actions', () => {
    it('generateHorses should commit GENERATE_HORSES mutation', async () => {
      await store.dispatch('horses/generateHorses', 5)
      
      expect(store.state.horses.horses).toHaveLength(5)
    })

    it('generateHorses should generate correct number of horses', async () => {
      await store.dispatch('horses/generateHorses', 15)
      
      expect(store.state.horses.horses).toHaveLength(15)
    })
  })

  describe('Getters', () => {
    it('horses should return the horses array', () => {
      store.commit('horses/GENERATE_HORSES', 5)
      
      const horses = store.getters['horses/horses']
      
      expect(horses).toHaveLength(5)
      expect(horses).toBe(store.state.horses.horses)
    })

    it('horses should return empty array when no horses generated', () => {
      const freshStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          }
        }
      })
      
      const horses = freshStore.getters['horses/horses']
      
      expect(horses).toEqual([])
    })
  })

  describe('Horse Data Structure', () => {
    it('should generate horses with correct structure', () => {
      store.commit('horses/GENERATE_HORSES', 1)
      
      const horse = store.state.horses.horses[0]
      
      expect(horse).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        condition: expect.any(Number),
        color: expect.any(String)
      })
    })

    it('should have non-empty name', () => {
      store.commit('horses/GENERATE_HORSES', 10)
      
      store.state.horses.horses.forEach(horse => {
        expect(horse.name).toBeTruthy()
        expect(horse.name.length).toBeGreaterThan(0)
      })
    })
  })
})