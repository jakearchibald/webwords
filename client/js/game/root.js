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

    this.state.tileSelected = false;
    // Not-yet-played tiles on the board
    this.state.unplayedPlacements = {};
    // The "local player" is the one who's operating the device.
    // This is always the current player in a local game.
    this.state.tileRack = new Array(7).fill(undefined);

    const localPlayerLetters = this.state.game.players[this.state.localPlayerIndex].letters;

    [...localPlayerLetters].forEach((letter, i) => {
      const tile = {
        tile: new Tile(letter, letter = ' '),
        selected: false,
        onClick: event => this.onTileClick(event, tile)
      };

      this.state.tileRack[i] = tile;
    });

    if (props.stateStale) this.updateStateFromNetwork();
  }
  onTileClick(event, tile) {
    // Deselected selected tile
    if (tile.selected) {
      tile.selected = false;

      this.setState({
        tileRack: this.state.tileRack,
        tileSelected: false
      });
      return;
    }

    // Deselect other tiles & select this one
    // Tiles on the board:
    for (const index of Object.keys(this.state.unplayedPlacements)) {
      this.state.unplayedPlacements[index].selected = false;
    }
    // Tiles in the rack:
    for (const otherTile of this.state.tileRack) if (otherTile) {
      otherTile.selected = false;
    }

    // Activate this tile
    tile.selected = true;

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: true
    });
  }
  // Gets the currently selected tile from either the rack or the board,
  // removes it, and returns it.
  getAndRemoveSelectedTile() {
    let tile;
    // Find selected tile in the rack
    const selectedRackIndex = this.state.tileRack.findIndex(tile => tile && tile.selected);

    if (selectedRackIndex != -1) {
      tile = this.state.tileRack[selectedRackIndex];
      // Remove it
      this.state.tileRack[selectedRackIndex] = undefined;
    }
    else {
      // Look for the selected tile on the board
      let unplayedKey;
      [unplayedKey, tile] = Object.entries(this.state.unplayedPlacements).find(([key, tile]) => tile.selected);
      // Remove it
      delete this.state.unplayedPlacements[unplayedKey];
    }

    return tile;
  }
  onBoardSpaceClick(event, x, y) {
    const tile = this.getAndRemoveSelectedTile();

    tile.selected = false;
    this.state.unplayedPlacements[`${x}:${y}`] = tile;

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: false,
      unplayedPlacements: this.state.unplayedPlacements
    });
  }
  onRackSpaceClick(event, x) {
    const tile = this.getAndRemoveSelectedTile();

    tile.selected = false;
    this.state.tileRack[x] = tile;

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: false,
      unplayedPlacements: this.state.unplayedPlacements
    });
  }
  async updateStateFromNetwork() {
    throw Error('not implemented yet');
  }
  render(props, { game, user, tileRack, tileSelected, unplayedPlacements }) {
    return <Game
      {...{ game, user, tileRack, tileSelected, unplayedPlacements }}
      onBoardSpaceClick={this.onBoardSpaceClick}
      onRackSpaceClick={this.onRackSpaceClick}
    />
  }
}