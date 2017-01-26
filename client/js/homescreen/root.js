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
import {h} from 'preact';

import Homescreen from '../../../shared/components/homescreen';
import BoundComponent from '../../../shared/components/utils/bound-component';
import Game from '../../../shared/game';
import {put as putState, get as getState} from './initial-state';
import GameStorage from '../js-common/models/game';

export default class Root extends BoundComponent {
  constructor(props) {
    super(props);
    this.state = props.initialState;

    if (props.stateStale) this.updateStateFromNetwork();
  }
  async updateStateFromNetwork() {
    // TODO: set updating state
    try {
      const response = await fetch('/initial-state.json', {
        credentials: 'include'
      });
      const data = await response.json();
      this.setState(data);
      putState(data);
      // TODO: unset updating state
    }
    catch (err) {
      // TODO: show error
      // TODO: unset updating state
    }
  }
  async updateStateFromStorage() {
    this.setState(await getState());
  }
  onNewLocalGame() {
    const game = new Game(GameStorage.newLocal());
    game.init();
    game.storage.save();
    // TODO: just go straight to new game
    this.updateStateFromStorage();
  }
  render(props, state) {
    return <Homescreen
      user={state.user}
      games={state.games}
      onNewLocalGame={this.onNewLocalGame}
    />
  }
}