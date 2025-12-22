<template>
  <div class="horse-list">
    <div class="horse-list-header">
      <h2>Horse List (1-20)</h2>
    </div>
    <div class="horse-list-content">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Condition</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <td>{{ horse.name }}</td>
            <td>{{ horse.condition }}</td>
            <td>
              <span 
                class="color-badge" 
                :style="{ backgroundColor: getColorValue(horse.color) }"
              >
                {{ horse.color }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getColorValue } from '@/utils/colors.js'

export default {
  computed: {
    ...mapGetters('horses', [
      'horses'
    ])
  },
  methods: {
    getColorValue
  }
}
</script>

<style scoped>
.horse-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ddd;
}

.horse-list-header {
  background: #ffd700;
  padding: 10px;
  font-weight: bold;
  border-bottom: 2px solid #ccc;
}

.horse-list-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.horse-list-content {
  flex: 1;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
  position: sticky;
  top: 0;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: bold;
  color: #333;
}

tbody tr:hover {
  background: #f9f9f9;
}

.color-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: #333;
  font-size: 12px;
  border: 1px solid #ccc;
}
</style>