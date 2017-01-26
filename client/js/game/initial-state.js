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
import GameStorage from '../js-common/models/game';
import Game from '../../../shared/game';
import {set as keyValSet, get as keyValGet} from '../js-common/models/key-val';

export function put(state) {
  const promises = [];

  if (state.user) {
    promises.push(keyValSet('user', state.user))
  }

  if (state.game) {
    promises.push(state.game.storage.save());
  }

  return Promise.all(promises);
}

export async function get() {
  const gameId = Number(/(\d+)\/$/.exec(location.pathname)[1]);
  const userState = keyValGet('user');
  const gameStorageState = GameStorage.getById(gameId);

  return {
    user: await userState,
    game: new Game(await gameStorageState)
  };
}