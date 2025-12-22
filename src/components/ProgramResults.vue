<template>
  <div class="program-results">
    <div class="program-column">
      <div class="column-header program-header">Program</div>
      <div class="column-content">
        <div 
          v-for="(round, index) in raceSchedule" 
          :key="index"
          class="round-section"
        >
          <div class="round-title">{{ getOrdinalRound(round.round) }} Lap - {{ round.distance }}m</div>
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(horse, pos) in round.horses" :key="horse.id">
                <td>{{ pos + 1 }}</td>
                <td>{{ horse.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="results-column">
      <div class="column-header results-header">Results</div>
      <div class="column-content">
        <div 
          v-for="(round, index) in raceSchedule" 
          :key="index"
          class="round-section"
        >
          <div class="round-title">{{ getOrdinalRound(round.round) }} Lap - {{ round.distance }}m</div>
          <table v-if="round.completed && round.results.length > 0">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in round.results" :key="result.horseId">
                <td>{{ result.position }}</td>
                <td>{{ result.name }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-results">Race in progress...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getOrdinalSuffix } from '@/utils/ordinal.js'

export default {
  computed: {
    ...mapGetters('races', [
      'raceSchedule'
    ])
  },
  methods: {
    getOrdinalRound(roundNumber) {
      return getOrdinalSuffix(roundNumber)
    }
  }
}
</script>

<style scoped>
.program-results {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  background: #fff;
  border: 1px solid #ddd;
}

.program-column,
.results-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
}

.column-header {
  padding: 10px;
  font-weight: bold;
  text-align: center;
  color: white;
  font-size: 14px;
}

.program-header {
  background: #3434d8;
}

.results-header {
  background: #378b0b;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.round-section {
  margin-bottom: 20px;
}

.round-section:last-child {
  margin-bottom: 0;
}

.round-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 13px;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

table thead {
  background: #f5f5f5;
}

table th,
table td {
  padding: 6px 8px;
  text-align: left;
  border: 1px solid #eee;
}

table th {
  font-weight: bold;
  font-size: 11px;
}

table tbody tr:nth-child(even) {
  background: #fafafa;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 12px;
}
</style>