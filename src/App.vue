<template>
  <div class="app">
    <header class="app-header">
      <h1>Horse Racing</h1>
      <div class="controls">
        <button 
          @click="generateProgram" 
          :disabled="raceInProgress"
          class="btn btn-generate"
        >
          GENERATE PROGRAM
        </button>
        <button
          v-if="!raceFinished"
          @click="toggleRace" 
          :disabled="!hasSchedule"
          class="btn btn-start"
        >
          {{ raceInProgress && !racePaused ? 'PAUSE' : 'START' }}
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <div class="left-panel">
        <HorseList />
      </div>
      
      <div class="center-panel">
        <RaceTrack />
      </div>
      
      <div class="right-panel">
        <ProgramResults />
      </div>
    </main>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { RACE_CONFIG } from '@/config/constants.js'
import HorseList from '@/components/HorseList.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import ProgramResults from '@/components/ProgramResults.vue'

export default {
  components: {
    HorseList,
    RaceTrack,
    ProgramResults
  },
  computed: {
    ...mapGetters('races', [
      'raceInProgress',
      'racePaused',
      'raceSchedule',
      'raceFinished'
    ]),
    hasSchedule() {
      return this.raceSchedule && this.raceSchedule.length > 0
    }
  },
  methods: {
    ...mapActions([
      'generateRaceSchedule'
    ]),
    ...mapActions('races', [
      'startRace',
      'pauseRace'
    ]),
    generateProgram() {
      this.generateRaceSchedule()
    },
    toggleRace() {
      if (this.raceInProgress && !this.racePaused) {
        this.pauseRace()
      } else {
        this.startRace()
      }
    }
  },
  mounted() {
    this.$store.dispatch('horses/generateHorses', RACE_CONFIG.TOTAL_HORSES)
  },
  beforeUnmount() {
    // Clean up animation when component is destroyed to prevent memory leaks
    this.$store.dispatch('races/stopAnimation')
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f0f0f0;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  
  @media screen and (max-width: 768px) {
    height: auto;
  }
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #555151;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate {
  background: #fff;
  color: #f00;
}

.btn-start {
  background: #ff4444;
  color: #fff;
}

.app-main {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
}

.left-panel {
  width: 330px;
  min-width: 250px;
  max-width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.center-panel {
  flex: 1;
  height: 100%;
  min-width: 300px;
  max-width: 100%;
}

.right-panel {
  width: 500px;
  min-width: 300px;
  max-width: 100%;
  height: 100%;
  flex-shrink: 0;
}

/* Responsive design for tablets and smaller screens */
@media (max-width: 1024px) {
  .app-main {
    flex-direction: column;
  }
  
  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 300px;
  }
  
  .left-panel {
    order: 1;
  }
  
  .center-panel {
    order: 2;
    min-height: 400px;
  }
  
  .right-panel {
    order: 3;
  }
}

/* Responsive design for mobile devices */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .app-header h1 {
    font-size: 20px;
  }
  
  .controls {
    width: 100%;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .app-main {
    padding: 5px;
    gap: 5px;
  }
  
  .left-panel,
  .center-panel,
  .right-panel {
    min-height: 250px;
  }
}
</style>