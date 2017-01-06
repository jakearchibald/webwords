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
import Placement from './placement';

export default class Move {
  constructor() {
    /**
     * @type {Array<Placement>}
     */
    this.placements = [];
  }
  /**
   * @param {Tile} tile
   * @param {number} x
   * @param {number} y
   */
  add(tile, x, y) {
    this.placements.push(new Placement(tile, x, y));
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Tile}
   */
  getTile(x, y) {
    const placement = this.placements.find(p => p.x == x && p.y == y);
    return placement && placement.tile;
  }
}