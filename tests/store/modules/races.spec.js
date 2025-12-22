import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStore } from 'vuex'
import racesModule from '@/store/modules/races.js'
import horsesModule from '@/store/modules/horses.js'

describe('Races Module', () => {
  let store

  beforeEach(() => {
    vi.useFakeTimers()
    store = createStore({
      modules: {
        horses: horsesModule,
        races: racesModule
      }
    })
    
    store.commit('horses/GENERATE_HORSES', 20)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('State', () => {
    it('should initialize with correct default state', () => {
      expect(store.state.races.raceSchedule).toEqual([])
      expect(store.state.races.currentRound).toBeNull()
      expect(store.state.races.raceInProgress).toBe(false)
      expect(store.state.races.racePaused).toBe(false)
      expect(store.state.races.raceFinished).toBe(false)
      expect(store.state.races.raceResults).toEqual([])
      expect(store.state.races.trackPositions).toEqual({})
      expect(store.state.races.exactPositions).toEqual({})
      expect(store.state.races.raceSimulationRunning).toBe(false)
    })
  })

  describe('Mutations - GENERATE_RACE_SCHEDULE', () => {
    it('should generate 6 rounds', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      expect(store.state.races.raceSchedule).toHaveLength(6)
    })

    it('should have correct distances for each round', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
      store.state.races.raceSchedule.forEach((round, index) => {
        expect(round.distance).toBe(expectedDistances[index])
        expect(round.round).toBe(index + 1)
      })
    })

    it('should select 10 horses per round', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      store.state.races.raceSchedule.forEach(round => {
        expect(round.horses).toHaveLength(10)
      })
    })

    it('should initialize rounds with completed: false', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      store.state.races.raceSchedule.forEach(round => {
        expect(round.completed).toBe(false)
        expect(round.results).toEqual([])
      })
    })

    it('should reset race state when generating schedule', () => {
      const horses = store.state.horses.horses
      
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/START_RACE')
      store.commit('races/SET_CURRENT_ROUND', 0)
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: 1, position: 50 })
      store.commit('races/COMPLETE_ROUND', 0)
      store.commit('races/COMPLETE_ALL_RACES')
      
      expect(store.state.races.raceInProgress).toBe(false)
      expect(store.state.races.raceFinished).toBe(true)
      expect(store.state.races.trackPositions[1]).toBe(50)
      expect(store.state.races.raceSchedule[0].completed).toBe(true)
      
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      expect(store.state.races.currentRound).toBeNull()
      expect(store.state.races.raceFinished).toBe(false)
      expect(store.state.races.raceInProgress).toBe(false)
      expect(store.state.races.racePaused).toBe(false)
      expect(store.state.races.raceSimulationRunning).toBe(false)
      expect(store.state.races.raceResults).toEqual([])
      expect(store.state.races.trackPositions).toEqual({})
      expect(store.state.races.exactPositions).toEqual({})
      
      store.state.races.raceSchedule.forEach(round => {
        expect(round.completed).toBe(false)
        expect(round.results).toEqual([])
      })
    })
  })

  describe('Mutations - START_RACE', () => {
    it('should set raceInProgress to true', () => {
      store.commit('races/START_RACE')
      
      expect(store.state.races.raceInProgress).toBe(true)
      expect(store.state.races.racePaused).toBe(false)
    })

    it('should set currentRound to 0 if null', () => {
      store.commit('races/START_RACE')
      
      expect(store.state.races.currentRound).toBe(0)
    })

    it('should not change currentRound if already set', () => {
      store.commit('races/SET_CURRENT_ROUND', 2)
      store.commit('races/START_RACE')
      
      expect(store.state.races.currentRound).toBe(2)
    })
  })

  describe('Mutations - PAUSE_RACE', () => {
    it('should toggle racePaused from false to true', () => {
      expect(store.state.races.racePaused).toBe(false)
      
      store.commit('races/PAUSE_RACE')
      
      expect(store.state.races.racePaused).toBe(true)
    })

    it('should toggle racePaused from true to false', () => {
      store.state.races.racePaused = false
      
      expect(store.state.races.racePaused).toBe(false)
      store.commit('races/PAUSE_RACE')
      expect(store.state.races.racePaused).toBe(true)
      
      store.commit('races/PAUSE_RACE')
      expect(store.state.races.racePaused).toBe(false)
    })
  })

  describe('Mutations - UPDATE_HORSE_POSITION', () => {
    it('should update horse position', () => {
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: 1, position: 50 })
      
      expect(store.state.races.trackPositions[1]).toBe(50)
    })

    it('should clamp position to 0-100', () => {
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: 1, position: -10 })
      expect(store.state.races.trackPositions[1]).toBe(0)
      
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: 1, position: 150 })
      expect(store.state.races.trackPositions[1]).toBe(100)
    })
  })

  describe('Mutations - COMPLETE_ROUND', () => {
    it('should mark round as completed and generate results', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      const round = store.state.races.raceSchedule[0]
      round.horses.forEach((horse, index) => {
        store.commit('races/UPDATE_HORSE_POSITION', { 
          horseId: horse.id, 
          position: 100 - index * 5 
        })
      })
      
      store.commit('races/COMPLETE_ROUND', 0)
      
      expect(round.completed).toBe(true)
      expect(round.results).toHaveLength(10)
      expect(round.results[0].position).toBe(1)
    })

    it('should sort results by position (highest first)', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      const round = store.state.races.raceSchedule[0]
      round.horses.forEach((horse, index) => {
        store.commit('races/UPDATE_HORSE_POSITION', { 
          horseId: horse.id, 
          position: index * 10 
        })
      })
      
      store.commit('races/COMPLETE_ROUND', 0)
      
      expect(round.results[0].horseId).toBe(round.horses[9].id)
      expect(round.results[9].horseId).toBe(round.horses[0].id)
    })
  })

  describe('Actions - generateRaceSchedule', () => {
    it('should generate race schedule from horses', async () => {
      const horses = store.state.horses.horses
      await store.dispatch('races/generateRaceSchedule', null, { root: true })
      
      expect(store.state.races.raceSchedule).toHaveLength(6)
    })

    it('should throw error if no horses available', () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: racesModule
        }
      })
      
      expect(emptyStore.state.horses.horses).toHaveLength(0)
      
      expect(() => {
        emptyStore.dispatch('races/generateRaceSchedule', null, { root: true })
      }).toThrow('Horses must be generated first')
    })
  })

  describe('Actions - startRace', () => {
    it('should start race if not in progress', async () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      await store.dispatch('races/startRace', null, { root: true })
      
      expect(store.state.races.raceInProgress).toBe(true)
    })

    it('should resume race if paused', async () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/START_RACE')
      store.commit('races/PAUSE_RACE')
      
      await store.dispatch('races/startRace', null, { root: true })
      
      expect(store.state.races.racePaused).toBe(false)
    })
  })

  describe('Actions - pauseRace', () => {
    it('should toggle pause state', async () => {
      await store.dispatch('races/pauseRace', null, { root: true })
      
      expect(store.state.races.racePaused).toBe(true)
    })
  })

  describe('Getters', () => {
    it('raceSchedule should return schedule', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      const schedule = store.getters['races/raceSchedule']
      
      expect(schedule).toHaveLength(6)
    })

    it('currentRoundData should return current round data', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)
      
      const roundData = store.getters['races/currentRoundData']
      
      expect(roundData).toBeTruthy()
      expect(roundData.round).toBe(1)
      expect(roundData.distance).toBe(1200)
    })

    it('currentRoundData should return null if no current round', () => {
      store.state.races.currentRound = null
      store.state.races.raceSchedule = []
      
      const roundData = store.getters['races/currentRoundData']
      
      expect(roundData).toBeNull()
    })

    it('trackPositions should return positions', () => {
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: 1, position: 50 })
      
      const positions = store.getters['races/trackPositions']
      
      expect(positions[1]).toBe(50)
    })
  })

  describe('Race Simulation Logic', () => {
    it('should initialize positions when starting a round', () => {
      const horses = store.state.horses.horses
      store.state.races.trackPositions = {}
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)
      
      const round = store.state.races.raceSchedule[0]
      round.horses.forEach(horse => {
        expect(store.state.races.trackPositions[horse.id]).toBe(0)
      })
    })

    it('should preserve positions when resuming', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)
      
      const round = store.state.races.raceSchedule[0]
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: round.horses[0].id, position: 50 })
      
      store.commit('races/SET_CURRENT_ROUND', 0)
      
      expect(store.state.races.trackPositions[round.horses[0].id]).toBe(50)
    })

    it('should reset positions for new round', () => {
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      store.commit('races/SET_CURRENT_ROUND', 0)
      const round0 = store.state.races.raceSchedule[0]
      store.commit('races/UPDATE_HORSE_POSITION', { horseId: round0.horses[0].id, position: 50 })
      
      store.commit('races/RESET_ROUND_POSITIONS', 1)
      const round1 = store.state.races.raceSchedule[1]
      round1.horses.forEach(horse => {
        expect(store.state.races.trackPositions[horse.id]).toBe(0)
      })
    })
  })
})