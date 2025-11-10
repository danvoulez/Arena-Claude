/**
 * ELO Calculation Rules
 * 
 * Sistema ELO padrão (como xadrez)
 * Baseado em: docs/07-REFERENCIA/FORMULAS.md
 */

const K_FACTOR = 32

/**
 * Calculate expected score for a player
 */
function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
}

/**
 * Calculate ELO changes after a battle
 * 
 * @param winnerElo ELO do vencedor
 * @param loserElo ELO do perdedor
 * @returns Novos ELOs
 */
export function calculateELO(
  winnerElo: number,
  loserElo: number
): {
  newWinnerElo: number
  newLoserElo: number
  winnerChange: number
  loserChange: number
} {
  const expectedWinner = expectedScore(winnerElo, loserElo)
  const expectedLoser = expectedScore(loserElo, winnerElo)
  
  const actualWinner = 1  // Venceu
  const actualLoser = 0   // Perdeu
  
  const newWinnerElo = winnerElo + K_FACTOR * (actualWinner - expectedWinner)
  const newLoserElo = loserElo + K_FACTOR * (actualLoser - expectedLoser)
  
  return {
    newWinnerElo: Math.round(newWinnerElo),
    newLoserElo: Math.round(newLoserElo),
    winnerChange: Math.round(K_FACTOR * (actualWinner - expectedWinner)),
    loserChange: Math.round(K_FACTOR * (actualLoser - expectedLoser))
  }
}

/**
 * Calculate ELO changes for a draw
 */
export function calculateELODraw(
  eloA: number,
  eloB: number
): {
  newEloA: number
  newEloB: number
  changeA: number
  changeB: number
} {
  const expectedA = expectedScore(eloA, eloB)
  const expectedB = expectedScore(eloB, eloA)
  
  const actualA = 0.5  // Empate
  const actualB = 0.5  // Empate
  
  const newEloA = eloA + K_FACTOR * (actualA - expectedA)
  const newEloB = eloB + K_FACTOR * (actualB - expectedB)
  
  return {
    newEloA: Math.round(newEloA),
    newEloB: Math.round(newEloB),
    changeA: Math.round(K_FACTOR * (actualA - expectedA)),
    changeB: Math.round(K_FACTOR * (actualB - expectedB))
  }
}

/**
 * Calculate ELO changes for a winner (A, B, or draw)
 */
export function calculateELOWinner(
  eloA: number,
  eloB: number,
  winner: 'A' | 'B' | 'draw'
): {
  newEloA: number
  newEloB: number
  changeA: number
  changeB: number
} {
  if (winner === 'draw') {
    return calculateELODraw(eloA, eloB)
  }
  
  if (winner === 'A') {
    const result = calculateELO(eloA, eloB)
    return {
      newEloA: result.newWinnerElo,
      newEloB: result.newLoserElo,
      changeA: result.winnerChange,
      changeB: result.loserChange
    }
  }
  
  // winner === 'B'
  const result = calculateELO(eloB, eloA)
  return {
    newEloA: result.newLoserElo,
    newEloB: result.newWinnerElo,
    changeA: result.loserChange,
    changeB: result.winnerChange
  }
}

