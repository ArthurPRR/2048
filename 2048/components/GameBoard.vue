<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
    <!-- Title -->
    <h1 class="text-6xl font-black text-blue-700 mb-2 drop-shadow-lg">2048</h1>
    <p class="text-lg text-blue-600 mb-8">Fusionnez les tuiles pour atteindre 2048!</p>

    <!-- Stats -->
    <div class="flex gap-8 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-lg border-4 border-blue-500">
        <p class="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">Score</p>
        <p class="text-5xl font-black text-blue-700">{{ gameState.score }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg border-4 border-purple-500">
        <p class="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">Meilleur</p>
        <p class="text-5xl font-black text-purple-700">{{ gameState.bestScore }}</p>
      </div>
    </div>

    <!-- Game board -->
    <div class="bg-blue-600 p-4 rounded-2xl shadow-2xl">
      <div class="grid gap-3" :style="{ gridTemplateColumns: 'repeat(4, 1fr)', width: '400px' }">
        <div
          v-for="(tile, index) in boardFlat"
          :key="index"
          class="flex items-center justify-center rounded-lg font-black text-4xl transition-all duration-200 transform"
          :class="[
            getTileClass(tile),
            tile && tile.isNew ? 'scale-110 animate-bounce' : 'scale-100',
          ]"
          :style="{ height: '90px' }"
        >
          <span v-if="tile" class="drop-shadow-md">{{ tile.value }}</span>
        </div>
      </div>
    </div>

    <!-- Game over / Win overlay -->
    <transition name="fade">
      <div
        v-if="gameState.isGameOver || gameState.isWon"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="resetGame"
      >
        <div
          class="bg-white rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in"
          @click.stop
        >
          <p
            v-if="gameState.isWon"
            class="text-5xl font-black text-green-600 mb-4"
          >
            🎉 Victoire! 🎉
          </p>
          <p v-else class="text-5xl font-black text-red-600 mb-4">
            Game Over!
          </p>
          <p class="text-2xl text-gray-700 mb-6">Score: {{ gameState.score }}</p>
          <button
            @click="resetGame"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Nouvelle Partie
          </button>
        </div>
      </div>
    </transition>

    <!-- New Game button -->
    <div class="mt-8">
      <button
        @click="resetGame"
        class="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all"
      >
        Nouvelle Partie
      </button>
    </div>

    <!-- Instructions -->
    <div class="mt-12 text-center max-w-md">
      <div class="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
        <p class="text-sm font-bold text-gray-600 uppercase mb-3">Contrôles</p>
        <div class="grid grid-cols-2 gap-3 text-left">
          <div>
            <p class="text-blue-600 font-bold">⬆️ Vers le haut</p>
            <p class="text-blue-600 font-bold">⬇️ Vers le bas</p>
          </div>
          <div>
            <p class="text-blue-600 font-bold">⬅️ Vers la gauche</p>
            <p class="text-blue-600 font-bold">➡️ Vers la droite</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm mt-3">
          Fusionnez les tuiles identiques et atteignez 2048!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Tile, BoardState } from '../types/game'
import {
  playMove,
  initializeGameState,
  isGameOver,
  checkWin,
} from '../utils/game'

const STORAGE_KEY = 'game_2048_best_score'

// Charger le meilleur score depuis localStorage avant d'initialiser le jeu
const loadBestScore = (): number => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return parseInt(stored, 10)
    }
  }
  return 0
}

// Sauvegarder le meilleur score dans localStorage
const saveBestScore = (score: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, score.toString())
  }
}

// Initialiser avec le bestScore depuis localStorage
const initialBestScore = loadBestScore()
const gameState = ref<BoardState>({
  ...initializeGameState(4),
  bestScore: initialBestScore,
})

// Observer les changements du meilleur score
watch(
  () => gameState.value.bestScore,
  (newScore) => {
    saveBestScore(newScore)
  }
)

const boardFlat = computed(() => {
  return gameState.value.tiles.flat()
})

const getTileClass = (tile: Tile | null) => {
  if (!tile) {
    return 'bg-gray-300 hover:bg-gray-400'
  }

  const colorMap: Record<number, string> = {
    2: 'bg-yellow-200 text-yellow-900',
    4: 'bg-yellow-300 text-yellow-900',
    8: 'bg-orange-300 text-orange-900',
    16: 'bg-orange-400 text-orange-900',
    32: 'bg-orange-500 text-white',
    64: 'bg-red-500 text-white',
    128: 'bg-red-600 text-white shadow-lg',
    256: 'bg-pink-500 text-white shadow-lg',
    512: 'bg-pink-600 text-white shadow-xl',
    1024: 'bg-purple-600 text-white shadow-xl',
    2048: 'bg-purple-700 text-white shadow-2xl animate-pulse',
  }

  return (
    colorMap[tile.value] ||
    'bg-gradient-to-br from-purple-700 to-purple-900 text-white shadow-2xl'
  )
}

const resetGame = () => {
  const bestScore = gameState.value.bestScore
  gameState.value = {
    ...initializeGameState(4),
    bestScore,
  }
}

const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (gameState.value.isGameOver || gameState.value.isWon) {
    return
  }

  const result = playMove(gameState.value.tiles, direction)

  if (result.moved) {
    gameState.value.tiles = result.board
    gameState.value.score += result.scoreGain

    if (gameState.value.score > gameState.value.bestScore) {
      gameState.value.bestScore = gameState.value.score
    }

    if (checkWin(gameState.value.tiles)) {
      gameState.value.isWon = true
    }

    if (isGameOver(gameState.value.tiles)) {
      gameState.value.isGameOver = true
    }
  }
}

const keyboardHandler = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    handleMove('up')
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    handleMove('down')
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    handleMove('left')
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    handleMove('right')
  }
}

onMounted(() => {
  window.addEventListener('keydown', keyboardHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyboardHandler)
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
