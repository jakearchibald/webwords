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
    return this.players[this.moves.length % this.players.length];
  }
  /**
   * Set up a new game with defaults.
   */
  init() {
    this.letterBag = defaultLetterBag();
    this.over = false;
    this.started = Date.now();

    for (const player of this.players) {
      player.letters = '';
      player.score = 0;
      player.resigned = false;
      this._giveLettersToPlayer(player);
    }
  }
  _giveLettersToPlayer(player) {
    for (let i = player.letters.length; i < LETTERS_PER_PLAYER; i++) {
      const letter = this._pickRandomLetterFromBag();
      if (!letter) return; // bag empty
      player.letters += letter;
    }
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
  'moves', 'players'
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