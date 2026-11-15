import { defineRules, refuse } from "@kampuse/games-kit/rules"

type Mark = 0 | 1 | null; // State of every cell (belongs to player 1, player 2 or none)
type Player = 0 | 1; // 2 players, 0 and 1

export type State = {
    cells: Mark[][] // The table
    next: Player // Who will play next turn
    winner: number[] | null // Empty array for draw, null for no one won yet
    turnPassed: 0 | 1 | null // if someones turn is skipped
    noValidMoves: boolean // no valid moves on the board
    highlightCell: Move | null // highlight last played move
    captureCells: Move[] // coordinates of captured pieces
}

export type Move = { // Coordinates of the played move
    x: number
    y: number
}

export type View = { // Info sent to view
    cells: Mark[][]
    legalMoves: Move[]
    turnPassed: 0 | 1 | null
    noValidMoves: boolean
    highlightCell: Move | null
    captureCells: Move[]
}

const INITIAL_TABLE: Mark[][] = [ // Initial state of the board
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 0, 1, null, null, null],
    [null, null, null, 1, 0, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
];

// 8 directions, used for capturing and checking legal moves
const DIRECTIONS: (-1 | 0 | 1)[][] = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// Returns if a coordinate is valid (0-7)
function validCoordinate(coordinate: unknown): boolean {
    return typeof coordinate === "number" && Number.isInteger(coordinate) && coordinate >= 0 && coordinate < 8;
}

// Checks if given move on the board captures along given direction
function directionCaptures(table: Mark[][], side: Player, opponent: Player, x: number, y: number, xdir: -1 | 0 | 1, ydir: -1 | 0 | 1): boolean {
    let checkX = x + xdir, checkY = y + ydir;
    let captures = false;
    while (checkX >= 0 && checkX < 8 && checkY >= 0 && checkY < 8) {
        switch (table[checkX][checkY]) {
            case null: // Empty cell, no capture
                return false;
            case side: // Own piece, return if at least one opponent piece is seen
                return captures;
            case opponent: // Opponent piece, the move can capture if an own piece is seen later, continue
                captures = true;
                break;
        }
        checkX += xdir;
        checkY += ydir;
    }
    return false; // At the end of the board without seeing an own piece, no capture
}

// Capture cells along given direction from given move coordinates, return captured cell coordinates
function captureDirections(table: Mark[][], side: Player, opponent: Player, x: number, y: number, xdir: -1 | 0 | 1, ydir: -1 | 0 | 1): Move[] {
    let checkX = x + xdir, checkY = y + ydir;
    const captureCoordinates: Move[] = []; // Record coordinates to capture, will capture when own piece is seen
    let beginCapture = false;
    while (checkX >= 0 && checkX < 8 && checkY >= 0 && checkY < 8 && !beginCapture) {
        switch (table[checkX][checkY]) {
            case null: // Empty cell, return without capturing
                return []; 
            case side: // Own piece, start capturing seen opponent pieces
                beginCapture = true;
                break;
            case opponent: // Opponent piece, add coordinates to capture
                captureCoordinates.push({ x: checkX, y: checkY });
                break;
        }
        checkX += xdir;
        checkY += ydir;
    }
    if (beginCapture) { // If own piece is seen, capture seen opponent pieces
        for (const { x, y } of captureCoordinates) {
            table[x][y] = side;
        }
        return captureCoordinates;
    }
    return []; // no own piece seen, no capture
}

function canPlay(table: Mark[][], side: Player, x: number, y: number) {
    const opponent = 1 - side as Player;
    // Check each direction including diagonal. If the move captures in at least one direction, move is legal.
    for (const [xdir, ydir] of DIRECTIONS) {
        if (directionCaptures(table, side, opponent, x, y, xdir, ydir)) {
            return true;
        }
    }
    return false;
}

// Capture pieces from all directions with the given move coordinates
function captureCells(state: State, side: Player, opponent: Player, x: number, y: number) {
    const table = state.cells;
    table[x][y] = side;
    state.captureCells = [];
    for (const [xdir, ydir] of DIRECTIONS) {
        state.captureCells.push(...captureDirections(table, side, opponent, x, y, xdir, ydir));
    }
}

// Returns if the are no empty cells left
function allCellsFull(table: Mark[][]) {
    return !table.some(row => row.some(cell => cell === null));
}

// Count the pieces of given player
function countSide(table: Mark[][], side: Player): number {
    return table.flat().filter(cell => cell === side).length;
}

// The player with the most pieces win. If the piece count is equal, the game ends in a draw.
function determineWinner(state: State, side: Player, opponent: Player) {
    const table = state.cells;
    const sideCount = countSide(table, side);
    const opponentCount = countSide(table, opponent);
    if (sideCount > opponentCount) {
        state.winner = [side];
    } else if (opponentCount > sideCount) {
        state.winner = [opponent];
    } else {
        state.winner = [];
    }
}

// Checks if the player has any legal moves
function hasLegalMoves(table: Mark[][], side: Player): boolean {
    for (let x = 0; x < 8; x += 1) {
        for (let y = 0; y < 8; y += 1) {
            if (table[x][y] === null && canPlay(table, side, x, y)) {
                return true;
            }
        }
    }
    return false;
}

// get every playable move
function getLegalMoves(table: Mark[][], side: Player): Move[] {
    const legalMoves: Move[] = [];
    for (let x = 0; x < 8; x += 1) {
        for (let y = 0; y < 8; y += 1) {
            if (table[x][y] === null && canPlay(table, side, x, y)) {
                legalMoves.push({ x, y });
            }
        }
    }
    return legalMoves;
}

// Capture cells with the given move. If the table is full, determine the winner.
// If the opponent has legal moves, its the opponents turn. If not, its the players turn again.
// If the player also has no legal moves, determine the winner. 
function mark(state: State, side: Player, x: number, y: number): State {
    const table = state.cells;
    const opponent = 1 - side as Player;
    captureCells(state, side, opponent, x, y); // Capture cells with the given move.
    state.highlightCell = { x, y };
    state.turnPassed = null; // initially null, set if the opponent loses its turn.
    if (allCellsFull(table)) { // Check if the table is full.
        determineWinner(state, side, opponent); // The game is over, determine the winner.
    } else if (hasLegalMoves(table, opponent)) { // Its the opponents turn if they have a legal move.
        state.next = opponent;
    } else if (hasLegalMoves(table, side)) { // If the player has legal moves, its their turn.
        state.next = side;
        state.turnPassed = opponent;
    } else {
        state.noValidMoves = true;
        determineWinner(state, side, opponent); // If both have no legal moves, the game is over. Determine the winner.
    }
    return state;
}

export default defineRules<State, Move, View>({
    setup: ctx => ({ cells: INITIAL_TABLE, next: ctx.random() < 0.5 ? 0 : 1, winner: null, turnPassed: null, highlightCell: null, noValidMoves: false, captureCells: [] }), // Initial state

    turn: state => state.winner ? [] : [state.next], // If a winner exists, its noones turn. Otherwise its the next person's turn.

    move: (state, side, move) => {
        const table = state.cells; // Check if the move object is valid.
        if (typeof move !== "object" || move == null || !validCoordinate(move.x) || !validCoordinate(move.y)) {
            return refuse("Pick a square.");
        }
        const { x, y } = move; // Check if the move is made to a full cell.
        if (table[x][y] != null) return refuse("That square is taken.");
        if (!canPlay(table, side as Player, x, y)) { // Determine if the is legal by checking if it captures or not.
            return refuse("You can't play there.");
        }
        return mark(state, side as Player, x, y); // Play the move.
    },

    // Every move a side can make
    moves: (state, side) => state.winner ? [] : getLegalMoves(state.cells, side as Player),

    view: (state, side) => {
        const { cells, turnPassed, highlightCell, noValidMoves, captureCells } = state;
        return { legalMoves: getLegalMoves(state.cells, side as Player), cells, turnPassed, highlightCell, noValidMoves, captureCells };
    },

    result: state => (state.winner ? { winners: state.winner } : null), // Obtain winner information from state.

    timeout: (state, side, ctx) => { // Make a random legal move if out of time.
        const table = state.cells;
        const legalMoves = getLegalMoves(table, side as Player);
        const randomMove = legalMoves[Math.floor(ctx.random() * legalMoves.length)];
        return mark(state, side as Player, randomMove.x, randomMove.y);
    },

    leave: (state, side) => { // If one player leaves, the other wins.
        state.winner = [side === 0 ? 1 : 0];
        return state;
    },
});