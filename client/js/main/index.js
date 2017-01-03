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
import {h, render} from 'preact';
import regeneratorRuntime from 'regenerator-runtime/runtime';
import App from '../../../shared/components/app';
// for node compatibility
self.global = self;
// so we don't have to keep importing it
self.regeneratorRuntime = regeneratorRuntime;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => resolve();
    script.onerror = () => reject();
    script.src = url;
    document.head.appendChild(script);
  });
}

function loadStyle(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.onload = () => resolve();
    link.onerror = () => reject();
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  });
}

const loadings = []; 

//if (!window.fetch) loadings.push(loadScript('/static/js/polyfills.js'));
Array.from(document.querySelectorAll('.lazy-css')).forEach(link => {
  loadings.push(loadStyle(link.href));
});

Promise.all(loadings).then(() => {
  const initialState = window.initialState;
  const main = document.querySelector('.main-content');
  const root = document.querySelector('.main-content > *');
  render(<App initialState={initialState}/>, main, root);
});