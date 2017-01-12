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
export const scores = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2,
  h: 4, i: 1, j: 8, k: 5, l: 1, m: 3, n: 1,
  o: 1, p: 3, q: 10,r: 1, s: 1, t: 1, u: 1,
  v: 4, w: 4, x: 8, y: 4, z: 10
};

export default class Tile {
  constructor(letter, isJoker = false) {
    this.letter = letter;
    this.isJoker = isJoker;
  }
  get score() {
    return this.isJoker ? 0 : scores[this.letter];
  }
}