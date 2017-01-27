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

import BoundComponent from '../utils/bound-component';
import Players from './players';
import BoardComponent from './board';
import Zoomer from './zoomer';
import PlayerLetters from './player-letters';
import Board from '../../game/board';

export default class App extends BoundComponent {
  constructor(props) {
    super(props);
  }
  getThisPlayer() {
    const game = this.props.game;

    if (!game) return null;
    if (game.local) return game.currentPlayer;

    throw Error('TODO: implementent non-local games');
  }
  render({game, server}) {
    const board = game ? game.createBoard() : new Board();
    const thisPlayer = this.getThisPlayer();

    return (
      <div class="game">
        <div class="action-row">
          {game ?
            <Players players={game.players} currentPlayer={game.currentPlayer} local={game.local} />
            :
            <Players/>
          }
        </div>
        <Zoomer>
          {!server &&
            <BoardComponent board={board}/>
          }
        </Zoomer>
        <PlayerLetters letters={thisPlayer && thisPlayer.letters}/>
      </div>
    );
  }
}
