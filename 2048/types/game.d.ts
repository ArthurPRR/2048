export interface Tile {
  id: string
  value: number
  isNew?: boolean
  isMerged?: boolean
}

export interface BoardState {
  tiles: (Tile | null)[][]
  score: number
  bestScore: number
  isGameOver: boolean
  isWon: boolean
  moveCount: number
}

export interface MoveResult {
  board: (Tile | null)[][]
  scoreGain: number
  moved: boolean
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface GameHistory {
  board: (Tile | null)[][]
  score: number
}
