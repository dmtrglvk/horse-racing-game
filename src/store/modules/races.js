import { RACE_CONFIG, ANIMATION_CONFIG } from '@/config/constants.js'
import { createRaceAnimation } from '@/services/raceAnimationService.js'
import { shuffleArray } from '@/utils/shuffle.js'

let currentAnimationController = null
let roundTimeoutId = null

function clearRoundTimeout() {
  if (roundTimeoutId !== null) {
    clearTimeout(roundTimeoutId)
    roundTimeoutId = null
  }
}

function cleanupAnimation() {
  clearRoundTimeout()
  if (currentAnimationController) {
    currentAnimationController.stop()
    currentAnimationController = null
  }
}

export default {
  namespaced: true,
  state: {
    raceSchedule: [],
    currentRound: null,
    raceInProgress: false,
    racePaused: false,
    raceFinished: false,
    raceResults: [],
    trackPositions: {},
    exactPositions: {},
    raceSimulationRunning: false
  },
  mutations: {
    GENERATE_RACE_SCHEDULE(state, horses) {
      const rounds = RACE_CONFIG.ROUND_DISTANCES.map((distance, index) => ({
        round: index + 1,
        distance
      }))
      
      state.raceSchedule = rounds.map(round => {
        const shuffled = shuffleArray(horses)
        const selectedHorses = shuffled
          .slice(0, RACE_CONFIG.HORSES_PER_ROUND)
          .map((horse) => ({
            ...horse,
            position: 0
          }))
        
        return {
          ...round,
          horses: selectedHorses,
          completed: false,
          results: []
        }
      })
      
      state.raceResults = []
      state.currentRound = null
      state.raceFinished = false
      state.raceInProgress = false
      state.racePaused = false
      state.raceSimulationRunning = false
      state.trackPositions = {}
      state.exactPositions = {}
      
      cleanupAnimation()
    },
    
    START_RACE(state) {
      state.raceInProgress = true
      state.racePaused = false
      if (state.currentRound === null) {
        state.currentRound = 0
      }
    },
    
    PAUSE_RACE(state) {
      state.racePaused = !state.racePaused
    },
    
    SET_CURRENT_ROUND(state, roundIndex) {
      state.currentRound = roundIndex
      if (state.raceSchedule[roundIndex]) {
        state.raceSchedule[roundIndex].horses.forEach(horse => {
          if (state.trackPositions[horse.id] === undefined) {
            state.exactPositions[horse.id] = 0
            state.trackPositions[horse.id] = 0
          }
        })
      }
    },
    
    RESET_ROUND_POSITIONS(state, roundIndex) {
      if (state.raceSchedule[roundIndex]) {
        state.raceSchedule[roundIndex].horses.forEach(horse => {
          state.trackPositions[horse.id] = 0
          state.exactPositions[horse.id] = 0
        })
      }
    },
    
    INITIALIZE_HORSE_POSITIONS(state, horseIds) {
      horseIds.forEach(horseId => {
        if (state.trackPositions[horseId] === undefined) {
          state.exactPositions[horseId] = 0
          state.trackPositions[horseId] = 0
        }
      })
    },
    
    SET_RACE_SIMULATION_RUNNING(state, running) {
      state.raceSimulationRunning = running
    },
    
    UPDATE_HORSE_POSITION(state, { horseId, position }) {
      state.exactPositions[horseId] = position
      state.trackPositions[horseId] = Math.min(
        ANIMATION_CONFIG.MAX_POSITION,
        Math.max(ANIMATION_CONFIG.MIN_POSITION, position)
      )
    },
    
    COMPLETE_ROUND(state, roundIndex) {
      const round = state.raceSchedule[roundIndex]
      if (!round) {
        return
      }
      
      const sortedHorses = [...round.horses].sort((a, b) => {
        return (state.exactPositions[b.id] || 0) - (state.exactPositions[a.id] || 0)
      })
      
      round.results = sortedHorses.map((horse, index) => ({
        position: index + 1,
        name: horse.name,
        horseId: horse.id
      }))
      
      round.completed = true
      state.raceResults[roundIndex] = round.results
    },
    
    COMPLETE_ALL_RACES(state) {
      state.raceInProgress = false
      state.racePaused = false
      state.currentRound = null
      state.raceSimulationRunning = false
      state.raceFinished = true
      
      cleanupAnimation()
    }
  },
  actions: {
    generateRaceSchedule({ commit, rootState }) {
      const horses = rootState.horses.horses
      if (horses.length === 0) {
        throw new Error('Horses must be generated first')
      }
      commit('GENERATE_RACE_SCHEDULE', horses)
    },
    
    startRace({ commit, dispatch, state }) {
      if (state.raceInProgress && state.racePaused) {
        commit('PAUSE_RACE')
        return
      }
      
      if (!state.raceInProgress) {
        commit('START_RACE')
        dispatch('runNextRound').catch(error => {
          console.error('Error starting race:', error)
          commit('COMPLETE_ALL_RACES')
        })
      }
    },
    
    pauseRace({ commit }) {
      commit('PAUSE_RACE')
    },
    
    async runNextRound({ commit, state, dispatch }) {
      clearRoundTimeout()
      
      if (state.racePaused && state.raceSimulationRunning) {
        roundTimeoutId = setTimeout(() => {
          roundTimeoutId = null
          dispatch('runNextRound').catch(error => {
            console.error('Error in runNextRound:', error)
            commit('COMPLETE_ALL_RACES')
          })
        }, RACE_CONFIG.PAUSE_CHECK_INTERVAL_MS)
        return
      }
      
      if (state.racePaused) {
        roundTimeoutId = setTimeout(() => {
          roundTimeoutId = null
          dispatch('runNextRound').catch(error => {
            console.error('Error in runNextRound:', error)
            commit('COMPLETE_ALL_RACES')
          })
        }, RACE_CONFIG.PAUSE_CHECK_INTERVAL_MS)
        return
      }
      
      if (state.currentRound === null || state.currentRound >= state.raceSchedule.length) {
        commit('COMPLETE_ALL_RACES')
        return
      }
      
      const round = state.raceSchedule[state.currentRound]
      if (!round) {
        commit('COMPLETE_ALL_RACES')
        return
      }
      
      const isNewRound = !round.horses.some(
        h => state.trackPositions[h.id] !== undefined && state.trackPositions[h.id] > 0
      )
      
      if (state.raceSimulationRunning && !isNewRound) {
        return
      }
      
      if (isNewRound) {
        commit('SET_CURRENT_ROUND', state.currentRound)
        commit('RESET_ROUND_POSITIONS', state.currentRound)
      }
      
      try {
        await dispatch('simulateRace', state.currentRound)
        
        commit('COMPLETE_ROUND', state.currentRound)
        
        const nextRound = state.currentRound + 1
        if (nextRound < state.raceSchedule.length) {
          roundTimeoutId = setTimeout(() => {
            roundTimeoutId = null
            commit('SET_CURRENT_ROUND', nextRound)
            commit('RESET_ROUND_POSITIONS', nextRound)
            dispatch('runNextRound').catch(error => {
              console.error('Error in runNextRound:', error)
              commit('COMPLETE_ALL_RACES')
            })
          }, RACE_CONFIG.ROUND_DELAY_MS)
        } else {
          commit('COMPLETE_ALL_RACES')
        }
      } catch (error) {
        console.error('Error running race round:', error)
        commit('COMPLETE_ALL_RACES')
      }
    },
    
    async simulateRace({ commit, state }, roundIndex) {
      const round = state.raceSchedule[roundIndex]
      if (!round) {
        return
      }
      
      commit('SET_RACE_SIMULATION_RUNNING', true)
      
      const horseIds = round.horses.map(horse => horse.id)
      commit('INITIALIZE_HORSE_POSITIONS', horseIds)
      
      cleanupAnimation()
      
      return new Promise((resolve, reject) => {
        try {
          currentAnimationController = createRaceAnimation({
            horses: round.horses,
            distance: round.distance,
            onPositionUpdate: (horseId, position) => {
              commit('UPDATE_HORSE_POSITION', { horseId, position })
            },
            onFinish: () => {
              commit('SET_RACE_SIMULATION_RUNNING', false)
              currentAnimationController = null
              resolve()
            },
            isPaused: () => state.racePaused,
            getCurrentPosition: (horseId) => state.exactPositions[horseId] || 0
          })
          
          currentAnimationController.start()
        } catch (error) {
          cleanupAnimation()
          commit('SET_RACE_SIMULATION_RUNNING', false)
          reject(error)
        }
      })
    },
    
    stopAnimation() {
      cleanupAnimation()
    }
  },
  getters: {
    raceSchedule: (state) => state.raceSchedule,
    currentRound: (state) => state.currentRound,
    raceInProgress: (state) => state.raceInProgress,
    racePaused: (state) => state.racePaused,
    raceFinished: (state) => state.raceFinished,
    raceResults: (state) => state.raceResults,
    trackPositions: (state) => state.trackPositions,
    currentRoundData: (state) => {
      if (state.currentRound === null) {
        return null
      }
      return state.raceSchedule[state.currentRound]
    }
  }
}