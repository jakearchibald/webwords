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
} from '../utils/gl-matrix/vec2';

const DRAG_THRESHOLD = 10;

// TODO: normalise touch & mouse

export default class InteractiveTile extends BoundComponent {
  constructor(...args) {
    super(...args);
    this.startX = 0;
    this.startY = 0;
    this.pointerDown = false;
    this.wentPastThreshold = false;
  }
  onTouchStart(event) {
    // TODO: what happens if the first touch is outside this element?
    // And a second touch hits the tile?
    if (this.pointerDown) return;
    event.preventDefault();

    this.pointerDown = true;
    this.wentPastThreshold = false;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }
  onTouchMove() {
    if (!this.pointerDown) return;

    if (this.wentPastThreshold) {
      this.props.onDragMove(event.clientX, event.clientY);
      return;
    }

    const dist = vec2Distance([this.startX, this.startY], [event.touches[0].clientX, event.touches[0].clientY]);

    if (dist > DRAG_THRESHOLD) {
      this.props.onDragStart(event.touches[0].clientX, event.touches[0].clientY);
      this.wentPastThreshold = true;
    }
  }
  onTouchEnd() {
    if (!this.pointerDown) return;
    // TODO what if two touches? 

    if (this.wentPastThreshold) {
      this.props.onDragEnd(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
      this.props.onClick();
    }
  }
  onMouseDown(event) {
    // Bail if we're monitoring another pointer
    if (this.pointerDown) return;
    event.preventDefault();

    this.pointerDown = true;
    this.wentPastThreshold = false;
    this.startX = event.clientX;
    this.startY = event.clientY;
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }
  onMouseMove(event) {
    if (this.wentPastThreshold) {
      this.props.onDragMove(event.clientX, event.clientY);
      return;
    }

    const dist = vec2Distance([this.startX, this.startY], [event.clientX, event.clientY]);

    if (dist > DRAG_THRESHOLD) {
      this.props.onDragStart(event.clientX, event.clientY);
      this.wentPastThreshold = true;
    }
  }
  onMouseUp(event) {
    this.pointerDown = false;
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    if (this.wentPastThreshold) {
      this.props.onDragEnd(event.clientX, event.clientY);
    }
    else {
      this.props.onClick();
    }
  }
  render({ tile, selected }) {
    return (
      <button
        class={`tile interactive-tile ${selected ? 'selected' : ''}`}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        onMouseDown={this.onMouseDown}
        >
        {tile.letter}
      </button>
    );
  }
}
