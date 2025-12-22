import { describe, it, expect, beforeEach } from 'vitest'
import store from '@/store/index.js'

describe('Store Integration', () => {
  let testStore

  beforeEach(() => {
    testStore = store
  })

  describe('Module Registration', () => {
    it('should register horses module', () => {
      expect(testStore.state.horses).toBeDefined()
      expect(testStore.state.horses.horses).toEqual([])
    })

    it('should register races module', () => {
      expect(testStore.state.races).toBeDefined()
      expect(testStore.state.races.raceSchedule).toEqual([])
    })
  })

  describe('Root Actions', () => {
    it('generateRaceSchedule should generate horses if none exist', async () => {
      await testStore.dispatch('generateRaceSchedule')
      
      expect(testStore.state.horses.horses).toHaveLength(20)
      expect(testStore.state.races.raceSchedule).toHaveLength(6)
    })

    it('generateRaceSchedule should use existing horses', async () => {
      await testStore.dispatch('horses/generateHorses', 20)
      
      await testStore.dispatch('generateRaceSchedule')
      
      expect(testStore.state.horses.horses).toHaveLength(20)
      expect(testStore.state.races.raceSchedule).toHaveLength(6)
    })
  })

  describe('Cross-Module Communication', () => {
    it('races module should access horses from rootState', async () => {
      await testStore.dispatch('horses/generateHorses', 20)
      await testStore.dispatch('races/generateRaceSchedule', null, { root: true })
      
      const schedule = testStore.getters['races/raceSchedule']
      expect(schedule[0].horses).toHaveLength(10)
    })
  })
})

