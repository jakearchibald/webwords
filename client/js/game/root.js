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

function promiseRaf() {
  return new Promise(r => requestAnimationFrame(r));
}

export default class Root extends BoundComponent {
  constructor(props) {
    super(props);

    // Properties used during dragging
    this.draggingTile = null;
    this.dragProxyTile = null;

    // Properties used during selecting
    this.selectedTile = null;

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
        onClick: () => this.onTileClick(tile),
        onDragStart: (x, y) => this.onTileDragStart(tile, x, y),
        onDragMove: (x, y) => this.onTileDragMove(x, y),
        onDragEnd: (x, y) => this.onTileDragEnd(x, y)
      };

      this.state.tileRack[i] = tile;
    });

    if (props.stateStale) this.updateStateFromNetwork();
  }
  onTileDragStart(tile, x, y) {
    this.draggingTile = tile;
    const from = this.tileToLocation(tile);

    const tileEl = this.getTileContainerEl(from.location, from.x, from.y).querySelector('.tile');
    const tileClone = tileEl.cloneNode(true);
    const tileProxy = document.createElement('div');

    tileEl.style.opacity = 0;
    
    tileProxy.classList.add('tile-wrapper');
    tileProxy.appendChild(tileClone);
    this.dragProxyTile = tileProxy;

    tileClone.classList.remove('selected');

    proxyEl.appendChild(tileProxy);

    this.dragProxyTile.style.transform = `translate(${x}px, ${y}px)`;
  }
  onTileDragMove(x, y) {
    this.dragProxyTile.style.transform = `translate(${x}px, ${y}px)`;
  }
  onTileDragEnd(x, y) {
    // Safari doesn't support elementsFromPoint :(
    proxyEl.style.display = 'none';
    const dropEl = document.elementFromPoint(x, y);
    proxyEl.style.display = '';

    const dropContainer = dropEl.closest('.board .cell-inner, .letter-rack li');

    if (!dropContainer) {
      this.abortDrop();
      return;
    }

    // TODO: also abort if dragged over an existing tile - try to use the model not elements for this
    // TODO: try to repurpose abortDrop for the success animation
    // TODO: the start drag animation
  }
  async abortDrop() {
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;

    const tile = this.draggingTile;
    const to = this.tileToLocation(tile);
    const endEl = this.getTileContainerEl(to.location, to.x, to.y);
    const dragProxyTile = this.dragProxyTile;
    const innerTileEl = dragProxyTile.querySelector('.tile');
    const startRect = innerTileEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const startScale = 1.2;
    const endScale = endRect.width / (startRect.width / startScale);

    // reset the container's position, we're just going to transform
    // the inner element.
    dragProxyTile.style.transform = '';
    innerTileEl.style.transform = `translate(${startRect.left}px, ${startRect.top}px) scale(${startScale})`;

    // Wait a frame to allow the transition
    await promiseRaf();

    // Transition to end
    await transition(innerTileEl, {
      transform: `translate(${endRect.left + scrollLeft}px, ${endRect.top + scrollTop}px) scale(${endScale})`,
      duration: 500,
      easing: easeOutQuint
    });

    proxyEl.removeChild(dragProxyTile);
    endEl.querySelector('.tile').style.opacity = '';
  }
  onTileClick(tile) {
    // Deselected selected tile
    if (tile.selected) {
      tile.selected = false;
      this.selectedTile = null;

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
    this.selectedTile = tile;

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: true
    });
  }
  tileToLocation(tile) {
    const indexOf = this.state.tileRack.indexOf(tile);

    if (indexOf !== -1) {
      return {location: 'rack', x: indexOf}
    }

    const key = Object.entries(this.state.unplayedPlacements).find(([key, unplayedTile]) => unplayedTile == tile)[0];
    const [x, y] = key.split(':').map(n => Number(n));
    return { location: 'board', x, y };
  }
  // Gets the currently selected tile from either the rack or the board,
  // removes it, and returns it, & where it came from
  getAndRemoveSelectedTile() {
    const tile = this.selectedTile;
    const from = this.tileToLocation(tile);

    if (from.location == 'rack') {
      this.state.tileRack[from.x] = undefined;
    }
    else {
      delete this.state.unplayedPlacements[`${from.x}:${from.y}`]
    }

    return [tile, from];
  }
  async onBoardSpaceClick(event, x, y) {
    const [tile, from] = this.getAndRemoveSelectedTile();

    await this.proxyTransitionTile(from, {
      location: 'board',
      x, y
    });

    tile.selected = false;
    this.selectedTile = null;
    this.state.unplayedPlacements[`${x}:${y}`] = tile;

    this.setState({
      tileRack: this.state.tileRack,
      tileSelected: false,
      unplayedPlacements: this.state.unplayedPlacements
    });
  }
  async onRackSpaceClick(event, x) {
    const [tile, from] = this.getAndRemoveSelectedTile();

    await this.proxyTransitionTile(from, {
      location: 'rack',
      x
    });

    tile.selected = false;
    this.selectedTile = null;
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
  async proxyTransitionTile(from, to) {
    // This whole thing is a little off piste in terms of preact,
    // but it's fast.
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;

    // Gather position data
    const startEl = this.getTileContainerEl(from.location, from.x, from.y);
    const endEl = this.getTileContainerEl(to.location, to.x, to.y);
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const tile = startEl.querySelector('.tile');
    const tileClone = tile.cloneNode(true);

    tileClone.classList.remove('selected');

    tile.style.opacity = '0';
    proxyEl.appendChild(tileClone);

    const tileRect = tileClone.getBoundingClientRect();
    const startScale = startRect.width / tileRect.width;
    const endScale = endRect.width / tileRect.width;

    // Start
    tileClone.style.transform = `translate(${startRect.left + scrollLeft}px, ${startRect.top + scrollTop}px) scale(${startScale})`;
    
    // Wait a frame to allow the transition
    await promiseRaf();

    // Transition to end
    await transition(tileClone, {
      transform: `translate(${endRect.left + scrollLeft}px, ${endRect.top + scrollTop}px) scale(${endScale})`,
      duration: 500,
      easing: easeOutQuint
    });

    // Tidy up
    proxyEl.removeChild(tileClone);
    tile.style.opacity = '';
  }
  getTileContainerEl(location, x, y) {
    if (location == 'rack') {
      return document.querySelector('.letter-rack').children[x];
    }
    return document.querySelectorAll('.board > tr')[y].children[x].querySelector('.cell-inner');
  }
  render(props, { game, user, tileRack, tileSelected, unplayedPlacements }) {
    return <Game
      {...{ game, user, tileRack, tileSelected, unplayedPlacements }}
      onBoardSpaceClick={this.onBoardSpaceClick}
      onRackSpaceClick={this.onRackSpaceClick}
    />
  }
}