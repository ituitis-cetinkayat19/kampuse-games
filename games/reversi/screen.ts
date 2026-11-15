import { connect, type Turn } from '@kampuse/games-kit'
import type { View } from './rules'

const WORDS = {
  tr: {
    you: 'Sen', yourTurn: 'Sıra sende', theirTurn: '{name} oynuyor', won: '{name} kazandı!', youWon: 'Kazandın! 🎉', draw: 'Berabere',
    watching: 'İzliyorsun', left: 'ayrıldı', leave: 'Masadan ayrıl', yourTurnPassed: 'Geçerli hamlen kalmadı, sıran geçti.', opponentTurnPassed: 'Rakibinin geçerli hamlesi kalmadı, sıra sende.', viewerTurnPassed: 'Geçerli hamlesi kalmadı, sırası geçti.', noValidMoves: 'Geçerli hamle kalmadı, oyun bitti.',
    'Pick a square.': 'Bir kare seç.', 'That square is taken.': 'O kare dolu.', 'You can\'t play there.': 'Oraya oynayamazsın.', 'Not your turn.': 'Sıra sende değil.', 'The game is over.': 'Oyun bitti.',
  },
  en: {
    you: 'You', yourTurn: 'Your turn', theirTurn: '{name} is playing', won: '{name} won!', youWon: 'You won! 🎉', draw: 'Draw',
    watching: 'Watching', left: 'left', leave: 'Leave the table', yourTurnPassed: 'You have no valid moves left, your turn has passed.', opponentTurnPassed: 'Opponent has no valid moves left, your turn.', viewerTurnPassed: 'No valid moves left, their turn has passed.', noValidMoves: 'No valid moves left, the game is over.',
    'Pick a square.': 'Pick a square.', 'That square is taken.': 'That square is taken.', 'You can\'t play there.': 'You can\'t play there.', 'Not your turn.': 'Not your turn.', 'The game is over.': 'The game is over.',
  },
};

const kampuse = await connect<View>('reversi');
const words: Record<string, string> = WORDS[kampuse.lang];
const say = (key: string, vars: Record<string, string> = {}) => (words[key] ?? key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
const MARKS = ['⚫', '⚪'];

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="players"></div>
  <div class="status"></div>
  <div class="board"></div>
  ${kampuse.watching ? '' : `<button class="leave">${say('leave')}</button>`}`;
const playersEl = app.querySelector<HTMLElement>('.players')!;
const statusEl = app.querySelector<HTMLElement>('.status')!;
const boardEl = app.querySelector<HTMLElement>('.board')!;
app.querySelector('.leave')?.addEventListener('click', () => kampuse.leave());

const cells = Array.from({ length: 64 }, (_, i) => {
  const button = document.createElement('button');
  button.className = 'cell';
  button.addEventListener('click', () => kampuse.move({ x: Math.floor(i / 8), y: i % 8 }));
  boardEl.append(button);
  return button;
});

function draw(turn: Turn<View> | null) {
  const mine = !kampuse.watching && !!turn?.turn.includes(kampuse.me.side);
  playersEl.innerHTML = kampuse.players
    .map((p) => `
      <div class="player${turn?.turn.includes(p.side) ? ' now' : ''}${p.in ? '' : ' gone'}">
        <img src="${escape(p.avatar)}" alt="">
        <div><b>${escape(p.name)}</b><small>${p.side === kampuse.me.side ? say('you') : p.in ? '' : say('left')}</small></div>
        <span class="mark">${MARKS[p.side]} ${turn?.view.cells.flat().filter(cell => cell === p.side).length}</span>
      </div>`
    )
    .join('');
  if (!turn) return;

  const blackPiece = `<div class="piece black-piece" />`;
  const whitePiece = `<div class="piece white-piece" />`;

  const captureIndices = turn.view.captureCells.map(cell => cell.x * 8 + cell.y);

  turn.view.cells.flat().forEach((c, i) => {
    const x = Math.floor(i / 8), y = i % 8;
    const even = (x + y) % 2 == 0;
    const button = cells[i];
    const highLightCell = turn.view.highlightCell;
    const isHighlight = highLightCell != null && highLightCell.x === x && highLightCell.y === y;
    button.innerHTML = c === null ? '' : (c === 0 ? blackPiece : whitePiece);
    button.className = `cell${c === null && mine ? ' open' : ''}${even ? ' even' : ' odd'}${isHighlight ? ' highlight' : ''}${captureIndices.includes(i) ? ' captured' : ''}`;
    button.disabled = !mine || c !== null;
  });
  if (mine) {
    turn.view.legalMoves.forEach(move => {
      const i = move.x * 8 + move.y;
      const button = cells[i];
      button.innerHTML = `<div class="available-cell" />`;
    });
  }
  statusEl.innerHTML = statusText(turn, mine);

  const { turnPassed, noValidMoves } = turn.view;
  if (noValidMoves) {
    showToast('noValidMoves', 3000);
  }
  if (turnPassed != null) {
    showToast(kampuse.me.side === -1 ? 'viewerTurnPassed' : (turnPassed === kampuse.me.side ? 'yourTurnPassed' : 'opponentTurnPassed'), 3000);
  }
}

function statusText(turn: Turn<View>, mine: boolean): string {
  if (turn.over) {
    const [winner] = turn.over.winners;
    if (winner === undefined) return say('draw');
    return winner === kampuse.me.side ? say('youWon') : say('won', { name: escape(kampuse.players[winner].name) });
  }
  const clock = turn.ends === null ? '' : ` <span class="clock">${Math.max(0, Math.ceil((turn.ends - Date.now()) / 1000))}</span>`;
  if (mine) return say('yourTurn') + clock;
  const name = kampuse.players[turn.turn[0]]?.name ?? '';
  return (kampuse.watching ? `${say('watching')} · ` : '') + say('theirTurn', { name: escape(name) }) + clock;
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function showToast(message: string, time: number) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = say(message);
  document.body.append(toast);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.remove(), time);
}

let toastTimer = 0;
kampuse.on('refused', reason => showToast(reason, 1800));
kampuse.on('view', draw);
kampuse.on('players', () => draw(kampuse.last));
// The seconds left, ticking.
setInterval(() => kampuse.last && !kampuse.last.over && (statusEl.innerHTML = statusText(kampuse.last, !kampuse.watching && kampuse.last.turn.includes(kampuse.me.side))), 500);
draw(kampuse.last);
