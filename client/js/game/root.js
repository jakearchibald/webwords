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
import update from 'immutability-helper';

import BoundComponent from '../../../shared/components/utils/bound-component';
import Game from '../../../shared/components/game';
import Tile from '../../../shared/game/tile';

import {transition} from '../js-common/utils';
import {easeOutQuint} from '../js-common/css-easings'

const proxyEl = document.querySelector('.proxy-el-container');

function removeTile(from, state) {
  if (from.location == 'rack') {
    return update(state, {
      tileRack: { [from.x]: { $set: undefined }}
    });
  }

  return update(state, {
    unplayedPlacements: { [`${from.x}:${from.y}`]: {$set: undefined} }
  });
}

function addTile(tile, to, state) {
  if (to.location == 'rack') {
    return update(state, {
      tileRack: {[to.x]: {$set: tile}}
    });
  }

  return update(state, {
    unplayedPlacements: { [`${to.x}:${to.y}`]: { $set: tile } }
  });
}

function tileToLocation(tile, state) {
  const indexOf = state.tileRack.findIndex(rackTile => rackTile && rackTile.key == tile.key);

  if (indexOf !== -1) {
    return { location: 'rack', x: indexOf }
  }

  const key = Object.entries(state.unplayedPlacements).find(([key, unplayedTile]) => unplayedTile && unplayedTile.key == tile.key)[0];
  const [x, y] = key.split(':').map(n => Number(n));
  return { location: 'board', x, y };
}

function locationToTile(from, state) {
  if (from.location == 'rack') {
    return state.tileRack[from.x];
  }
  return state.unplayedPlacements[`${from.x}:${from.y}`];
}

function updateTileAtLocation(to, spec, state) {
  if (to.location == 'rack') {
    return update(state, {
      tileRack: { [to.x]: spec },
      tileSelected: { $set: false }
    });
  }
  return update(state, {
    unplayedPlacements: { [`${to.x}:${to.y}`]: spec },
    tileSelected: { $set: false }
  });
}

export default class Root extends BoundComponent {
  constructor(props) {
    super(props);

    // Properties used during dragging
    this.draggingTile = null;
    this.dragProxyTile = null;

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
      this.state.tileRack[i] = this.createNewTileState(letter);
    });

    if (props.stateStale) this.updateStateFromNetwork();
  }
  createNewTileState(letter) {
    const tile = {
      tile: new Tile(letter, letter == ' '),
      selected: false,
      key: Math.random(), // used in comparisons
      onClick: () => this.onTileClick(tile),
      onDragStart: (x, y) => this.onTileDragStart(tile, x, y),
      onDragMove: (x, y) => this.onTileDragMove(x, y),
      onDragEnd: (x, y) => this.onTileDragEnd(x, y)
    };

    return tile;
  }
  onTileDragStart(tile, x, y) {
    this.draggingTile = tile;
    const from = tileToLocation(tile, this.state);

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
  async onTileDragEnd(x, y) {
    const draggingTile = this.draggingTile;
    const dragProxyTile = this.dragProxyTile;

    this.draggingTile = undefined;
    this.dragProxyTile = undefined;

    // Safari doesn't support elementsFromPoint :(
    proxyEl.style.display = 'none';
    const dropEl = document.elementFromPoint(x, y);
    proxyEl.style.display = '';

    // dropEl is null if released outside of the document
    const dropContainer = dropEl && dropEl.closest('.board .cell-inner, .letter-rack li');
    const from = tileToLocation(draggingTile, this.state);
    const fromContainer = this.getTileContainerEl(from.location, from.x, from.y);

    if (!dropContainer) {
      this.animateDropEnd(dragProxyTile, fromContainer, fromContainer);
      return;
    }

    const to = this.containerToLocation(dropContainer);

    // Trying to drop on top of an existing tile?
    // If so, abort
    if (
      (to.location == 'rack' && this.state.tileRack[to.x]) ||
      this.state.unplayedPlacements[`${to.x}:${to.y}`]
    ) {
      this.animateDropEnd(dragProxyTile, fromContainer, fromContainer);
      return;
    }

    const endContainer = this.getTileContainerEl(to.location, to.x, to.y);
    await this.animateDropEnd(dragProxyTile, fromContainer, endContainer);

    let newState = this.state;

    newState = removeTile(from, newState);
    newState = addTile(draggingTile, to, newState);

    this.setState(newState);
  }
  onTileClick(tile) {
    // Deselected this tile
    if (tile.selected) {
      const location = tileToLocation(tile);
      const newState = updateTileAtLocation(location, { selected: { $set: false } }, this.state);
      newState.tileSelected = false;
      this.setState(newState);
      return;
    }

    let newState = this.state;
    const selectedTileLocation = this.getSelectedTileLocation();
    
    // Deselect currently selected tile, if any
    if (selectedTileLocation) {
      newState = updateTileAtLocation(selectedTileLocation, { selected: { $set: false } }, newState);
    }

    // Select this tile
    const tileLocation = tileToLocation(tile, this.state);
    newState = updateTileAtLocation(tileLocation, { selected: { $set: true } }, newState);
    newState.tileSelected = true;

    this.setState(newState);
  }
  containerToLocation(tileContainer) {
    if (tileContainer.closest('.letter-rack')) {
      return {
        location: 'rack',
        x: [...tileContainer.parentNode.children].indexOf(tileContainer)
      }
    }
    // Else it must be on the board
    const td = tileContainer.closest('td');
    const x = [...td.parentNode.children].indexOf(td);
    const tr = td.parentNode;
    const y = [...tr.parentNode.children].filter(el => el.tagName == 'TR').indexOf(tr);

    return {
      location: 'board',
      x, y
    };
  }
  async moveSelectedTile(to) {
    const from = this.getSelectedTileLocation();
    const tile = locationToTile(from, this.state);

    await this.proxyTransitionTile(from, to);

    let newState = this.state;
    newState = removeTile(from, newState);
    newState = addTile(update(tile, { selected: { $set: false } }), to, newState);

    newState.tileSelected = false;

    this.setState(newState);
  }
  onBoardSpaceClick(event, x, y) {
    this.moveSelectedTile({
      location: 'board',
      x, y
    });
  }
  onRackSpaceClick(event, x) {
    this.moveSelectedTile({
      location: 'rack',
      x
    });
  }
  async updateStateFromNetwork() {
    throw Error('not implemented yet');
  }
  async animateDropEnd(dragProxyTile, startEl, endEl) {
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;

    const innerTileEl = dragProxyTile.querySelector('.tile');
    const startRect = innerTileEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const startScale = 1.2;
    const endScale = endRect.width / (startRect.width / startScale);

    // reset the container's position, we're just going to transform
    // the inner element.
    dragProxyTile.style.transform = '';
    innerTileEl.style.transform = `translate(${startRect.left}px, ${startRect.top}px) scale(${startScale})`;

    // Recalc to pick up the start values
    window.getComputedStyle(innerTileEl).transform;

    // Transition to end
    await transition(innerTileEl, {
      transform: `translate(${endRect.left + scrollLeft}px, ${endRect.top + scrollTop}px) scale(${endScale})`,
      duration: 500,
      easing: easeOutQuint
    });

    proxyEl.removeChild(dragProxyTile);
    startEl.querySelector('.tile').style.opacity = '';
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
    
    // Recalc to pick up the start
    window.getComputedStyle(tileClone).transform;

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
  getSelectedTileLocation() {
    for (const [x, tile] of this.state.tileRack.entries()) {
      if (!tile) continue;
      if (tile.selected) return {location: 'rack', x};
    }

    for (const key in this.state.unplayedPlacements) {
      if (!this.state.unplayedPlacements[key]) continue;
      if (this.state.unplayedPlacements[key].selected) {
        const [x, y] = key.split(':').map(n => Number(n));

        return {
          location: 'board', x, y
        };
      }
    }
  }
  render(props, { game, user, tileRack, tileSelected, unplayedPlacements }) {
    return <Game
      {...{ game, user, tileRack, tileSelected, unplayedPlacements }}
      onBoardSpaceClick={this.onBoardSpaceClick}
      onRackSpaceClick={this.onRackSpaceClick}
    />
  }
}