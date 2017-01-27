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

function getTouchDistance(t1, t2) {
  const xDist = Math.abs(t1.pageX - t2.pageX);
  const yDist = Math.abs(t1.pageY - t2.pageY);

  return Math.sqrt(xDist*xDist + yDist*yDist);
}

export default class Zoomer extends BoundComponent {
  constructor(props) {
    super(props);
    this.outerEl = null;
    this.innerEl = null;
    this.innerMinScale = 1;
    this.innerScale = 1;
    this.innerTranslateX = 0;
    this.innerTranslateY = 0;
    this.pinching = false;
    
    // Start of pinch
    this.activeTouchIds = [];
    this.startPinchX = 0;
    this.startPinchY = 0;
    this.startPinchDistance = 0;
    
    // During pinch
    this.endPinchDistance = 0;
  }
  onTouchStart(event) {
    // Bail if it's normal scrolling, or we're already pinching
    if (event.touches.length < 2 || this.pinching) return;
    event.preventDefault();

    this.pinching = true;
    this.activeTouchIds = [...event.touches].map(t => t.identifier);
    this.startPinchX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
    this.startPinchY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
    this.startPinchDistance = getTouchDistance(event.touches[0], event.touches[1]);
    
    // Remove regular scrolling
    this.innerTranslateX -= this.outerEl.scrollLeft;
    this.innerTranslateY -= this.outerEl.scrollTop;
    this.outerEl.style.overflow = 'hidden';
    this.outerEl.scrollLeft = 0;
    this.outerEl.scrollTop = 0;

    this.updateInnerPosition();
    
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
  }
  onTouchMove(event) {
    event.preventDefault();
    const avgX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
    const avgY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
    const distance = getTouchDistance(event.touches[0], event.touches[1]);
    const distanceDiff = distance / this.startPinchDistance;

    this.endPinchDistance = distance;

    // I can't do matrix maths so I'll let the browser do it for me:
    this.innerEl.style.transform = 
      `translate(${avgX}px, ${avgY}px) ` +
      `scale(${distanceDiff}) ` +
      `translate(${-this.startPinchX}px, ${-this.startPinchY}px) ` +
      `translate(${this.innerTranslateX}px, ${this.innerTranslateY}px) ` +
      `scale(${this.innerScale})`;
  }
  onTouchEnd(event) {
    // Bail if we've still got the original two touches
    if (
      event.touches.length >= 2 &&
      this.activeTouchIds[0] == event.touches.identifier[0] &&
      this.activeTouchIds[1] == event.touches.identifier[1]
    ) return;

    this.pinching = false;
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    // Adjust transform and scrolling so whole element can be scrolled to
    const outerBounds = this.outerEl.getBoundingClientRect();
    const innerBounds = this.innerEl.getBoundingClientRect();
    const yOffset = innerBounds.top - outerBounds.top;
    const xOffset = innerBounds.left - outerBounds.left;

    this.innerScale = Math.max(
      this.innerScale * (this.endPinchDistance / this.startPinchDistance),
      this.innerMinScale
    );
    this.innerTranslateX = 0;
    this.innerTranslateY = 0;

    this.updateInnerPosition();

    this.outerEl.style.overflow = '';
    this.outerEl.scrollTop -= yOffset;
    this.outerEl.scrollLeft -= xOffset;
  }
  onResize() {
    this.zoomToBounds();
  }
  updateInnerPosition() {
    this.innerEl.style.transform = 
      `translate(${this.innerTranslateX}px, ${this.innerTranslateY}px) ` +
      `scale(${this.innerScale})`;
  }
  zoomToBounds() {
    const outerBounds = this.outerEl.getBoundingClientRect();
    const innerBounds = this.innerEl.getBoundingClientRect();
    const innerUnscaledWidth = innerBounds.width / this.innerScale;
    const innerUnscaledHeight = innerBounds.height / this.innerScale;
    const scaleAmount = Math.min(
      outerBounds.width / innerUnscaledWidth,
      outerBounds.height / innerUnscaledHeight
    );
    const translateX = (outerBounds.width - (innerUnscaledWidth * scaleAmount)) / 2;
    const translateY = (outerBounds.height - (innerUnscaledHeight * scaleAmount)) / 2;

    this.innerScale = scaleAmount;
    this.innerMinScale = scaleAmount;
    this.innerTranslateX = translateX;
    this.innerTranslateY = translateY;

    this.updateInnerPosition();
  }
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.outerEl.addEventListener('touchstart', this.onTouchStart);
    this.zoomToBounds();
  }
  componentDidUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.outerEl.removeEventListener('touchstart', this.onTouchStart);
  }
  render({children}) {
    return (
      <div ref={el => this.outerEl = el} class="zoomer">
        <div ref={el => this.innerEl = el} class="zoomer-inner">
          {children}
        </div>
      </div>
    );
  }
}
