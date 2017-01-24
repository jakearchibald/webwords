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
import dbPromise from '../database';

export function get(key) {
  return dbPromise.then(db => {
    return db.transaction('keyval')
      .objectStore('keyval').get(key);
  });
}

export function set(key, val) {
  return dbPromise.then(db => {
    const tx = db.transaction('keyval', 'readwrite');
    tx.objectStore('keyval').put(val, key);
    return tx.complete;
  });
}

export function del(key) {
  return dbPromise.then(db => {
    const tx = db.transaction('keyval', 'readwrite');
    tx.objectStore('keyval').delete(key);
    return tx.complete;
  });
}

export function clear() {
  return dbPromise.then(db => {
    const tx = db.transaction('keyval', 'readwrite');
    tx.objectStore('keyval').clear();
    return tx.complete;
  });
}
