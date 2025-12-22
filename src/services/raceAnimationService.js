import { ANIMATION_CONFIG, RACE_CONFIG, HORSE_CONFIG } from '@/config/constants.js'

export function createRaceAnimation({
  horses,
  distance,
  onPositionUpdate,
  onFinish,
  isPaused,
  getCurrentPosition
}) {
  let animationFrameId = null
  let lastTimestamp = performance.now()
  const finishLine = RACE_CONFIG.FINISH_LINE_POSITION
  const baseDistance = RACE_CONFIG.BASE_DISTANCE
  const distanceFactor = baseDistance / distance
  
  const animate = (currentTimestamp) => {
    if (isPaused()) {
      lastTimestamp = currentTimestamp
      animationFrameId = requestAnimationFrame(animate)
      return
    }
    
    const deltaTime = currentTimestamp - lastTimestamp
    lastTimestamp = currentTimestamp
    
    const cappedDeltaTime = Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME_MS)
    
    let allFinished = true
    
    horses.forEach(horse => {
      const currentPos = getCurrentPosition ? getCurrentPosition(horse.id) : 0
      
      if (currentPos < finishLine) {
        allFinished = false
        
        // Calculate speed based on:
        // 1. Horse condition (0-100) as percentage
        // 2. Random variation (0.5x to 1.0x multiplier)
        // 3. Base speed multiplier
        // 4. Distance factor (longer races = slower relative speed)
        // 5. Delta time (frame-rate independent movement)
        const conditionFactor = horse.condition / HORSE_CONFIG.CONDITION_DIVISOR
        const randomFactor = ANIMATION_CONFIG.MIN_SPEED_FACTOR + 
          Math.random() * (ANIMATION_CONFIG.MAX_SPEED_FACTOR - ANIMATION_CONFIG.MIN_SPEED_FACTOR)
        const baseSpeed = conditionFactor * randomFactor * ANIMATION_CONFIG.BASE_SPEED_MULTIPLIER
        const speed = baseSpeed * distanceFactor * cappedDeltaTime
        
        const newPos = currentPos + speed
        onPositionUpdate(horse.id, newPos)
      }
    })
    
    if (allFinished) {
      stop()
      onFinish()
    } else {
      animationFrameId = requestAnimationFrame(animate)
    }
  }
  
  const start = () => {
    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(animate)
    }
  }
  
  const stop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  return {
    start,
    stop
  }
}
