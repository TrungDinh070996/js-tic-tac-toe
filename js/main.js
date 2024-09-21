import {
  getCellElementAtIdx,
  getCellElementList,
  getCurrentTurnElement,
  getGameStatusElement,
  getReplayButtonElement,
} from './selectors.js';
import { TURN, CELL_VALUE, GAME_STATUS } from './constants.js';
import { checkGameStatus } from './utils.js';

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill('');

function toggleTurn() {
  // toggle turn
  currentTurn = currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS;

  //update turn on DOM element
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;

  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
  const rePlayButton = getReplayButtonElement();
  if (rePlayButton) rePlayButton.classList.add('show');
}

function highLightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3)
    throw new Error('Invalid win positions');

  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    if (cell) cell.classList.add('win');
  }
}

function handleCellClick(cell, index) {
  if (
    cell.classList.contains(TURN.CIRCLE) ||
    cell.classList.contains(TURN.CROSS) ||
    gameStatus !== GAME_STATUS.PLAYING
  )
    return;

  // set selected cell
  cell.classList.add(currentTurn);

  cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  // toggle turn
  toggleTurn();

  //check game status
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED: {
      updateGameStatus(game.status);
      showReplayButton();
      break;
    }

    case GAME_STATUS.O_WIN:
    case GAME_STATUS.X_WIN: {
      updateGameStatus(game.status);
      showReplayButton();
      highLightWinCells(game.winPositions);
      break;
    }

    default:
    //playing
  }
}

function initCellElementList() {
  const cellElementList = getCellElementList();
  cellElementList.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
  });
}

function resetGame() {
  // reset temp global vars
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => '');

  // reset dom elements
  // reset game status
  updateGameStatus(GAME_STATUS.PLAYING);

  // reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
  }
  // reset game board
  const cellElementList = getCellElementList();
  for (const cell of cellElementList) {
    cell.className='';
  }

  // hide replay button
  const rePlayButton = getReplayButtonElement();
  if (rePlayButton) rePlayButton.classList.remove('show');
}

function initReplayButton() {
  const rePlayButton = getReplayButtonElement();
  if (rePlayButton) {
    rePlayButton.addEventListener('click', resetGame);
  }
}

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
  //bind click event for all li elements
  initCellElementList();

  //bind click event for replay button
  initReplayButton();
})();
