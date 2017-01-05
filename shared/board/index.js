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
const BOARD_WIDTH = 15;
const BOARD_HEIGHT = 15;

const startSquare = {
  // In the centre
  x: (BOARD_WIDTH - 1) / 2,
  y: (BOARD_HEIGHT - 1) / 2
};

export default class Board {
  constructor() {
    this._hasTiles = false;
    this._tiles = Array(BOARD_WIDTH * BOARD_HEIGHT);
  }
  placeTile(letter, x, y) {
    const pos = BOARD_WIDTH * y + x;

    if (pos >= this._tiles.length || pos < 0) {
      throw Error('Invalid tile placement');
    }

    this._tiles[pos] = letter;
    this._hasTiles = true;
  }
  getTile(x, y) {
    const outOfBounds = (
      x < 0 || y < 0 ||
      x >= BOARD_WIDTH ||
      y >= BOARD_HEIGHT
    );

    if (outOfBounds) return undefined;

    return this._tiles[BOARD_WIDTH * y + x];
  }
  validatePlacement(move) {
    // Must have placed a tile
    if (move.placements.length == 0) return false;

    // Sort the placements, starting with the left-topmost
    const sortedPlacements = move.placements.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    let previousX;
    let previousY;
    let fixedAxis;
    let foundAdjacentExistingTile = false;
    let startSquareCovered = false;

    for (let i = 0; i < sortedPlacements.length; i++) {
      const placement = sortedPlacements[i];

      // Check for out-of-bounds
      const outOfBounds = (
        placement.x < 0 || placement.y < 0 ||
        placement.x >= BOARD_WIDTH ||
        placement.y >= BOARD_HEIGHT
      );

      if (outOfBounds) return false;

      // Check for overlap with existing tile
      if (this.getTile(placement.x, placement.y)) {
        return false;
      }

      if (i > 0) {
        if (i === 1) {
          // Find out which direction the tiles are heading in
          if (previousX == placement.x) fixedAxis = 'x';
          else if (previousY == placement.y) fixedAxis = 'y';
          // Neither equal horizontal or vertical - invalid placement
          else return false;
        }
        else { // i > 1
          // Ensure additional tiles are all horizonal or vertical
          if (fixedAxis == 'x') {
            if (placement.x != previousX) return false;
          }
          else {
            if (placement.y != previousY) return false;
          }
        }

        // Placed tiles + existing tiles must form a contiguous line along a
        // single axis. If there's a gap between the previous tile and this one,
        // ensure it's filled by tiles already on the board.
        if (fixedAxis == 'x') {
          for (let y = previousY + 1; y < placement.y; y++) {
            if (!this.getTile(placement.x, y)) return false;
          }
        }
        else {
          for (let x = previousX + 1; x < placement.x; x++) {
            if (!this.getTile(x, placement.y)) return false;
          }
        }
      }

      if (this._hasTiles) {
        // One of the placed tiles must be next to an existing tile
        if (!foundAdjacentExistingTile) {
          foundAdjacentExistingTile = (
            // up
            this.getTile(placement.x, placement.y - 1)
            ||
            // down
            this.getTile(placement.x, placement.y + 1)
            ||
            // left
            this.getTile(placement.x - 1, placement.y)
            ||
            // right
            this.getTile(placement.x + 1, placement.y)
          );
        }
      }
      else {
        // If this is the first move, it must cover the start square
        if (!startSquareCovered) {
          startSquareCovered = (
            placement.x == startSquare.x &&
            placement.x == startSquare.y
          );
        }
      }

      // Check for overlap with other tiles being placed
      for (let j = i + 1; j < sortedPlacements.length; j++) {
        const otherPlacement = sortedPlacements[j];

        if (placement.x == otherPlacement.x && placement.y == otherPlacement.y) {
          return false;
        }
      }

      previousX = placement.x;
      previousY = placement.y;
    }

    // Deal with the "at least one tile must" rules
    if (this._hasTiles && !foundAdjacentExistingTile) return false;
    if (!this._hasTiles && !startSquareCovered) return false;

    return true;
  }
  getWords(move) {

  }
  calculateScore(move) {

  }
}