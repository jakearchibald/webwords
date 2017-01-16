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
import dictionaryIndex from './sowpods';

function isInIndex(word) {
  let index = dictionaryIndex;
  let i = 0;

  while (!Array.isArray(index)) {
    index = index[word[i] || ''];
    if (!index) return false;
    i++;
  }

  return index.includes(word);
}

/**
 * @param {String} word
 * @returns {Promise<Boolean>}
 */
export function includes(word) {
  return Promise.resolve(isInIndex(word));
}

/**
 * @export
 * @param {Array<String>} words
 * @returns {Promise<Array<Boolean>>}
 */
export function includesMulti(words) {
  return Promise.resolve(words.map(isInIndex));
}