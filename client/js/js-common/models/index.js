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
import Game from './game';
import {set as keyValSet, get as keyValGet} from './key-val';

export function putState(state) {
  const promises = [];

  if (state.user) {
    promises.push(keyValSet('user', state.user))
  }

  if (state.games) {
    promises.push(Game.putMany(state.games));
  }

  return Promise.all(promises);
}

export async function getState() {
  const userState = keyValGet('user');
  const gameState = Game.getByImportance();

  return {
    user: await userState,
    games: await gameState
  };
}