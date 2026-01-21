<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="container mx-auto max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-6xl font-bold text-indigo-900 mb-2">2048</h1>
        <p class="text-lg text-indigo-700">Join the tiles and get to the 2048 tile!</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">Score</p>
          <p class="text-3xl font-bold text-indigo-600">{{ gameState.score }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-sm text-gray-600">Best Score</p>
          <p class="text-3xl font-bold text-indigo-600">{{ gameState.bestScore }}</p>
        </div>
      </div>

      <!-- Game Board -->
      <div class="bg-indigo-300 rounded-lg shadow-lg p-4 mb-8 aspect-square">
        <div class="grid grid-cols-4 gap-2 h-full">
          <div
            v-for="(row, rowIdx) in gameState.tiles"
            :key="`row-${rowIdx}`"
            class="contents"
          >
            <div
              v-for="(tile, colIdx) in row"
              :key="`tile-${rowIdx}-${colIdx}`"
              class="bg-indigo-200 rounded-lg flex items-center justify-center transition-all duration-150 font-bold"
              :class="{
                'bg-yellow-100 text-2xl': tile?.value === 2,
                'bg-yellow-200 text-2xl': tile?.value === 4,
                'bg-orange-200 text-2xl': tile?.value === 8,
                'bg-orange-300 text-2xl': tile?.value === 16,
                'bg-orange-400 text-xl text-white': tile?.value === 32,
                'bg-red-400 text-xl text-white': tile?.value === 64,
                'bg-red-500 text-xl text-white': tile?.value === 128,
                'bg-red-600 text-lg text-white': tile?.value === 256,
                'bg-purple-600 text-lg text-white': tile?.value === 512,
                'bg-purple-700 text-lg text-white': tile?.value === 1024,
                'bg-purple-800 text-lg text-white': tile?.value === 2048,
                'bg-indigo-200': !tile,
                'scale-95': tile?.isNew,
              }"
            >
              {{ tile?.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- Game Status & Controls -->
      <div class="text-center mb-8">
        <button
          @click="resetGame"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          {{ gameState.isGameOver ? 'Game Over - Start New Game' : gameState.isWon ? 'You Won! Start New Game' : 'New Game' }}
        </button>
      </div>

      <!-- Game Messages -->
      <div v-if="gameState.isWon && !gameState.isGameOver" class="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4 text-center">
        <p class="text-green-800 font-bold text-lg">🎉 You reached 2048! 🎉</p>
      </div>
      <div v-if="gameState.isGameOver" class="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4 text-center">
        <p class="text-red-800 font-bold text-lg">Game Over! No more moves available.</p>
      </div>

      <!-- Instructions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-bold text-indigo-900 mb-3">How to Play</h2>
        <ul class="text-gray-700 space-y-2 text-sm">
          <li>✨ Use <strong>arrow keys</strong> or <strong>WASD</strong> to move tiles</li>
          <li>✨ When two tiles with the same number touch, they merge into one</li>
          <li>✨ The merged tile has a value equal to the sum of the two tiles</li>
          <li>✨ Reach the <strong>2048 tile</strong> to win!</li>
          <li>✨ Try to get the highest score possible</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import {
  initializeGameState,
  playMove,
  checkWin,
} from '../utils/game'
import type { BoardState, Direction } from '../types/game'

// Game state
const gameState = reactive<BoardState>(initializeGameState(4))

// Game functions
const resetGame = () => {
  const newState = initializeGameState(4)
  gameState.tiles = newState.tiles
  gameState.score = newState.score
  gameState.bestScore = gameState.bestScore // Keep best score
  gameState.isGameOver = newState.isGameOver
  gameState.isWon = newState.isWon
  gameState.moveCount = newState.moveCount
}

const handleMove = (direction: Direction) => {
  if (gameState.isGameOver || gameState.isWon) return

  const result = playMove(gameState.tiles, direction)

  if (result.moved) {
    gameState.tiles = result.board
    gameState.score += result.scoreGain
    gameState.moveCount += 1

    // Update best score
    if (gameState.score > gameState.bestScore) {
      gameState.bestScore = gameState.score
    }

    // Check game states
    gameState.isWon = checkWin(result.board)
    gameState.isGameOver = result.gameOver
  }
}

// Keyboard handling
const handleKeydown = (event: KeyboardEvent) => {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    W: 'up',
    s: 'down',
    S: 'down',
    a: 'left',
    A: 'left',
    d: 'right',
    D: 'right',
  }

  const direction = keyMap[event.key]
  if (direction) {
    event.preventDefault()
    handleMove(direction)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
