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
import LetterRack from './letter-rack';
import Header from './header';
import Board from '../../game/board';
import Move from '../../game/move';

/**
 * Creates a state object based on the attempted move
 * @param {Board} board
 * @param {any} unplayedPlacements
 */
function analyseMove(board, unplayedPlacements) {
  const move = new Move();
  const ret = {
    validPlacement: false,
    score: false
  };

  for (const [key, tileSpec] of Object.entries(unplayedPlacements)) {
    if (!tileSpec) continue;
    const [x, y] = key.split(':').map(n => Number(n));
    move.add(tileSpec.tile, x, y);
  }

  ret.validPlacement = board.placementsValid(move);

  if (ret.validPlacement) {
    // Get score
    const words = board.getWordsForMove(move);
    ret.score = board.getScoreForWords(words);

    // Get position for "score" indicator
    const longestWord = words.reduce((word1, word2) => {
      return word1.placements.length > word2.placements.length ?
        word1 : word2;
    });

    const {x, y} = longestWord.placements[longestWord.placements.length - 1];
    ret.scorePosition = {x, y}; 
  }

  return ret;
}

export default class App extends BoundComponent {
  getThisPlayer() {
    const game = this.props.game;

    if (!game) return null;
    if (game.local) return game.currentPlayer;

    throw Error('TODO: implement non-local games');
  }
  render({
    game, server, tileRack, tileSelected,
    unplayedPlacements = {},
    onBoardSpaceClick, onRackSpaceClick
  }) {
    const board = game ? game.createBoard() : new Board();
    const {validPlacement, score, scorePosition} = analyseMove(board, unplayedPlacements);

    return (
      <div class="game">
        <Header/>
        <div class="action-row">
          {game ?
            <Players players={game.players} currentPlayer={game.currentPlayer} local={game.local} />
            :
            <Players/>
          }
        </div>
        <Zoomer>
          {!server &&
            <BoardComponent
              enableTileButtons={tileSelected}
              {...{
                board, unplayedPlacements,
                score, scorePosition,
                onBoardSpaceClick
              }}
            />
          }
        </Zoomer>
        <LetterRack 
          tiles={tileRack}
          enableTileButtons={tileSelected}
          {...{onRackSpaceClick}}
        />
      </div>
    );
  }
}
