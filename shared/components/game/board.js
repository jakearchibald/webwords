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

export default class Board extends BoundComponent {
  constructor(props) {
    super(props);
  }
  render({board}) {
    const boardVDomRows = [];

    for (let y = 0; y < board.height; y++) {
      const row = [];
      boardVDomRows.push(row);

      for (let x = 0; x < board.width; x++) {
        const action = board.getActionTile(x, y);
        //TODO: const tile = board.getTile(x, y);

        row.push(
          <td>
            {action &&
              <div class="action-tile">{action}</div>
            }
          </td>
        )
      }
    }

    return (
      <table class="board">
        {boardVDomRows.map(row =>
          <tr>{row}</tr>
        )}
      </table>
    );
  }
}
