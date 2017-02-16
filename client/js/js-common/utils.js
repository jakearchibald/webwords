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
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => resolve();
    script.onerror = () => reject();
    script.src = url;
    document.head.appendChild(script);
  });
}

export function loadStyle(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.onload = () => resolve();
    link.onerror = () => reject();
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  });
}

export function transition(el, {
  duration = 1000,
  easing = 'ease',
  ...styles
}) {
  return new Promise(resolve => {
    Object.assign(el.style, styles);
    el.style.transition = `all ${duration}ms ${easing}`;
    el.style.transitionProperty = Object.keys(styles).map(key => key.replace(/-\w/g, match => match[1].toUpperCase)).join();

    function onTransitionComplete(event) {
      if (event.target != el) return;
      el.removeEventListener('transitionend', onTransitionComplete);
      el.removeEventListener('transitioncancel', onTransitionComplete);
      resolve();
    }

    el.addEventListener('transitionend', onTransitionComplete);
    el.addEventListener('transitioncancel', onTransitionComplete);
  });
}
