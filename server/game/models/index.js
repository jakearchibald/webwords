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
import mongoose from '../../mongoose-db';

const gameSchema = mongoose.Schema({
  letterBag: String,
  over: Boolean,
  started: Date,
  moves: [{
    placements: [{
      x: Number,
      y: Number,
      letter: String,
      isJoker: Boolean
    }],
    bagWasEmpty: {type: Boolean, required: true},
    date: Date
  }],
  players: [{
    score: Number,
    letters: String,
    resigned: Boolean,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true}
  }]
});

gameSchema.index({'players.user': 1, over: 1, started: 1});

export const Game = mongoose.model('Game', gameSchema);