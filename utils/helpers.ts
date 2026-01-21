import type { Tile, Direction } from '@/types/game'

/**
 * Convertir la board 2D en string pour affichage de debug
 */
export function boardToString(board: Tile[][]): string {
  return board
    .map(row =>
      row
        .map(tile => (tile ? tile.value.toString().padStart(5) : '.....'))
        .join('|')
    )
    .join('\n')
}

/**
 * Obtenir tous les tiles en tant que tableau 1D
 */
export function getTilesFlat(board: Tile[][]): Tile[] {
  return board.flat().filter(t => t !== null)
}

/**
 * Calculer la max tuile sur la board
 */
export function getMaxTile(board: Tile[][]): number {
  const tiles = getTilesFlat(board)
  return tiles.length === 0 ? 0 : Math.max(...tiles.map(t => t.value))
}

/**
 * Compter le nombre total de tuiles
 */
export function getTileCount(board: Tile[][]): number {
  return getTilesFlat(board).length
}

/**
 * Obtenir les positions occupées
 */
export function getOccupiedPositions(board: Tile[][]): Array<[number, number]> {
  const positions: Array<[number, number]> = []
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== null) {
        positions.push([row, col])
      }
    }
  }
  return positions
}

/**
 * Format score avec séparateurs de milliers
 */
export function formatScore(score: number): string {
  return score.toLocaleString()
}

/**
 * Calculer les statistiques du jeu
 */
export function calculateStats(board: Tile[][]) {
  const tiles = getTilesFlat(board)
  const max = tiles.length === 0 ? 0 : Math.max(...tiles.map(t => t.value))
  const sum = tiles.reduce((acc, t) => acc + t.value, 0)
  const count = tiles.length

  return {
    maxTile: max,
    totalSum: sum,
    tileCount: count,
    gridSize: board.length,
  }
}
