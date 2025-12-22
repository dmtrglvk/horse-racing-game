<template>
  <div class="race-track">
    <div class="track-container">
      <div class="lanes">
        <div 
          v-for="lane in RACE_CONFIG.HORSES_PER_ROUND" 
          :key="lane" 
          class="lane"
          :class="{ 'active': isLaneActive(lane) }"
        >
          <div class="lane-number">{{ lane }}</div>
          <div class="lane-content">
            <div class="lane-line"></div>
            <div 
              v-if="getHorseInLane(lane)"
              class="horse"
              :style="horseStyles[lane]"
            >
              <div class="horse-icon">🐴</div>
            </div>
          </div>
        </div>
      </div>
      <div class="finish-line" />
    </div>
    <div class="track-info" aria-live="polite" aria-atomic="true">
      <span v-if="currentRoundData">
        {{ getOrdinalRound(currentRoundData.round) }} Lap {{ currentRoundData.distance }}m
      </span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { RACE_CONFIG } from '@/config/constants.js'
import { getColorValue } from '@/utils/colors.js'
import { getOrdinalSuffix } from '@/utils/ordinal.js'

export default {
  data() {
    return {
      RACE_CONFIG
    }
  },
  computed: {
    ...mapGetters('races', [
      'currentRoundData',
      'trackPositions'
    ]),
    horseStyles() {
      const styles = {}
      if (this.currentRoundData) {
        this.currentRoundData.horses.forEach((horse, index) => {
          const lane = index + 1
          const position = this.trackPositions[horse.id] ?? 0
          const color = getColorValue(horse.color)
          styles[lane] = {
            left: `${position}%`,
            '--horse-color': color,
          }
        })
      }
      return styles
    }
  },
  methods: {
    isLaneActive(lane) {
      if (!this.currentRoundData) {
        return false
      }
      return lane <= this.currentRoundData.horses.length
    },
    getHorseInLane(lane) {
      if (!this.currentRoundData) return null
      const horse = this.currentRoundData.horses[lane - 1]
      return horse || null
    },
    getOrdinalRound(roundNumber) {
      return getOrdinalSuffix(roundNumber)
    }
  }
}
</script>

<style scoped>
.race-track {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border: 1px solid #ddd;
  position: relative;
}

.track-container {
  flex: 1;
  position: relative;
  padding: 20px 60px 20px 40px;
}

.lanes {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
}

.lane {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #ccc;
}

.lane.active {
  background: rgba(255, 255, 255, 0.3);
}

.lane-number {
  width: 30px;
  height: 30px;
  background: #999;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
}

.lane-content {
  flex: 1;
  position: relative;
  height: 100%;
}

.lane-line {
  width: 100%;
  height: 2px;
  background: transparent;
}

.horse {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.1s linear;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.horse-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--horse-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.finish-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #f00;
  display: flex;
  align-items: center;
  justify-content: center;
}


.track-info {
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #ddd;
  font-size: 14px;
  color: #333;
}
</style>