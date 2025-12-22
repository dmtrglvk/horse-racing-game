import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import App from '@/App.vue'
import horsesModule from '@/store/modules/horses.js'
import racesModule from '@/store/modules/races.js'

describe('App Component', () => {
  let testStore
  let wrapper

  beforeEach(() => {
    testStore = createStore({
      modules: {
        horses: {
          ...horsesModule,
          state: () => ({ horses: [] })
        },
        races: racesModule
      },
      actions: {
        generateRaceSchedule({ dispatch, state }) {
          if (state.horses.horses.length === 0) {
            return dispatch('horses/generateHorses', 20, { root: true })
              .then(() => dispatch('races/generateRaceSchedule', null, { root: true }))
          }
          return dispatch('races/generateRaceSchedule', null, { root: true })
        }
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
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      expect(wrapper.find('.app').exists()).toBe(true)
    })

    it('should display header with title', () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      expect(wrapper.find('.app-header h1').text()).toBe('Horse Racing')
    })

    it('should render control buttons', () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      expect(wrapper.find('.btn-generate').exists()).toBe(true)
      expect(wrapper.find('.btn-start').exists()).toBe(true)
    })

    it('should render all three panels', () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      expect(wrapper.find('.left-panel').exists()).toBe(true)
      expect(wrapper.find('.center-panel').exists()).toBe(true)
      expect(wrapper.find('.right-panel').exists()).toBe(true)
    })

    it('should render child components', () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      expect(wrapper.find('.left-panel').exists()).toBe(true)
      expect(wrapper.find('.center-panel').exists()).toBe(true)
      expect(wrapper.find('.right-panel').exists()).toBe(true)
      
      expect(wrapper.find('.horse-list').exists()).toBe(true)
      expect(wrapper.find('.race-track').exists()).toBe(true)
      expect(wrapper.find('.program-results').exists()).toBe(true)
    })
  })

  describe('Button States', () => {
    it('should disable START button when no schedule', () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      const startButton = wrapper.find('.btn-start')
      expect(startButton.attributes('disabled')).toBeDefined()
    })

    it('should enable START button after generating schedule', async () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      testStore.dispatch('generateRaceSchedule')
      await wrapper.vm.$nextTick()

      const startButton = wrapper.find('.btn-start')
      expect(startButton.attributes('disabled')).toBeUndefined()
    })

    it('should disable GENERATE PROGRAM button when race is in progress', async () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      testStore.dispatch('generateRaceSchedule')
      testStore.commit('races/START_RACE')
      await wrapper.vm.$nextTick()

      const generateButton = wrapper.find('.btn-generate')
      expect(generateButton.attributes('disabled')).toBeDefined()
    })

    it('should show START text when race is not in progress', async () => {
      const freshStore = createStore({
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
        },
        actions: {
          generateRaceSchedule({ dispatch, state }) {
            if (state.horses.horses.length === 0) {
              return dispatch('horses/generateHorses', 20, { root: true })
                .then(() => dispatch('races/generateRaceSchedule', null, { root: true }))
            }
            return dispatch('races/generateRaceSchedule', null, { root: true })
          }
        }
      })
      
      wrapper = mount(App, {
        global: {
          plugins: [freshStore]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      await wrapper.vm.$nextTick()

      const startButton = wrapper.find('.btn-start')
      expect(startButton.exists()).toBe(true)
      expect(startButton.text()).toBe('START')
    })

    it('should show PAUSE text when race is in progress and not paused', async () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      testStore.dispatch('generateRaceSchedule')
      testStore.commit('races/START_RACE')
      await wrapper.vm.$nextTick()

      const startButton = wrapper.find('.btn-start')
      expect(startButton.text()).toBe('PAUSE')
    })

    it('should hide START button when race is finished', async () => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      testStore.commit('races/COMPLETE_ALL_RACES')
      await wrapper.vm.$nextTick()

      const startButton = wrapper.find('.btn-start')
      expect(startButton.exists()).toBe(false)
    })
  })

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })
    })

    it('hasSchedule should return false when no schedule', async () => {
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
        },
        actions: {
          generateRaceSchedule({ dispatch, state }) {
            if (state.horses.horses.length === 0) {
              return dispatch('horses/generateHorses', 20, { root: true })
                .then(() => dispatch('races/generateRaceSchedule', null, { root: true }))
            }
            return dispatch('races/generateRaceSchedule', null, { root: true })
          }
        }
      })

      wrapper = mount(App, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      await wrapper.vm.$nextTick()
      
      expect(emptyStore.state.races.raceSchedule).toHaveLength(0)
      expect(wrapper.vm.hasSchedule).toBe(false)
    })

    it('hasSchedule should return true when schedule exists', async () => {
      testStore.dispatch('generateRaceSchedule')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasSchedule).toBe(true)
    })

    it('generateProgram should dispatch generateRaceSchedule', async () => {
      const dispatchSpy = vi.spyOn(testStore, 'dispatch')
      
      wrapper.vm.generateProgram()
      await wrapper.vm.$nextTick()

      expect(dispatchSpy).toHaveBeenCalledWith('generateRaceSchedule')
    })

    it('toggleRace should pause when race is in progress', async () => {
      testStore.dispatch('generateRaceSchedule')
      testStore.commit('races/START_RACE')
      await wrapper.vm.$nextTick()

      const pauseSpy = vi.spyOn(wrapper.vm, 'pauseRace')
      wrapper.vm.toggleRace()

      expect(pauseSpy).toHaveBeenCalled()
    })

    it('toggleRace should start when race is not in progress', async () => {
      testStore.dispatch('generateRaceSchedule')
      await wrapper.vm.$nextTick()

      const startSpy = vi.spyOn(wrapper.vm, 'startRace')
      wrapper.vm.toggleRace()

      expect(startSpy).toHaveBeenCalled()
    })
  })

  describe('Lifecycle', () => {
    it('should generate horses on mount', async () => {
      const dispatchSpy = vi.spyOn(testStore, 'dispatch')
      
      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      await wrapper.vm.$nextTick()

      expect(dispatchSpy).toHaveBeenCalledWith('horses/generateHorses', 20)
    })
  })

  describe('User Interactions', () => {
    it('should call generateProgram when GENERATE PROGRAM button is clicked', async () => {
      const freshStore = createStore({
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
        },
        actions: {
          generateRaceSchedule({ dispatch, state }) {
            if (state.horses.horses.length === 0) {
              return dispatch('horses/generateHorses', 20, { root: true })
                .then(() => dispatch('races/generateRaceSchedule', null, { root: true }))
            }
            return dispatch('races/generateRaceSchedule', null, { root: true })
          }
        }
      })
      
      wrapper = mount(App, {
        global: {
          plugins: [freshStore]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      await wrapper.vm.$nextTick()

      const generateProgramSpy = vi.spyOn(wrapper.vm, 'generateProgram')
      const generateButton = wrapper.find('.btn-generate')
      
      expect(generateButton.exists()).toBe(true)
      expect(freshStore.state.races.raceInProgress).toBe(false)
      
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(generateProgramSpy).toHaveBeenCalled()
    })

    it('should call toggleRace when START/PAUSE button is clicked', async () => {
      testStore.dispatch('generateRaceSchedule')
      await wrapper.vm.$nextTick()

      wrapper = mount(App, {
        global: {
          plugins: [testStore]
        }
      })

      const toggleRaceSpy = vi.spyOn(wrapper.vm, 'toggleRace')
      const startButton = wrapper.find('.btn-start')
      
      await startButton.trigger('click')

      expect(toggleRaceSpy).toHaveBeenCalled()
    })
  })
})