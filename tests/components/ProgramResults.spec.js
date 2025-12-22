import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ProgramResults from '@/components/ProgramResults.vue'
import racesModule from '@/store/modules/races.js'
import horsesModule from '@/store/modules/horses.js'

describe('ProgramResults Component', () => {
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
      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.program-results').exists()).toBe(true)
    })

    it('should render program and results columns', () => {
      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.program-column').exists()).toBe(true)
      expect(wrapper.find('.results-column').exists()).toBe(true)
    })

    it('should display column headers', () => {
      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      expect(wrapper.find('.program-header').text()).toBe('Program')
      expect(wrapper.find('.results-header').text()).toBe('Results')
    })
  })

  describe('Program Column', () => {
    it('should display empty when no schedule', async () => {
      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()
      const roundSections = wrapper.findAll('.program-column .round-section')
      expect(roundSections).toHaveLength(0)
    })

    it('should display all 6 rounds in program', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const roundSections = wrapper.findAll('.program-column .round-section')
      expect(roundSections).toHaveLength(6)
    })

    it('should display round titles with correct format', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const roundTitles = wrapper.findAll('.program-column .round-title')
      expect(roundTitles[0].text()).toContain('1st Lap - 1200m')
      expect(roundTitles[5].text()).toContain('6th Lap - 2200m')
    })

    it('should display horses in program table', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const firstRoundTable = wrapper.find('.program-column .round-section table')
      expect(firstRoundTable.exists()).toBe(true)
      
      const rows = firstRoundTable.findAll('tbody tr')
      expect(rows).toHaveLength(10)
    })

    it('should display position and name columns in program', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const headers = wrapper.find('.program-column table thead')
      expect(headers.text()).toContain('Position')
      expect(headers.text()).toContain('Name')
    })
  })

  describe('Results Column', () => {
    it('should display "Race in progress..." when no results', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const noResults = wrapper.findAll('.results-column .no-results')
      expect(noResults).toHaveLength(6)
      expect(noResults[0].text()).toBe('Race in progress...')
    })

    it('should display results table when round is completed', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
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

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()
      await wrapper.vm.$forceUpdate()

      const resultsTable = wrapper.find('.results-column .round-section:first-child table')
      expect(resultsTable.exists()).toBe(true)
      
      const firstRoundNoResults = wrapper.find('.results-column .round-section:first-child .no-results')
      expect(firstRoundNoResults.exists()).toBe(false)
    })

    it('should display results with position and name', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
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

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const resultsTable = wrapper.find('.results-column .round-section table')
      const headers = resultsTable.find('thead')
      expect(headers.text()).toContain('Position')
      expect(headers.text()).toContain('Name')

      const rows = resultsTable.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should show results only for completed rounds', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)
      
      const round0 = store.state.races.raceSchedule[0]
      round0.horses.forEach((horse, index) => {
        store.commit('races/UPDATE_HORSE_POSITION', { 
          horseId: horse.id, 
          position: 100 - index * 5 
        })
      })
      store.commit('races/COMPLETE_ROUND', 0)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()

      const resultsTables = wrapper.findAll('.results-column .round-section table')
      expect(resultsTables).toHaveLength(1)

      const noResults = wrapper.findAll('.results-column .round-section .no-results')
      expect(noResults).toHaveLength(5)
    })
  })

  describe('Reactivity', () => {
    it('should update when schedule is generated', async () => {
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
      
      wrapper = mount(ProgramResults, {
        global: {
          plugins: [emptyStore]
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.program-column .round-section')).toHaveLength(0)

      emptyStore.commit('horses/GENERATE_HORSES', 20)
      const horses = emptyStore.state.horses.horses
      emptyStore.commit('races/GENERATE_RACE_SCHEDULE', horses)
      await wrapper.vm.$nextTick()
      await wrapper.vm.$forceUpdate()

      expect(wrapper.findAll('.program-column .round-section')).toHaveLength(6)
    })

    it('should update when round is completed', async () => {
      store.commit('horses/GENERATE_HORSES', 20)
      const horses = store.state.horses.horses
      store.commit('races/GENERATE_RACE_SCHEDULE', horses)

      wrapper = mount(ProgramResults, {
        global: {
          plugins: [store]
        }
      })

      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.results-column .round-section table').exists()).toBe(false)
      
      const round = store.state.races.raceSchedule[0]
      round.horses.forEach((horse, index) => {
        store.commit('races/UPDATE_HORSE_POSITION', { 
          horseId: horse.id, 
          position: 100 - index * 5 
        })
      })
      store.commit('races/COMPLETE_ROUND', 0)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.results-column .round-section table').exists()).toBe(true)
    })
  })
})