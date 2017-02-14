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

import BoundComponent from '../../../shared/components/utils/bound-component';
import Game from '../../../shared/components/game';
import Tile from '../../../shared/game/tile';

export default class Root extends BoundComponent {
  constructor(props) {
    super(props);
    this.state = props.initialState;

    if (this.state.game.local) {
      this.state.localPlayerIndex = this.state.game.currentPlayerIndex;
    }
    else {
      throw Error('not implemented yet');
    }

    this.state.move = undefined;
    this.state.localPlayerTiles = new Array(7).fill(undefined);

    const localPlayerLetters = this.state.game.players[this.state.localPlayerIndex].letters;

    [...localPlayerLetters].forEach((letter, i) => {
      this.state.localPlayerTiles[i] = {
        tile: new Tile(letter, letter = ' '),
        selected: false,
        onClick: this.onTileClick
      };
    });

    if (props.stateStale) this.updateStateFromNetwork();
  }
  onTileClick(event, ...args) {
    //debugger;
    console.log(event);
    console.log('click');
  }
  async updateStateFromNetwork() {
    throw Error('not implemented yet');
  }
  render(props, {game, user, localPlayerTiles}) {
    return <Game
      game={game}
      user={user}
      localPlayerTiles={localPlayerTiles}
    />
  }
}