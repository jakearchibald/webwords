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
import regeneratorRuntime from 'regenerator-runtime/runtime';

import {loadScript, loadStyle} from '../js-common/utils';

// for node compatibility
self.global = self;
// so we don't have to keep importing it
self.regeneratorRuntime = regeneratorRuntime;

const loadings = [];

//if (!window.fetch) loadings.push(loadScript('/static/js/polyfills.js'));
Array.from(document.querySelectorAll('.lazy-css')).forEach(link => {
  loadings.push(loadStyle(link.href));
});

export default Promise.all(loadings);