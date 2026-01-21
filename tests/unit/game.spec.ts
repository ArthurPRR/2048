import { describe, it, expect, beforeEach } from 'vitest'
import type { Tile } from '@/types/game'
import {
  initBoard,
  getEmptyPositions,
  countNonEmptyTiles,
  spawnTile,
  initializeGameBoard,
  compress,
  merge,
  move,
  checkWin,
  canMove,
  isGameOver,
  cloneBoard,
  boardsEqual,
  playMove,
  initializeGameState,
} from '@/utils/game'

describe('Game Core Logic', () => {
  describe('initBoard', () => {
    it('should create an empty board of specified size', () => {
      const board = initBoard(4)
      expect(board).toHaveLength(4)
      expect(board[0]).toHaveLength(4)
      expect(board.flat().every(t => t === null)).toBe(true)
    })

    it('should create 3x3 board', () => {
      const board = initBoard(3)
      expect(board).toHaveLength(3)
      board.forEach(row => expect(row).toHaveLength(3))
    })
  })

  describe('getEmptyPositions', () => {
    it('should return all positions when board is empty', () => {
      const board = initBoard(4)
      const empty = getEmptyPositions(board)
      expect(empty).toHaveLength(16)
    })

    it('should return only empty positions', () => {
      const board = initBoard(3)
      board[0][0] = { id: '1', value: 2 }
      board[1][1] = { id: '2', value: 4 }
      const empty = getEmptyPositions(board)
      expect(empty).toHaveLength(7)
      expect(empty).not.toContainEqual([0, 0])
      expect(empty).not.toContainEqual([1, 1])
    })

    it('should return empty array when board is full', () => {
      const board = initBoard(2)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          board[i][j] = { id: `${i}-${j}`, value: 2 }
        }
      }
      const empty = getEmptyPositions(board)
      expect(empty).toHaveLength(0)
    })
  })

  describe('countNonEmptyTiles', () => {
    it('should return 0 for empty board', () => {
      const board = initBoard(4)
      expect(countNonEmptyTiles(board)).toBe(0)
    })

    it('should count non-empty tiles correctly', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 2 }
      board[1][1] = { id: '2', value: 4 }
      board[2][2] = { id: '3', value: 8 }
      expect(countNonEmptyTiles(board)).toBe(3)
    })
  })

  describe('spawnTile', () => {
    it('should not add tile if board is full', () => {
      const board = initBoard(2)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          board[i][j] = { id: `${i}-${j}`, value: 2 }
        }
      }
      const result = spawnTile(board)
      expect(countNonEmptyTiles(result)).toBe(4)
    })

    it('should add a tile with value 2 or 4', () => {
      const board = initBoard(4)
      const result = spawnTile(board)
      const tiles = result.flat().filter(t => t !== null)
      expect(tiles).toHaveLength(1)
      expect([2, 4]).toContain(tiles[0].value)
    })

    it('should mark new tile with isNew flag', () => {
      const board = initBoard(4)
      const result = spawnTile(board)
      const newTile = result.flat().find(t => t !== null)
      expect(newTile?.isNew).toBe(true)
    })

    it('should spawn tile in empty position only', () => {
      const board = initBoard(3)
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 2 }
      board[0][2] = { id: '3', value: 2 }
      board[1][0] = { id: '4', value: 2 }
      board[1][1] = { id: '5', value: 2 }
      board[1][2] = { id: '6', value: 2 }
      board[2][0] = { id: '7', value: 2 }
      board[2][1] = { id: '8', value: 2 }

      const result = spawnTile(board)
      expect(result[2][2]).not.toBeNull()
      expect(result[2][2]?.value).toMatch(/^(2|4)$/)
    })
  })

  describe('initializeGameBoard', () => {
    it('should create board with 2 tiles', () => {
      const board = initializeGameBoard(4)
      expect(countNonEmptyTiles(board)).toBe(2)
    })

    it('should have tiles with value 2 or 4', () => {
      const board = initializeGameBoard(4)
      const tiles = board.flat().filter(t => t !== null)
      tiles.forEach(t => expect([2, 4]).toContain(t.value))
    })
  })

  describe('compress', () => {
    it('should move all tiles to the left, removing nulls', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        null,
        { id: '2', value: 4 },
        null,
      ]
      const result = compress(line)
      expect(result).toEqual([
        { id: '1', value: 2 },
        { id: '2', value: 4 },
        null,
        null,
      ])
    })

    it('should keep order of non-null tiles', () => {
      const line: (Tile | null)[] = [
        null,
        { id: '1', value: 8 },
        null,
        { id: '2', value: 16 },
      ]
      const result = compress(line)
      expect(result[0]?.value).toBe(8)
      expect(result[1]?.value).toBe(16)
      expect(result[2]).toBeNull()
      expect(result[3]).toBeNull()
    })

    it('should handle all nulls', () => {
      const line: (Tile | null)[] = [null, null, null, null]
      const result = compress(line)
      expect(result).toEqual([null, null, null, null])
    })

    it('should handle no nulls', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        { id: '2', value: 4 },
        { id: '3', value: 8 },
      ]
      const result = compress(line)
      expect(result).toEqual(line)
    })
  })

  describe('merge', () => {
    it('should merge adjacent identical tiles', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        { id: '2', value: 2 },
        null,
        null,
      ]
      const [result, score] = merge(line)
      expect(result[0]?.value).toBe(4)
      expect(result[1]).toBeNull()
      expect(score).toBe(4)
    })

    it('should not merge different values', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        { id: '2', value: 4 },
        null,
        null,
      ]
      const [result, score] = merge(line)
      expect(result[0]?.value).toBe(2)
      expect(result[1]?.value).toBe(4)
      expect(score).toBe(0)
    })

    it('should chain merges (2+2=4, 4+4=8)', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        { id: '2', value: 2 },
        { id: '3', value: 4 },
        { id: '4', value: 4 },
      ]
      const [result, score] = merge(line)
      expect(result[0]?.value).toBe(4)
      expect(result[1]?.value).toBe(8)
      expect(score).toBe(12) // 4 + 8
    })

    it('should handle nulls correctly', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        null,
        { id: '2', value: 2 },
        null,
      ]
      const [result, score] = merge(line)
      expect(result[0]?.value).toBe(2)
      expect(score).toBe(0) // no merge happened
    })

    it('should mark merged tiles with isMerged flag', () => {
      const line: (Tile | null)[] = [
        { id: '1', value: 2 },
        { id: '2', value: 2 },
      ]
      const [result] = merge(line)
      expect(result[0]?.isMerged).toBe(true)
    })
  })

  describe('move', () => {
    let board: (Tile | null)[][]

    beforeEach(() => {
      board = initBoard(4)
      // Setup a simple board:
      // 2 . . .
      // 2 . . .
      // . . . .
      // . . . .
      board[0][0] = { id: '1', value: 2 }
      board[1][0] = { id: '2', value: 2 }
    })

    it('should move left', () => {
      board[0] = [
        { id: '1', value: 2 },
        null,
        { id: '2', value: 4 },
        null,
      ] as (Tile | null)[]
      const result = move(board, 'left')
      expect(result.moved).toBe(true)
      expect(result.board[0][0]?.value).toBe(2)
      expect(result.board[0][1]?.value).toBe(4)
      expect(result.board[0][2]).toBeNull()
    })

    it('should move right', () => {
      board[0] = [
        { id: '1', value: 2 },
        null,
        { id: '2', value: 4 },
        null,
      ] as (Tile | null)[]
      const result = move(board, 'right')
      expect(result.moved).toBe(true)
      expect(result.board[0][1]?.value).toBe(2)
      expect(result.board[0][2]?.value).toBe(4)
      expect(result.board[0][3]).toBeNull()
    })

    it('should move up', () => {
      board[0][0] = { id: '1', value: 2 }
      board[1][0] = { id: '2', value: 4 }
      board[3][0] = { id: '3', value: 8 }

      const result = move(board, 'up')
      expect(result.moved).toBe(true)
      expect(result.board[0][0]?.value).toBe(2)
      expect(result.board[1][0]?.value).toBe(4)
      expect(result.board[2][0]?.value).toBe(8)
      expect(result.board[3][0]).toBeNull()
    })

    it('should move down', () => {
      board[0][0] = { id: '1', value: 2 }
      board[1][0] = { id: '2', value: 4 }
      board[2][0] = { id: '3', value: 8 }

      const result = move(board, 'down')
      expect(result.moved).toBe(true)
      expect(result.board[1][0]?.value).toBe(2)
      expect(result.board[2][0]?.value).toBe(4)
      expect(result.board[3][0]?.value).toBe(8)
      expect(result.board[0][0]).toBeNull()
    })

    it('should return moved=false if no change', () => {
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 4 }
      board[0][2] = { id: '3', value: 8 }
      board[0][3] = { id: '4', value: 16 }

      const result = move(board, 'left')
      expect(result.moved).toBe(false)
    })

    it('should calculate correct score for merges', () => {
      board[0] = [
        { id: '1', value: 2 },
        { id: '2', value: 2 },
        null,
        null,
      ] as (Tile | null)[]
      const result = move(board, 'left')
      expect(result.scoreGain).toBe(4)
    })
  })

  describe('canMove', () => {
    it('should return true if empty position exists', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 2 }
      expect(canMove(board)).toBe(true)
    })

    it('should return true if merge possible', () => {
      const board = initBoard(2)
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 2 }
      board[1][0] = { id: '3', value: 4 }
      board[1][1] = { id: '4', value: 8 }
      expect(canMove(board)).toBe(true)
    })

    it('should return false if no moves possible', () => {
      const board = initBoard(2)
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 4 }
      board[1][0] = { id: '3', value: 8 }
      board[1][1] = { id: '4', value: 16 }
      expect(canMove(board)).toBe(false)
    })

    it('should return false for empty board (actually true - has empty positions)', () => {
      const board = initBoard(4)
      expect(canMove(board)).toBe(true)
    })
  })

  describe('checkWin', () => {
    it('should return true if 2048 tile exists', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 2048 }
      expect(checkWin(board)).toBe(true)
    })

    it('should return false if no 2048 tile', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 1024 }
      expect(checkWin(board)).toBe(false)
    })

    it('should return false for empty board', () => {
      const board = initBoard(4)
      expect(checkWin(board)).toBe(false)
    })
  })

  describe('isGameOver', () => {
    it('should return true when no moves available', () => {
      const board = initBoard(2)
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 4 }
      board[1][0] = { id: '3', value: 8 }
      board[1][1] = { id: '4', value: 16 }
      expect(isGameOver(board)).toBe(true)
    })

    it('should return false when moves available', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 2 }
      expect(isGameOver(board)).toBe(false)
    })
  })

  describe('cloneBoard', () => {
    it('should create deep copy of board', () => {
      const original = initBoard(2)
      original[0][0] = { id: '1', value: 2 }
      const cloned = cloneBoard(original)

      cloned[0][0] = { id: '2', value: 4 }
      expect(original[0][0]?.value).toBe(2)
      expect(cloned[0][0]?.value).toBe(4)
    })
  })

  describe('boardsEqual', () => {
    it('should return true for identical boards', () => {
      const board1 = initBoard(2)
      const board2 = initBoard(2)
      board1[0][0] = { id: '1', value: 2 }
      board2[0][0] = { id: '2', value: 2 }

      expect(boardsEqual(board1, board2)).toBe(true)
    })

    it('should return false for different boards', () => {
      const board1 = initBoard(2)
      const board2 = initBoard(2)
      board1[0][0] = { id: '1', value: 2 }
      board2[0][0] = { id: '2', value: 4 }

      expect(boardsEqual(board1, board2)).toBe(false)
    })

    it('should return false if positions differ', () => {
      const board1 = initBoard(2)
      const board2 = initBoard(2)
      board1[0][0] = { id: '1', value: 2 }
      board2[0][1] = { id: '2', value: 2 }

      expect(boardsEqual(board1, board2)).toBe(false)
    })

    it('should return true for all empty boards', () => {
      const board1 = initBoard(2)
      const board2 = initBoard(2)
      expect(boardsEqual(board1, board2)).toBe(true)
    })
  })

  describe('playMove', () => {
    let board: (Tile | null)[][]

    beforeEach(() => {
      board = initBoard(4)
      board[0][0] = { id: '1', value: 2 }
      board[0][1] = { id: '2', value: 2 }
    })

    it('should execute a complete move with spawn', () => {
      const result = playMove(board, 'left')
      expect(result.moved).toBe(true)
      expect(result.scoreGain).toBe(4)
      expect(countNonEmptyTiles(result.board)).toBe(2) // merged tile + spawned tile
    })

    it('should return gameOver false if moves still available', () => {
      const result = playMove(board, 'left')
      expect(result.gameOver).toBe(false)
    })

    it('should return won false if no 2048 tile', () => {
      const result = playMove(board, 'left')
      expect(result.won).toBe(false)
    })

    it('should return moved=false if no movement', () => {
      const singleBoard = initBoard(4)
      singleBoard[0][0] = { id: '1', value: 2 }
      singleBoard[0][1] = { id: '2', value: 4 }
      singleBoard[0][2] = { id: '3', value: 8 }
      singleBoard[0][3] = { id: '4', value: 16 }

      const result = playMove(singleBoard, 'left')
      expect(result.moved).toBe(false)
      expect(result.scoreGain).toBe(0)
    })
  })

  describe('initializeGameState', () => {
    it('should create initial game state', () => {
      const state = initializeGameState(4)
      expect(state.tiles).toHaveLength(4)
      expect(state.score).toBe(0)
      expect(state.bestScore).toBe(0)
      expect(state.isGameOver).toBe(false)
      expect(state.isWon).toBe(false)
      expect(state.moveCount).toBe(0)
    })

    it('should have 2 tiles on initialization', () => {
      const state = initializeGameState(4)
      expect(countNonEmptyTiles(state.tiles)).toBe(2)
    })
  })

  describe('Integration Tests', () => {
    it('should play a complete game sequence', () => {
      let state = initializeGameState(4)
      expect(state.isGameOver).toBe(false)

      // Simulate some moves
      for (let i = 0; i < 5; i++) {
        const directions = ['left', 'right', 'up', 'down'] as const
        const randomDirection = directions[Math.floor(Math.random() * 4)]
        const result = playMove(state.tiles, randomDirection)
        if (result.moved) {
          state.tiles = result.board
          state.score += result.scoreGain
        }
      }

      expect(state.score).toBeGreaterThanOrEqual(0)
      expect(countNonEmptyTiles(state.tiles)).toBeGreaterThan(0)
    })

    it('should handle move left followed by move right', () => {
      const board = initBoard(4)
      board[0][0] = { id: '1', value: 2 }
      board[0][2] = { id: '2', value: 4 }

      const result1 = move(board, 'left')
      expect(result1.moved).toBe(true)
      expect(result1.board[0][0]?.value).toBe(2)
      expect(result1.board[0][1]?.value).toBe(4)

      const result2 = move(result1.board, 'right')
      expect(result2.moved).toBe(true)
      expect(result2.board[0][2]?.value).toBe(2)
      expect(result2.board[0][3]?.value).toBe(4)
    })
  })
})
