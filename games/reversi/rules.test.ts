import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fuzz, startGame } from '@kampuse/games-kit/testing'
import rules from './rules'

//White starts and black wins

type TestMove = {
  side: number
  move: { x: number, y: number }
};

const WHITE_STARTS_BLACK_WINS: TestMove[] = [
  { side: 1, move: { x: 5, y: 4 } },
  { side: 0, move: { x: 5, y: 3 } },
  { side: 1, move: { x: 2, y: 2 } },
  { side: 0, move: { x: 3, y: 5 } },
  { side: 1, move: { x: 6, y: 3 } },
  { side: 0, move: { x: 6, y: 4 } },
  { side: 1, move: { x: 3, y: 6 } },
  { side: 0, move: { x: 7, y: 2 } },
  { side: 1, move: { x: 4, y: 5 } },
  { side: 0, move: { x: 5, y: 2 } },
  { side: 1, move: { x: 7, y: 4 } },
  { side: 0, move: { x: 2, y: 6 } },
  { side: 1, move: { x: 4, y: 2 } },
  { side: 0, move: { x: 3, y: 7 } },
  { side: 1, move: { x: 4, y: 1 } },
  { side: 0, move: { x: 4, y: 0 } },
  { side: 1, move: { x: 3, y: 0 } },
  { side: 0, move: { x: 1, y: 1 } },
  { side: 1, move: { x: 2, y: 7 } },
  { side: 0, move: { x: 6, y: 2 } },
  { side: 1, move: { x: 5, y: 1 } },
  { side: 0, move: { x: 7, y: 5 } },
  { side: 1, move: { x: 3, y: 2 } },
  { side: 0, move: { x: 3, y: 1 } },
  { side: 1, move: { x: 1, y: 6 } },
  { side: 0, move: { x: 6, y: 0 } },
  { side: 1, move: { x: 5, y: 0 } },
  { side: 0, move: { x: 1, y: 7 } },
  { side: 1, move: { x: 2, y: 4 } },
  { side: 0, move: { x: 6, y: 1 } },
  { side: 1, move: { x: 7, y: 6 } },
  { side: 0, move: { x: 5, y: 5 } },
  { side: 1, move: { x: 1, y: 3 } },
  { side: 0, move: { x: 2, y: 5 } },
  { side: 1, move: { x: 6, y: 5 } },
  { side: 0, move: { x: 0, y: 2 } },
  { side: 1, move: { x: 1, y: 5 } },
  { side: 0, move: { x: 0, y: 7 } },
  { side: 1, move: { x: 7, y: 1 } },
  { side: 0, move: { x: 2, y: 0 } },
  { side: 1, move: { x: 2, y: 1 } },
  { side: 0, move: { x: 4, y: 7 } },
  { side: 1, move: { x: 0, y: 4 } },
  { side: 0, move: { x: 1, y: 4 } },
  { side: 1, move: { x: 7, y: 3 } },
  { side: 0, move: { x: 7, y: 0 } },
  { side: 1, move: { x: 2, y: 3 } },
  { side: 0, move: { x: 4, y: 6 } },
  { side: 1, move: { x: 0, y: 0 } },
  { side: 0, move: { x: 1, y: 0 } },
  { side: 1, move: { x: 0, y: 6 } },
  { side: 0, move: { x: 1, y: 2 } },
  { side: 1, move: { x: 5, y: 6 } },
  { side: 0, move: { x: 7, y: 7 } },
  { side: 1, move: { x: 0, y: 1 } },
  { side: 0, move: { x: 5, y: 7 } },
  { side: 1, move: { x: 6, y: 7 } },
  { side: 0, move: { x: 0, y: 5 } },
  { side: 1, move: { x: 6, y: 6 } },
  { side: 0, move: { x: 0, y: 3 } }
];

const BLACK_STARTS_WHITE_WINS: TestMove[] = [
  { side: 0, move: { x: 2, y: 4 } },
  { side: 1, move: { x: 4, y: 5 } },
  { side: 0, move: { x: 5, y: 6 } },
  { side: 1, move: { x: 1, y: 4 } },
  { side: 0, move: { x: 3, y: 5 } },
  { side: 1, move: { x: 2, y: 2 } },
  { side: 0, move: { x: 4, y: 2 } },
  { side: 1, move: { x: 3, y: 6 } },
  { side: 0, move: { x: 0, y: 4 } },
  { side: 1, move: { x: 1, y: 3 } },
  { side: 0, move: { x: 2, y: 5 } },
  { side: 1, move: { x: 5, y: 4 } },
  { side: 0, move: { x: 1, y: 2 } },
  { side: 1, move: { x: 6, y: 7 } },
  { side: 0, move: { x: 5, y: 3 } },
  { side: 1, move: { x: 4, y: 1 } },
  { side: 0, move: { x: 5, y: 2 } },
  { side: 1, move: { x: 0, y: 3 } },
  { side: 0, move: { x: 3, y: 0 } },
  { side: 1, move: { x: 6, y: 1 } },
  { side: 0, move: { x: 2, y: 3 } },
  { side: 1, move: { x: 4, y: 0 } },
  { side: 0, move: { x: 3, y: 1 } },
  { side: 1, move: { x: 6, y: 3 } },
  { side: 0, move: { x: 2, y: 6 } },
  { side: 1, move: { x: 1, y: 7 } },
  { side: 0, move: { x: 5, y: 1 } },
  { side: 1, move: { x: 5, y: 0 } },
  { side: 0, move: { x: 0, y: 5 } },
  { side: 1, move: { x: 0, y: 6 } },
  { side: 0, move: { x: 6, y: 4 } },
  { side: 1, move: { x: 6, y: 5 } },
  { side: 0, move: { x: 3, y: 7 } },
  { side: 1, move: { x: 2, y: 0 } },
  { side: 0, move: { x: 5, y: 5 } },
  { side: 1, move: { x: 1, y: 6 } },
  { side: 0, move: { x: 0, y: 2 } },
  { side: 1, move: { x: 1, y: 1 } },
  { side: 0, move: { x: 7, y: 2 } },
  { side: 1, move: { x: 1, y: 5 } },
  { side: 0, move: { x: 0, y: 0 } },
  { side: 1, move: { x: 6, y: 2 } },
  { side: 0, move: { x: 0, y: 7 } },
  { side: 1, move: { x: 2, y: 7 } },
  { side: 0, move: { x: 6, y: 0 } },
  { side: 1, move: { x: 2, y: 1 } },
  { side: 0, move: { x: 5, y: 7 } },
  { side: 1, move: { x: 4, y: 6 } },
  { side: 0, move: { x: 7, y: 3 } },
  { side: 1, move: { x: 6, y: 6 } },
  { side: 0, move: { x: 7, y: 7 } },
  { side: 1, move: { x: 7, y: 0 } },
  { side: 0, move: { x: 7, y: 6 } },
  { side: 1, move: { x: 1, y: 0 } },
  { side: 0, move: { x: 3, y: 2 } },
  { side: 1, move: { x: 4, y: 7 } },
  { side: 0, move: { x: 0, y: 1 } },
  { side: 1, move: { x: 7, y: 1 } },
  { side: 1, move: { x: 7, y: 4 } },
  { side: 0, move: { x: 7, y: 5 } }
];

const BLACK_STARTS_DRAW: TestMove[] = [
  { side: 0, move: { x: 2, y: 4 } },
  { side: 1, move: { x: 2, y: 3 } },
  { side: 0, move: { x: 3, y: 2 } },
  { side: 1, move: { x: 4, y: 5 } },
  { side: 0, move: { x: 2, y: 2 } },
  { side: 1, move: { x: 1, y: 4 } },
  { side: 0, move: { x: 5, y: 3 } },
  { side: 1, move: { x: 6, y: 2 } },
  { side: 0, move: { x: 1, y: 5 } },
  { side: 1, move: { x: 3, y: 1 } },
  { side: 0, move: { x: 0, y: 5 } },
  { side: 1, move: { x: 5, y: 2 } },
  { side: 0, move: { x: 5, y: 6 } },
  { side: 1, move: { x: 3, y: 5 } },
  { side: 0, move: { x: 4, y: 0 } },
  { side: 1, move: { x: 3, y: 0 } },
  { side: 0, move: { x: 4, y: 2 } },
  { side: 1, move: { x: 0, y: 4 } },
  { side: 0, move: { x: 6, y: 4 } },
  { side: 1, move: { x: 2, y: 1 } },
  { side: 0, move: { x: 5, y: 1 } },
  { side: 1, move: { x: 6, y: 0 } },
  { side: 0, move: { x: 5, y: 0 } },
  { side: 1, move: { x: 6, y: 1 } },
  { side: 0, move: { x: 1, y: 1 } },
  { side: 1, move: { x: 0, y: 1 } },
  { side: 0, move: { x: 0, y: 3 } },
  { side: 1, move: { x: 0, y: 6 } },
  { side: 0, move: { x: 1, y: 0 } },
  { side: 1, move: { x: 5, y: 4 } },
  { side: 0, move: { x: 0, y: 0 } },
  { side: 1, move: { x: 5, y: 5 } },
  { side: 0, move: { x: 0, y: 7 } },
  { side: 1, move: { x: 2, y: 0 } },
  { side: 0, move: { x: 3, y: 6 } },
  { side: 1, move: { x: 7, y: 4 } },
  { side: 0, move: { x: 7, y: 3 } },
  { side: 1, move: { x: 7, y: 1 } },
  { side: 0, move: { x: 6, y: 3 } },
  { side: 1, move: { x: 2, y: 6 } },
  { side: 0, move: { x: 7, y: 5 } },
  { side: 1, move: { x: 0, y: 2 } },
  { side: 0, move: { x: 4, y: 6 } },
  { side: 1, move: { x: 6, y: 6 } },
  { side: 0, move: { x: 7, y: 0 } },
  { side: 1, move: { x: 7, y: 2 } },
  { side: 0, move: { x: 6, y: 5 } },
  { side: 1, move: { x: 7, y: 6 } },
  { side: 0, move: { x: 2, y: 5 } },
  { side: 1, move: { x: 1, y: 6 } },
  { side: 0, move: { x: 2, y: 7 } },
  { side: 1, move: { x: 4, y: 1 } },
  { side: 0, move: { x: 6, y: 7 } },
  { side: 1, move: { x: 7, y: 7 } },
  { side: 0, move: { x: 1, y: 7 } },
  { side: 1, move: { x: 5, y: 7 } },
  { side: 0, move: { x: 3, y: 7 } },
  { side: 1, move: { x: 4, y: 7 } },
  { side: 0, move: { x: 1, y: 2 } },
  { side: 0, move: { x: 1, y: 3 } }
];

const WHITE_STARTS_DRAW: TestMove[] = [
  { side: 1, move: { x: 2, y: 3 } },
  { side: 0, move: { x: 2, y: 4 } },
  { side: 1, move: { x: 2, y: 5 } },
  { side: 0, move: { x: 4, y: 2 } },
  { side: 1, move: { x: 5, y: 4 } },
  { side: 0, move: { x: 1, y: 6 } },
  { side: 1, move: { x: 5, y: 1 } },
  { side: 0, move: { x: 6, y: 5 } },
  { side: 1, move: { x: 5, y: 3 } },
  { side: 0, move: { x: 3, y: 2 } },
  { side: 1, move: { x: 2, y: 6 } },
  { side: 0, move: { x: 3, y: 6 } },
  { side: 1, move: { x: 5, y: 5 } },
  { side: 0, move: { x: 6, y: 0 } },
  { side: 1, move: { x: 4, y: 5 } },
  { side: 0, move: { x: 1, y: 4 } },
  { side: 1, move: { x: 3, y: 1 } },
  { side: 0, move: { x: 1, y: 5 } },
  { side: 1, move: { x: 7, y: 5 } },
  { side: 0, move: { x: 6, y: 4 } },
  { side: 1, move: { x: 2, y: 2 } },
  { side: 0, move: { x: 2, y: 1 } },
  { side: 1, move: { x: 1, y: 2 } },
  { side: 0, move: { x: 4, y: 0 } },
  { side: 1, move: { x: 7, y: 3 } },
  { side: 0, move: { x: 7, y: 6 } },
  { side: 1, move: { x: 6, y: 2 } },
  { side: 0, move: { x: 0, y: 3 } },
  { side: 1, move: { x: 0, y: 6 } },
  { side: 0, move: { x: 5, y: 2 } },
  { side: 1, move: { x: 0, y: 5 } },
  { side: 0, move: { x: 1, y: 3 } },
  { side: 1, move: { x: 0, y: 4 } },
  { side: 0, move: { x: 6, y: 6 } },
  { side: 1, move: { x: 4, y: 6 } },
  { side: 0, move: { x: 4, y: 7 } },
  { side: 1, move: { x: 4, y: 1 } },
  { side: 0, move: { x: 2, y: 7 } },
  { side: 1, move: { x: 7, y: 7 } },
  { side: 0, move: { x: 7, y: 2 } },
  { side: 1, move: { x: 6, y: 3 } },
  { side: 0, move: { x: 5, y: 6 } },
  { side: 1, move: { x: 5, y: 7 } },
  { side: 0, move: { x: 1, y: 7 } },
  { side: 1, move: { x: 0, y: 2 } },
  { side: 0, move: { x: 6, y: 1 } },
  { side: 1, move: { x: 1, y: 1 } },
  { side: 0, move: { x: 1, y: 0 } },
  { side: 1, move: { x: 2, y: 0 } },
  { side: 0, move: { x: 5, y: 0 } },
  { side: 1, move: { x: 3, y: 5 } },
  { side: 0, move: { x: 7, y: 4 } },
  { side: 1, move: { x: 3, y: 7 } },
  { side: 0, move: { x: 0, y: 0 } },
  { side: 1, move: { x: 0, y: 7 } },
  { side: 0, move: { x: 3, y: 0 } },
  { side: 1, move: { x: 7, y: 0 } },
  { side: 0, move: { x: 7, y: 1 } },
  { side: 1, move: { x: 0, y: 1 } },
  { side: 0, move: { x: 6, y: 7 } }
];

function fresh(seed = 7) {
  const game = startGame(rules, { players: 2, seed });
  const first = game.turn[0];
  return { game, first, second: 1 - first };
}

test('win scenarios', () => {
  const { game, first, second } = fresh();
  const blackStarts = first === 0;
  for (const { side, move } of (blackStarts ? BLACK_STARTS_WHITE_WINS : WHITE_STARTS_BLACK_WINS)) {
    assert.deepEqual(game.move(side, move), { ok: true });
  }
  assert.deepEqual(game.over, { winners: [second] });
  assert.deepEqual(game.turn, []);
  assert.ok(game.replays());
  assert.deepEqual(game.notes, []);
});

test('draw scenarios', () => {
  const { game, first } = fresh();
  const blackStarts = first === 0;
  for (const { side, move } of (blackStarts ? BLACK_STARTS_DRAW : WHITE_STARTS_DRAW)) {
    assert.deepEqual(game.move(side, move), { ok: true });
  }
  assert.deepEqual(game.over, { winners: [] });
  assert.deepEqual(game.turn, []);
  assert.ok(game.replays());
  assert.deepEqual(game.notes, []);
});

test('bad moves are refused, and nothing changes', () => {
  const { game, first, second } = fresh();
  assert.deepEqual(game.move(first, { x: 3, y: 3 }), { refused: 'That square is taken.'});
  assert.deepEqual(game.move(first, { x: 10, y: 10 }), { refused: 'Pick a square.'});
  assert.deepEqual(game.move(first, 'four' as never), { refused: 'Pick a square.'});
  assert.deepEqual(game.move(second, { x: 2, y: 2 }), { refused: 'Not your turn.'});
  assert.deepEqual(game.move(first, { x: 2, y: 2 }), { refused: 'You can\'t play there.'});
  assert.equal(game.steps.length, 1);
});

test('running out of time plays a free square', () => {
  const { game, first } = fresh();
  game.timeout(first);
  assert.equal(game.view(null).cells.flat().filter(c => c !== null).length, 5);
  assert.ok(!game.turn.includes(first));
});

test('leaving gives the game to the other side', () => {
  const { game, first, second } = fresh();
  game.leave(first);
  assert.deepEqual(game.over, { winners: [second] });
});

test('500 random games all end, with no problems', () => {
  const report = fuzz(rules, { games: 500, players: 2 });
  assert.deepEqual(report.problems, []);
  assert.equal(report.ended, 500);
});