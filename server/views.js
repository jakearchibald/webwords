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
import fs from 'fs';

import {h} from 'preact';
import render from 'preact-render-to-string';

import promisify from './promisify';
import indexTemplate from './templates/index';
import Homescreen from './shared/components/homescreen';
import {escapeJSONString} from './utils';

const readFile = promisify(fs, 'readFile');

function getInitialState(req) {
  const initialState = {
    user: null
  };

  if (req.user) {
    initialState.user = {
      twitterHandle: req.user.twitterHandle,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl
    };
  }

  return initialState;
}

export function initialState(req, res) {
  res.json(getInitialState(req));
}

export async function home(req, res) {
  const initialState = getInitialState(req);

  res.send(
    indexTemplate({
      content: render(<Homescreen user={initialState.user} server={true}/>),
      title: 'Web Words',
      inlineCss: await readFile(`${__dirname}/static/css/index-inline.css`),
      scripts: ['/static/js/homescreen.js'],
      lazyCss: ['/static/css/index.css'],
      initialState: escapeJSONString(JSON.stringify(initialState))
    })
  );
}