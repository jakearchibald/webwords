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

import {transition} from '../js-common/utils';
import {easeOutQuint} from '../js-common/css-easings'

const proxyEl = document.querySelector('.proxy-el-container');

export default class Root extends BoundComponent {
  constructor(props) {
    super(props);

    // Transitions to complete on next render
    // For tile transitions:
    // {from: {location: 'rack', x: 1}, to: {location: 'board', x: 0, y: 0}}
    this.pendingTileTransitions = [];

    // Set up state
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
  // removes it, and returns it, & where it came from
  getAndRemoveSelectedTile() {
    let tile;
    let from;
    // Find selected tile in the rack
    const selectedRackIndex = this.state.tileRack.findIndex(tile => tile && tile.selected);

    if (selectedRackIndex != -1) {
      tile = this.state.tileRack[selectedRackIndex];
      // Remove it
      this.state.tileRack[selectedRackIndex] = undefined;
      from = {location: 'rack', x: selectedRackIndex};
    }
    else {
      // Look for the selected tile on the board
      let unplayedKey;
      [unplayedKey, tile] = Object.entries(this.state.unplayedPlacements).find(([key, tile]) => tile.selected);
      // Remove it
      delete this.state.unplayedPlacements[unplayedKey];
      const [x, y] = unplayedKey.split(':').map(n => Number(n));
      from = { location: 'board', x, y };
    }

    return [tile, from];
  }
  onBoardSpaceClick(event, x, y) {
    const [tile, from] = this.getAndRemoveSelectedTile();

    tile.selected = false;
    this.state.unplayedPlacements[`${x}:${y}`] = tile;

    this.pendingTileTransitions.push({from, to: {
      location: 'board',
      x, y
    }});

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: false,
      unplayedPlacements: this.state.unplayedPlacements
    });
  }
  onRackSpaceClick(event, x) {
    const [tile, from] = this.getAndRemoveSelectedTile();

    tile.selected = false;
    this.state.tileRack[x] = tile;

    this.pendingTileTransitions.push({from, to: {
      location: 'rack',
      x
    }});

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: false,
      unplayedPlacements: this.state.unplayedPlacements
    });
  }
  async updateStateFromNetwork() {
    throw Error('not implemented yet');
  }
  getTileContainerEl(location, x, y) {
    if (location == 'rack') {
      return document.querySelector('.letter-rack').children[x];
    }
    return document.querySelectorAll('.board > tr')[y].children[x].querySelector('.cell-inner');
  }
  performTileTransitions() {
    // This whole thing is a little off piste in terms of preact,
    // but it's fast & simple.
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;

    for (const {from, to} of this.pendingTileTransitions) {
      // Gather position data
      const startEl = this.getTileContainerEl(from.location, from.x, from.y);
      const endEl = this.getTileContainerEl(to.location, to.x, to.y);
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();
      const tile = endEl.querySelector('.tile');
      const tileClone = tile.cloneNode(true);

      // Microtask for setting
      Promise.resolve().then(async () => {
        tile.style.opacity = '0';
        proxyEl.appendChild(tileClone);
        const tileRect = tileClone.getBoundingClientRect();
        const startScale = startRect.width / tileRect.width;
        const endScale = endRect.width / tileRect.width;

        // Start
        tileClone.style.transform = `translate(${startRect.left + scrollLeft}px, ${startRect.top + scrollTop}px) scale(${startScale})`;
        // Force layout :(
        tileClone.offsetWidth;

        // Transition to end
        await transition(tileClone, {
          transform: `translate(${endRect.left + scrollLeft}px, ${endRect.top + scrollTop}px) scale(${endScale})`,
          duration: 500,
          easing: easeOutQuint
        });

        // Tidy up
        proxyEl.removeChild(tileClone);
        tile.style.opacity = '';
      });
    }

    // Done! Empty the list
    this.pendingTileTransitions = [];
  }
  componentDidUpdate() {
    if (this.pendingTileTransitions[0]) this.performTileTransitions();
  }
  render(props, { game, user, tileRack, tileSelected, unplayedPlacements }) {
    return <Game
      {...{ game, user, tileRack, tileSelected, unplayedPlacements }}
      onBoardSpaceClick={this.onBoardSpaceClick}
      onRackSpaceClick={this.onRackSpaceClick}
    />
  }
}