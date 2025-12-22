import { createStore } from 'vuex'
import { RACE_CONFIG } from '@/config/constants.js'
import horses from './modules/horses'
import races from './modules/races'

export default createStore({
  modules: {
    horses,
    races
  },
  
  actions: {
    generateRaceSchedule({ dispatch, state }) {
      if (state.horses.horses.length === 0) {
        return dispatch('horses/generateHorses', RACE_CONFIG.TOTAL_HORSES, { root: true })
          .then(() => dispatch('races/generateRaceSchedule', null, { root: true }))
          .catch(error => {
            console.error('Error generating race schedule:', error)
            throw error
          })
      }
      return dispatch('races/generateRaceSchedule', null, { root: true })
        .catch(error => {
          console.error('Error generating race schedule:', error)
          throw error
        })
    }
  }
})