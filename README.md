# Horse Racing Game

An interactive horse racing simulation game built with Vue 3, Vuex, and Vite. Watch 20 horses compete in 6 rounds of racing with different distances, animated movement, and real-time results.
Demo link: https://dmtrglvk.github.io/horse-racing-game/

## Features

- 20 unique horses with random conditions and colors
- 6 racing rounds with increasing distances (1200m - 2200m)
- Pause/Resume functionality
- Visual racetrack with animated horse movement
- Real-time results display
- Comprehensive test coverage (unit + E2E)

## Prerequisites

- Node.js 22 or higher
- npm

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server (runs on http://localhost:5173)
npm run dev
```

## Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

### Unit Tests

```bash
# Run unit tests once
npm test

# Run unit tests in watch mode
npm test -- --watch

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (auto-starts dev server)
npm run test:e2e

# Run E2E tests with interactive UI
npm run test:e2e:ui

# Run E2E tests with visible browser
npm run test:e2e:headed
```

## Project Structure

```
horse-racing-game/
├── src/                        
│   ├── main.js                 
│   ├── App.vue                 
│   │
│   ├── components/              
│   │   ├── HorseList.vue       
│   │   ├── RaceTrack.vue       
│   │   └── ProgramResults.vue  
│   │
│   ├── store/                  
│   │   ├── index.js            
│   │   └── modules/            
│   │       ├── horses.js       
│   │       └── races.js        
│   │
│   ├── services/               
│   │   └── raceAnimationService.js  
│   │
│   ├── utils/                  
│   │   ├── colors.js           
│   │   ├── ordinal.js          
│   │   └── shuffle.js          
│   │
│   └── config/                 
│       └── constants.js        
│
├── tests/                      
│   ├── components/              
│   ├── store/                  
│   └── e2e/                    
└── package.json
```

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vuex 4** - State management
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Vue Test Utils** - Component testing utilities

## How to Play

1. Click **"GENERATE PROGRAM"** to create a 6-round race schedule
2. Click **"START"** to begin the races
3. Click **"PAUSE"** to pause/resume a race in progress
4. Watch horses move on the track based on their condition scores
5. View results as each round completes
