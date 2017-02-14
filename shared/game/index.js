/**
*
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import ExtendableError from 'es6-error';

import Move from './move';
import Board from './board';
import Tile from './tile';
import {scores as letterScores} from './tile';

export class InvalidPlacementError extends ExtendableError {}
export class TileNotOwnedError extends ExtendableError {}
export class GameOverError extends ExtendableError {}
export class NotInDictionaryError extends ExtendableError {
  /**
   * @param {Array<String>} invalidWords
   * @param {String} description
   */
  constructor(invalidWords, description) {
    super(description);
    this.invalidWords = invalidWords;
  }
}

const LETTERS_PER_PLAYER = 7;

const letterFrequency = [
  // frequency, letters
  [1, 'kjxqz'],
  [2, ' bcmpfhvwy'],
  [3, 'g'],
  [4, 'lsud'],
  [6, 'nrt'],
  [8, 'o'],
  [9, 'ai'],
  [12, 'e']
];

function defaultLetterBag() {
  return letterFrequency.reduce((str, [frequency, letters]) => {
    return str + letters.repeat(frequency);
  }, '');
}

export default class Game {
  /**
   * Creates an instance of Game.
   * 
   * @param {any} storage The underlying data object (eg, mongoose doc or plain js object)
   */
  constructor(storage) {
    this.storage = storage;
  }
  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }
  get currentPlayerIndex() {
    return this.moves.length % this.players.length;
  }
  /**
   * Set up a new game with defaults.
   */
  init() {
    this.letterBag = defaultLetterBag();
    this.over = false;
    this.started = Date.now();
    this.moves = [];

    for (const player of this.players) {
      player.letters = '';
      player.score = 0;
      player.resigned = false;
      this._giveLettersToPlayer(player);
    }
  }
  /**
   * Creates a Board for the current game.
   * 
   * @returns {Board}
   */
  createBoard() {
    const board = new Board();

    for (const move of this.moves) {
      for (const placement of move.placements) {
        board.placeTile(new Tile(placement.letter, placement.isJoker), placement.x, placement.y);
      }
    }
    return board;
  }
  /**
   * @param {Move} move
   * @param {Function} inDictionary
   * @returns {Promise<Boolean>}
   */
  async playMove(move, dictionaryLookup) {
    if (!move) throw TypeError('No move provided');
    if (this.over) throw new GameOverError();

    const board = this.createBoard();
    
    if (!board.placementsValid(move)) throw new InvalidPlacementError();

    const player = this.currentPlayer;

    // This throws if the player doesn't have the correct tiles
    this._takeLettersFromPlayer(
      this.currentPlayer,
      move.placements.map(p => p.tile.isJoker ? ' ' : p.tile.letter).join('')
    );

    const words = board.getWordsForMove(move);
    const wordStrings = words.map(word => word.toString());
    const wordsValid = await dictionaryLookup(wordStrings);
    const invalidWords = wordStrings.filter((_, i) => !wordsValid[i]);

    if (invalidWords.length > 0) {
      throw new NotInDictionaryError(invalidWords);
    }

    this.moves.push({
      bagWasEmpty: this.letterBag.length === 0,
      date: Date.now(),
      placements: move.placements.map(placement => ({
        x: placement.x,
        y: placement.y,
        letter: placement.tile.letter,
        isJoker: placement.tile.isJoker
      }))
    });

    player.score += board.getScoreForWords(words);

    // Bingo!
    if (move.placements.length == LETTERS_PER_PLAYER) {
      player.score += 50;
    }

    this._giveLettersToPlayer(player);

    // Does that signal the end of the game?
    if (player.letters.length == 0) {
      this.over = true;

      // The finishing player gets 2x the remaining tiles from other players
      for (const otherPlayer of this.players) {
        if (otherPlayer == player) continue;
        for (const letter of [...otherPlayer.letters]) {
          player.score += letterScores[letter] * 2;
        }
      }
    }
  }
  /**
   * @param {String} letters
   */
  playSwap(letters) {
    const player = this.currentPlayer;
    this._takeLettersFromPlayer(player, letters);
    this.letterBag += letters;
    this._giveLettersToPlayer(player);
    this._addSkipMove();
  }
  skipTurn() {
    this._addSkipMove();

    // The rest of this function checks to see if the game
    // should end as a result of skipping.
    if (this.letterBag.length != 0) return;
    
    // I don't see how this could realisticly happen, but
    // checking for it anyway.
    if (this.moves.length < this.players.length) return;

    const lastPlayerMoves = this.moves.slice(-this.players.length);
    const eachPlayerSkippedOnEmptyBag =
      lastPlayerMoves.every(move => move.placements.length == 0 && move.bagWasEmpty);
    
    if (!eachPlayerSkippedOnEmptyBag) return;
    this.over = true;
  }
  resignPlayer(player) {
    player.resigned = true;
    this.over = true;
  }
  _addSkipMove() {
    this.moves.push({
      bagWasEmpty: this.letterBag.length === 0,
      date: Date.now(),
      placements: []
    });
  }
  _giveLettersToPlayer(player) {
    for (let i = player.letters.length; i < LETTERS_PER_PLAYER; i++) {
      const letter = this._pickRandomLetterFromBag();
      if (!letter) return; // bag empty
      player.letters += letter;
    }
  }
  /**
   * @param {any} player
   * @param {String} letters
   */
  _takeLettersFromPlayer(player, letters) {
    let remainingPlayerLetters = player.letters;

    for (const letter of letters) {
      const index = remainingPlayerLetters.indexOf(letter);
      if (index == -1) throw new TileNotOwnedError(`Player does not have '${letter}'`);
      // Remove letter from player's set
      remainingPlayerLetters = remainingPlayerLetters.slice(0, index) + remainingPlayerLetters.slice(index + 1);
    }

    player.letters = remainingPlayerLetters;
  }
  /**
   * @returns {String}
   */
  _pickRandomLetterFromBag() {
    const letterBag = this.letterBag;
    if (!letterBag.length) return '';

    const randomIndex = Math.floor(Math.random() * letterBag.length);
    const letter = letterBag[randomIndex];

    // Remove letter from bag
    this.letterBag = letterBag.slice(0, randomIndex) + letterBag.slice(randomIndex + 1);

    return letter;
  }
}

// Proxy to storage
const propsToProxy = [
  'letterBag', 'over', 'started',
  'moves', 'players', '_id', 'local'
];

for (const prop of propsToProxy) {
  Object.defineProperty(Game.prototype, prop, {
    get() {
      return this.storage[prop];
    },
    set(val) {
      this.storage[prop] = val;
    }
  });
}