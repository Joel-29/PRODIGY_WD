const cells = [...document.querySelectorAll('.cell')];
const modeButtons = [...document.querySelectorAll('.mode-button')];
const newGameButton = document.querySelector('#new-game');
const turnMessage = document.querySelector('#turn-message');
const turnMarker = document.querySelector('#turn-marker');
const playerScoreElement = document.querySelector('#player-score');
const opponentScoreElement = document.querySelector('#opponent-score');
const drawScoreElement = document.querySelector('#draw-score');
const opponentLabel = document.querySelector('#opponent-label');
const footerMode = document.querySelector('#footer-mode');

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let mode = 'ai';
let scores = { X: 0, O: 0, draws: 0 };
let aiTimer = null;

function getWinner(state) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) return { player: state[a], line };
  }
  return state.every(Boolean) ? { player: 'draw', line: [] } : null;
}

function updateTurnMessage() {
  if (gameOver) return;
  const isAiTurn = mode === 'ai' && currentPlayer === 'O';
  turnMarker.textContent = currentPlayer;
  turnMarker.className = `turn-marker ${currentPlayer.toLowerCase()}`;
  turnMessage.textContent = isAiTurn ? 'Computer is thinking…' : mode === 'ai' ? 'Your turn' : `${currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s turn`;
}

function render() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.className = `cell ${board[index] ? board[index].toLowerCase() : ''}`;
    cell.disabled = Boolean(board[index]) || gameOver || (mode === 'ai' && currentPlayer === 'O');
    cell.setAttribute('aria-label', board[index] ? `${board[index]} at cell ${index + 1}` : `Empty cell ${index + 1}`);
  });
  playerScoreElement.textContent = scores.X;
  opponentScoreElement.textContent = scores.O;
  drawScoreElement.textContent = scores.draws;
  opponentLabel.textContent = mode === 'ai' ? 'AI' : 'P2';
  footerMode.textContent = mode === 'ai' ? 'Playing against the computer' : 'Playing with a friend';
  updateTurnMessage();
}

function finishGame(result) {
  gameOver = true;
  if (result.player === 'draw') {
    scores.draws += 1;
    turnMessage.textContent = 'It’s a draw';
    turnMarker.textContent = '—';
  } else {
    scores[result.player] += 1;
    turnMessage.textContent = mode === 'ai' ? (result.player === 'X' ? 'You win!' : 'Computer wins') : `${result.player === 'X' ? 'Player 1' : 'Player 2'} wins!`;
  }
  render();
  result.line.forEach((index) => cells[index].classList.add('winner'));
}

function makeMove(index, player) {
  if (board[index] || gameOver) return;
  board[index] = player;
  const result = getWinner(board);
  if (result) finishGame(result);
  else {
    currentPlayer = player === 'X' ? 'O' : 'X';
    render();
    if (mode === 'ai' && currentPlayer === 'O') aiTimer = setTimeout(makeAiMove, 350);
  }
}

function minimax(state, maximizing) {
  const result = getWinner(state);
  if (result) return result.player === 'O' ? 10 : result.player === 'X' ? -10 : 0;
  const available = state.map((value, index) => value ? null : index).filter((index) => index !== null);
  const scoresForMoves = available.map((index) => {
    state[index] = maximizing ? 'O' : 'X';
    const score = minimax(state, !maximizing);
    state[index] = '';
    return score;
  });
  return maximizing ? Math.max(...scoresForMoves) : Math.min(...scoresForMoves);
}

function makeAiMove() {
  aiTimer = null;
  if (gameOver || mode !== 'ai') return;
  const available = board.map((value, index) => value ? null : index).filter((index) => index !== null);
  let bestScore = -Infinity;
  let bestMove = available[0];
  available.forEach((index) => {
    board[index] = 'O';
    const score = minimax(board, false);
    board[index] = '';
    if (score > bestScore) { bestScore = score; bestMove = index; }
  });
  makeMove(bestMove, 'O');
}

function startNewGame() {
  clearTimeout(aiTimer);
  aiTimer = null;
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  render();
}

cells.forEach((cell) => cell.addEventListener('click', () => {
  if (mode === 'ai' && currentPlayer === 'O') return;
  makeMove(Number(cell.dataset.index), currentPlayer);
}));

modeButtons.forEach((button) => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  modeButtons.forEach((item) => item.classList.toggle('active', item === button));
  scores = { X: 0, O: 0, draws: 0 };
  startNewGame();
}));

newGameButton.addEventListener('click', startNewGame);
render();
