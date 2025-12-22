import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RaceTrack from '@/components/RaceTrack.vue'
import racesModule from '@/store/modules/races.js'
import horsesModule from '@/store/modules/horses.js'

describe('RaceTrack Component', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      modules: {
        horses: {
          ...horsesModule,
          state: () => ({ horses: [] })
        },
        races: racesModule
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.race-track').exists()).toBe(true)
      expect(wrapper.find('.track-container').exists()).toBe(true)
    })

    it('should render 10 lanes', () => {
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      const lanes = wrapper.findAll('.lane')
      expect(lanes).toHaveLength(10)
    })

    it('should display lane numbers 1-10', () => {
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      const laneNumbers = wrapper.findAll('.lane-number')
      expect(laneNumbers).toHaveLength(10)
      expect(laneNumbers[0].text()).toBe('1')
      expect(laneNumbers[9].text()).toBe('10')
    })

    it('should render finish line', () => {
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.finish-line').exists()).toBe(true)
    })
  })

  describe('Lane Active State', () => {
    it('should not mark lanes as active when no round data', () => {
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      const activeLanes = wrapper.findAll('.lane.active')
      expect(activeLanes).toHaveLength(0)
    })

    it('should mark lanes as active based on number of horses', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const activeLanes = wrapper.findAll('.lane.active')
      expect(activeLanes.length).toBeGreaterThan(0)
      expect(activeLanes.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Horse Display', () => {
    it('should not display horses when no round data', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: {
            ...racesModule,
            state: () => ({
              raceSchedule: [],
              currentRound: null,
              raceInProgress: false,
              racePaused: false,
              raceFinished: false,
              raceResults: [],
              trackPositions: {},
              exactPositions: {},
              raceSimulationRunning: false
            })
          }
        }
      })
      
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      const horses = wrapper.findAll('.horse')
      expect(horses).toHaveLength(0)
    })

    it('should display horses when round data exists', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const displayedHorses = wrapper.findAll('.horse')
      expect(displayedHorses.length).toBeGreaterThan(0)
      expect(displayedHorses.length).toBeLessThanOrEqual(10)
    })

    it('should display horse icon', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const horseIcon = wrapper.find('.horse-icon')
      expect(horseIcon.exists()).toBe(true)
    })
  })

  describe('Methods', () => {
    it('isLaneActive should return false when no round data', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: {
            ...racesModule,
            state: () => ({
              raceSchedule: [],
              currentRound: null,
              raceInProgress: false,
              racePaused: false,
              raceFinished: false,
              raceResults: [],
              trackPositions: {},
              exactPositions: {},
              raceSimulationRunning: false
            })
          }
        }
      })
      
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })
      
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isLaneActive(1)).toBe(false)
    })

    it('isLaneActive should return true for active lanes', async () => {
      const testStore = createStore({
        modules: {
          horses: horsesModule,
          races: racesModule
        }
      })
      
      testStore.commit('horses/GENERATE_HORSES', 20)
      const horses = testStore.state.horses.horses
      testStore.commit('races/GENERATE_RACE_SCHEDULE', horses)
      testStore.commit('races/SET_CURRENT_ROUND', 0)

      const testWrapper = mount(RaceTrack, {
        global: {
          plugins: [testStore]
        }
      })

      await testWrapper.vm.$nextTick()

      expect(testWrapper.vm.isLaneActive(1)).toBe(true)
      expect(testWrapper.vm.isLaneActive(10)).toBe(true)
      expect(testWrapper.vm.isLaneActive(11)).toBe(false)
      
      testWrapper.unmount()
    })

    it('getHorseInLane should return null when no round data', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: {
            ...racesModule,
            state: () => ({
              raceSchedule: [],
              currentRound: null,
              raceInProgress: false,
              racePaused: false,
              raceFinished: false,
              raceResults: [],
              trackPositions: {},
              exactPositions: {},
              raceSimulationRunning: false
            })
          }
        }
      })
      
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })
      
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.getHorseInLane(1)).toBeNull()
    })

    it('getHorseInLane should return horse for valid lane', async () => {
      const testStore = createStore({
        modules: {
          horses: horsesModule,
          races: racesModule
        }
      })
      
      testStore.commit('horses/GENERATE_HORSES', 20)
      const horses = testStore.state.horses.horses
      testStore.commit('races/GENERATE_RACE_SCHEDULE', horses)
      testStore.commit('races/SET_CURRENT_ROUND', 0)

      const testWrapper = mount(RaceTrack, {
        global: {
          plugins: [testStore]
        }
      })

      await testWrapper.vm.$nextTick()

      const horse = testWrapper.vm.getHorseInLane(1)
      expect(horse).toBeTruthy()
      expect(horse).toHaveProperty('id')
      expect(horse).toHaveProperty('name')
      expect(horse).toHaveProperty('color')
      
      testWrapper.unmount()
    })

    it('getHorseStyle should return null when no horse in lane', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: {
            ...racesModule,
            state: () => ({
              raceSchedule: [],
              currentRound: null,
              raceInProgress: false,
              racePaused: false,
              raceFinished: false,
              raceResults: [],
              trackPositions: {},
              exactPositions: {},
              raceSimulationRunning: false
            })
          }
        }
      })
      
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })
      
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.horseStyles[1]).toBeUndefined()
    })

    it('getHorseStyle should return style with position and color', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)
      
      const round = store.state.races.raceSchedule[0]
      store.commit('races/UPDATE_HORSE_POSITION', { 
        horseId: round.horses[0].id, 
        position: 50 
      })

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const style = wrapper.vm.horseStyles[1]
      expect(style).toBeTruthy()
      expect(style.left).toBe('50%')
      expect(style['--horse-color']).toBeTruthy()
      expect(style['--horse-color']).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  describe('Track Info', () => {
    it('should not display track info when no round data', async () => {
      const emptyStore = createStore({
        modules: {
          horses: {
            ...horsesModule,
            state: () => ({ horses: [] })
          },
          races: {
            ...racesModule,
            state: () => ({
              raceSchedule: [],
              currentRound: null,
              raceInProgress: false,
              racePaused: false,
              raceFinished: false,
              raceResults: [],
              trackPositions: {},
              exactPositions: {},
              raceSimulationRunning: false
            })
          }
        }
      })
      
      wrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      const trackInfo = wrapper.find('.track-info span')
      expect(trackInfo.exists()).toBe(false)
    })

    it('should display track info with round and distance', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const trackInfo = wrapper.find('.track-info span')
      expect(trackInfo.exists()).toBe(true)
      expect(trackInfo.text()).toContain('1st Lap')
      expect(trackInfo.text()).toContain('1200m')
    })
  })

  describe('Position Updates', () => {
    it('should update horse position when trackPositions change', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      store.commit('races/SET_CURRENT_ROUND', 0)

      wrapper = mount(RaceTrack, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const round = store.state.races.raceSchedule[0]
      const horseId = round.horses[0].id
      
      let style = wrapper.vm.horseStyles[1]
      expect(style).toBeTruthy()
      expect(style.left).toBe('0%')
      
      store.commit('races/UPDATE_HORSE_POSITION', { horseId, position: 75 })
      await wrapper.vm.$nextTick()

      style = wrapper.vm.horseStyles[1]
      expect(style).toBeTruthy()
      expect(style.left).toBe('75%')
    })
  })
})