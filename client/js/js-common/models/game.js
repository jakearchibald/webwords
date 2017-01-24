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
import dbPromise from '../database';

// The fields that get saved to the database
const fields = [
  '_id',
  'letterBag', 'over', 'started',
  'moves', 'players', 'local'
];

export default class Game {
  constructor(init = {}) {
    for (const field of fields) {
      this[field] = init[field];
    }
  }
  static async getByImportance() {
    const db = await dbPromise;
    return db.transaction('games')
      .objectStore('games')
      .index('importance')
      .getAll();
  }
  static async getById(id) {
    const db = await dbPromise;
    return db.transaction('games')
      .objectStore('games')
      .get(id);
  }
  static newLocal() {
    return new Game({
      // TODO: make this ID better
      _id: Math.floor(Math.random() * 10000000000),
      local: true,
      players: [
        {user: {name: 'Player 1'}},
        {user: {name: 'Player 2'}}
      ]
    });
  }
  static async putMany(games) {
    const db = await dbPromise;
    const tx = db.transaction('games', 'readwrite');
    const gamesStore = tx.objectStore('games');

    for (const game of games) {
      gamesStore.put(game);
    }

    return tx.complete;
  }
  toObject() {
    const obj = {};
    for (const field of fields) {
      obj[field] = this[field];
    }
    return obj;
  }
  async save() {
    const db = await dbPromise;
    const tx = db.transaction('games', 'readwrite');
    const games = tx.objectStore('games');
    return games.put(this.toObject());
  }
}