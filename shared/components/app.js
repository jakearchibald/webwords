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

import BoundComponent from './bound-component';
import NewGame from './new-game';
import Status from './status';
import Board from '../game/board';
import Tile from '../game/tile';

function createBoard(ascii) {
  const board = new Board();
  const lines = ascii.split('\n')
    .map(l => l.trim()).filter(l => l)
    // remove x axis
    .slice(1)
    // remove y axis
    .map(l => l.slice(1));

  for (const [y, line] of lines.entries()) {
    for (const [x, char] of [...line].entries()) {
      if (char.trim()) board.placeTile(new Tile(char), x, y);
    }
  }

  return board;
}

function createDemoBoard() {
  return createBoard(`
    .012345678901234
    0               
    1               
    2               
    3               
    4               
    5               
    6               
    7    hello           
    8       o       
    9       v       
    0       e       
    1       sale       
    2               
    3               
    4               
  `);
}

const board = createDemoBoard();

export default class App extends BoundComponent {
  constructor(props) {
    super(props);
    this.state = props.initialState || {};
  }
  render({server}, {user}) {
    const grid = [];
    for (let y = 0; y < board.height; y++) {
      const row = [];
      grid.push(row);

      for (let x = 0; x < board.width; x++) {
        const tile = board.getTile(x, y);
        if (tile) {
          row.push(tile.letter);
          continue;
        }
        
        const action = board.getActionTile(x, y);
        if (action) {
          row.push(action);
          continue;
        }
        row.push('');
      }
    }

    return (
      <div>
        <Status user={user}/>
        <h1>Web Words</h1>
        <NewGame loggedIn={!!user} server={server}/>
        <table class="board">
          <tr>
            <th></th>
            {grid[0].map((item, i) =>
              <th>{i}</th>
            )}
          </tr>
          {grid.map((row, i) => 
            <tr>
              <th>{i}</th>
              {row.map(item => <td class={item.length == 1 && 'placement'}>{item.toUpperCase()}</td>)}
            </tr>
          )}
        </table>
      </div>
    );
  }
}
