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
import { h } from 'preact';

import BoundComponent from '../utils/bound-component';

import {
  distance as vec2Distance
} from '../../utils/gl-matrix/vec2';

const DRAG_THRESHOLD = 10;

function getPos(event) {
  if (event.targetTouches) {
    return [event.targetTouches[0].clientX, event.targetTouches[0].clientY];
  }
  return [event.clientX, event.clientY];
}

function isNonPrimaryButton(event) {
  return event.type.startsWith('mouse') && event.button !== 0; 
}

function getId(event) {
  return event.targetTouches ?
    event.targetTouches[0].identifier : 0;
}

function idIsInTouchList(id, touchList) {
  return [...touchList].some(touch => touch.identifier == id);
}

export default class InteractiveTile extends BoundComponent {
  constructor(...args) {
    super(...args);
    this.startX = 0;
    this.startY = 0;
    this.pointerDown = false;
    this.wentPastThreshold = false;
    this.touchId = 0;
  }
  onPointerDown(event) {
    // TODO: what happens if the first touch is outside this element?
    // And a second touch hits the tile?
    if (this.pointerDown || isNonPrimaryButton(event)) return;
    event.preventDefault();

    const [x, y] = getPos(event);

    this.pointerDown = true;
    this.wentPastThreshold = false;
    this.startX = x;
    this.startY = y;
    this.touchId = getId(event);

    if (event.type.startsWith('mouse')) {
      window.addEventListener('mouseup', this.onPointerUp);
      window.addEventListener('mousemove', this.onPointerMove);
    }
  }
  onPointerMove(event) {
    if (!this.pointerDown) return;

    if (this.wentPastThreshold) {
      this.props.onDragMove(...getPos(event));
      return;
    }

    const pos = getPos(event);
    const dist = vec2Distance([this.startX, this.startY], pos);

    if (dist > DRAG_THRESHOLD) {
      this.props.onDragStart(...pos);
      this.wentPastThreshold = true;
    }
  }
  onPointerUp(event) {
    if (!this.pointerDown || isNonPrimaryButton(event)) return;

    // Watch out for unrelated touch events
    if (this.touchId && !idIsInTouchList(this.touchId, this.changedTouches)) return;
    
    event.preventDefault();

    this.pointerDown = false;
    window.removeEventListener('mouseup', this.onPointerUp);
    window.removeEventListener('mousemove', this.onPointerMove);

    if (this.wentPastThreshold) {
      this.props.onDragEnd(...getPos(event));
    }
    else {
      this.props.onClick();
    }
  }
  onKeyUp(event) {
    if (event.key == 'Enter') this.props.onClick();
  }
  render({ tile, selected }) {
    return (
      <button
        class={`tile interactive-tile ${selected ? 'selected' : ''}`}
        onTouchStart={this.onPointerDown}
        onTouchMove={this.onPointerMove}
        onTouchEnd={this.onPointerUp}
        onMouseDown={this.onPointerDown}
        onKeyUp={this.onKeyUp}
        >
        {tile.letter}
      </button>
    );
  }
}
