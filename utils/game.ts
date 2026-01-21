import type { Tile, BoardState, MoveResult, Direction } from '@/types/game'

/**
 * Générer un ID unique pour une tuile
 */
export function generateTileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Initialiser une board vide
 */
export function initBoard(gridSize: number = 4): (Tile | null)[][] {
  return Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null))
}

/**
 * Obtenir les positions vides sur la board
 */
export function getEmptyPositions(board: (Tile | null)[][]): Array<[number, number]> {
  const empty: Array<[number, number]> = []
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        empty.push([row, col])
      }
    }
  }
  return empty
}

/**
 * Compter le nombre de tuiles non-vides
 */
export function countNonEmptyTiles(board: (Tile | null)[][]): number {
  return board.flat().filter(t => t !== null).length
}

/**
 * Ajouter une nouvelle tuile (2 ou 4) à une position aléatoire vide
 */
export function spawnTile(board: (Tile | null)[][]): (Tile | null)[][] {
  const empty = getEmptyPositions(board)
  if (empty.length === 0) return board

  const [row, col] = empty[Math.floor(Math.random() * empty.length)]
  const newBoard = JSON.parse(JSON.stringify(board))
  const value = Math.random() < 0.9 ? 2 : 4
  newBoard[row][col] = {
    id: generateTileId(),
    value,
    isNew: true,
  }
  return newBoard
}

/**
 * Ajouter deux tuiles au début (initialization)
 */
export function initializeGameBoard(gridSize: number = 4): (Tile | null)[][] {
  let board = initBoard(gridSize)
  board = spawnTile(board)
  board = spawnTile(board)
  return board
}

/**
 * Extraire les tuiles non-nulles d'une ligne/colonne et les compresser
 */
export function compress(line: (Tile | null)[]): (Tile | null)[] {
  const filtered = line.filter(tile => tile !== null)
  return [...filtered, ...Array(line.length - filtered.length).fill(null)]
}

/**
 * Fusionner les tuiles identiques dans une ligne/colonne
 * Retourne [line modifiée, scoreGain]
 */
export function merge(line: (Tile | null)[]): [(Tile | null)[], number] {
  let score = 0
  const result: (Tile | null)[] = []

  for (let i = 0; i < line.length; i++) {
    const current = line[i]

    if (current === null) {
      result.push(null)
      continue
    }

    // Vérifier si on peut fusionner avec la tuile précédente
    if (i > 0 && result[i - 1] !== null && result[i - 1]!.value === current.value) {
      const merged = result[i - 1]!.value * 2
      score += merged
      result[i - 1] = {
        id: generateTileId(),
        value: merged,
        isMerged: true,
      }
      result.push(null)
    } else {
      result.push({
        ...current,
        isMerged: false,
      })
    }
  }

  return [result, score]
}

/**
 * Effectuer un mouvement dans une direction
 */
export function move(board: (Tile | null)[][], direction: Direction): MoveResult {
  const newBoard = JSON.parse(JSON.stringify(board))
  let scoreGain = 0
  let moved = false

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < newBoard.length; row++) {
      const line = newBoard[row]
      let compressed = compress(line)
      let [merged, score] = merge(compressed)
      merged = compress(merged)
      newBoard[row] = merged

      scoreGain += score
      if (JSON.stringify(line) !== JSON.stringify(merged)) {
        moved = true
      }
    }
    if (direction === 'right') {
      for (let row = 0; row < newBoard.length; row++) {
        newBoard[row] = newBoard[row].reverse()
      }
    }
  } else {
    // up / down
    for (let col = 0; col < newBoard[0].length; col++) {
      let column = newBoard.map((row: (Tile | null)[]) => row[col])
      const originalColumn = JSON.stringify(column)
      
      // For down movement, reverse the column first
      if (direction === 'down') {
        column = column.reverse()
      }
      
      let compressed = compress(column)
      let [merged, score] = merge(compressed)
      merged = compress(merged)
      
      // For down movement, reverse back
      if (direction === 'down') {
        merged = merged.reverse()
      }

      for (let row = 0; row < newBoard.length; row++) {
        newBoard[row][col] = merged[row]
      }

      scoreGain += score
      if (originalColumn !== JSON.stringify(merged)) {
        moved = true
      }
    }
  }

  return {
    board: newBoard,
    scoreGain,
    moved,
  }
}

/**
 * Vérifier s'il y a une tuile avec la valeur 2048 (victoire)
 */
export function checkWin(board: (Tile | null)[][]): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] && board[row][col]!.value === 2048) {
        return true
      }
    }
  }
  return false
}

/**
 * Vérifier s'il y a encore des mouvements possibles
 */
export function canMove(board: (Tile | null)[][]): boolean {
  // Y a-t-il une position vide ?
  if (getEmptyPositions(board).length > 0) {
    return true
  }

  // Y a-t-il deux tuiles adjacentes avec la même valeur ?
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const current = board[row][col]
      if (current === null) continue

      // Vérifier droite
      if (col < board[row].length - 1 && board[row][col + 1] && board[row][col + 1]!.value === current.value) {
        return true
      }
      // Vérifier bas
      if (row < board.length - 1 && board[row + 1][col] && board[row + 1][col]!.value === current.value) {
        return true
      }
    }
  }

  return false
}

/**
 * Vérifier si le jeu est terminé
 */
export function isGameOver(board: (Tile | null)[][]): boolean {
  return !canMove(board)
}

/**
 * Cloner la board
 */
export function cloneBoard(board: (Tile | null)[][]): (Tile | null)[][] {
  return JSON.parse(JSON.stringify(board))
}

/**
 * Vérifier si deux boards sont identiques
 */
export function boardsEqual(board1: (Tile | null)[][], board2: (Tile | null)[][]): boolean {
  for (let row = 0; row < board1.length; row++) {
    for (let col = 0; col < board1[row].length; col++) {
      const t1 = board1[row][col]
      const t2 = board2[row][col]

      if ((t1 === null && t2 !== null) || (t1 !== null && t2 === null)) {
        return false
      }
      if (t1 !== null && t2 !== null && t1.value !== t2.value) {
        return false
      }
    }
  }
  return true
}

/**
 * Effectuer un mouvement complet : move -> spawn -> check
 */
export function playMove(
  board: (Tile | null)[][],
  direction: Direction
): {
  board: (Tile | null)[][]
  scoreGain: number
  moved: boolean
  gameOver: boolean
  won: boolean
} {
  const moveResult = move(board, direction)

  if (!moveResult.moved) {
    return {
      board: moveResult.board,
      scoreGain: 0,
      moved: false,
      gameOver: isGameOver(moveResult.board),
      won: checkWin(moveResult.board),
    }
  }

  const newBoard = spawnTile(moveResult.board)
  const gameOver = isGameOver(newBoard)
  const won = checkWin(newBoard)

  return {
    board: newBoard,
    scoreGain: moveResult.scoreGain,
    moved: true,
    gameOver,
    won,
  }
}

/**
 * Initialiser l'état complet du jeu
 */
export function initializeGameState(gridSize: number = 4): BoardState {
  return {
    tiles: initializeGameBoard(gridSize),
    score: 0,
    bestScore: 0,
    isGameOver: false,
    isWon: false,
    moveCount: 0,
  }
}
