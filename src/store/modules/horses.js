import { HORSE_CONFIG } from '@/config/constants.js'

const HORSE_NAMES = [
  'Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Joan Clarke',
  'Katherine Johnson', 'Dorothy Vaughan', 'Mary Jackson', 'Annie Easley',
  'Betty Holberton', 'Jean Bartik', 'Frances Spence', 'Marlyn Meltzer',
  'Ruth Teitelbaum', 'Kay McNulty', 'Radia Perlman', 'Barbara Liskov',
  'Shafi Goldwasser', 'Frances Allen', 'Donna Strickland', 'Hedy Lamarr'
]

const HORSE_COLORS = [
  'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Pink', 'Cyan',
  'Magenta', 'Lime', 'Teal', 'Indigo', 'Brown', 'Grey', 'Black', 'White',
  'Coral', 'Gold', 'Silver', 'Navy'
]

function generateUniqueColors(count) {
  const shuffled = [...HORSE_COLORS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateHorses(count) {
  const colors = generateUniqueColors(count)
  const horses = []
  const availableNames = [...HORSE_NAMES].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < count; i++) {
    let name
    if (i < availableNames.length) {
      name = availableNames[i]
    }
    
    // Generate random condition between MIN_CONDITION and MAX_CONDITION
    const condition = Math.floor(
      Math.random() * (HORSE_CONFIG.MAX_CONDITION - HORSE_CONFIG.MIN_CONDITION + 1)
    ) + HORSE_CONFIG.MIN_CONDITION
    
    horses.push({
      id: i + 1,
      name: name,
      condition: condition,
      color: colors[i]
    })
  }
  
  return horses
}

export default {
  namespaced: true,
  state: {
    horses: []
  },
  mutations: {
    GENERATE_HORSES(state, count) {
      state.horses = generateHorses(count)
    }
  },
  actions: {
    generateHorses({ commit }, count) {
      commit('GENERATE_HORSES', count)
    }
  },
  getters: {
    horses: (state) => state.horses
  }
}