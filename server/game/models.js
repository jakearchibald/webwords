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
import mongoose from '../mongoose-db';

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

const gameSchema = mongoose.Schema({
  letterBag: {type: String, default: defaultLetterBag},
  over: {type: Boolean, default: false},
  started: {type: Date, default: Date.now},
  moves: [{
    placements: [{
      x: Number,
      y: Number,
      tile: {
        letter: String,
        isJoker: Boolean
      }
    }],
    bagWasEmpty: {type: Boolean, required: true},
    date: {type: Date, default: Date.now}
  }],
  players: [{
    score: {type: Number, default: 0},
    letters: {type: String},
    resigned: {type: Boolean, default: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true}
  }]
});

gameSchema.index({'players.user': 1, over: 1, started: 1});

gameSchema.virtual('currentPlayer').get(function() {
  return this.players[this.moves.length % this.players.length];
});

gameSchema.methods.shouldNaturallyEnd = function() {
  // Can't end while there's letters in the letter bag
  if (this.letterBag) return false;

  // If a player has no letters left, it's over
  if (this.players.some(player => !player.letters)) return true;

  // Game can't end naturally until each player has played
  if (this.moves.length < this.players.length) return false;
  
  // If every player has skipped while the bag was empty, it's over
  const playersLastMove = this.moves.slice(-this.players.length);
  return playersLastMove
    .every(move => move.placements.length == 0 && move.bagWasEmpty);
  
};

export const Game = mongoose.model('Game', gameSchema);