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
import url from 'url';

import {
  getLoginUrl, getLoginData
} from '../twitter';
import {User} from './models';
import {callbackUrl} from '../settings';

export async function login(req, res) {
  try {
    res.redirect(await getLoginUrl());
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Cannot get login url");
    return;
  }
}

export async function callback(req, res) {
  const data = req.query;
  let loginData;

  try {
    loginData = await getLoginData(data.oauth_token, data.oauth_verifier);
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Cannot get login data");
    return;
  }

  try {
    await User.findOneAndUpdate({twitterId: loginData.id}, {
      twitterId: loginData.id,
      twitterHandle: loginData.screen_name,
      name: loginData.name,
      avatarUrl: loginData.profile_image_url_https.replace(/_normal\.jpg$/, '')
    }, {upsert: true, new: true, setDefaultsOnInsert: true});
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Failed to update user");
    return;
  }

  req.session.twitterId = loginData.id;

  const parsedCallbackUrl = url.parse(callbackUrl, true, true);
  const parsedFinalUrl = url.parse(data['final-url'], true, true);
  
  // prevent redirects to other origins
  if (parsedFinalUrl.host && parsedCallbackUrl.host != parsedFinalUrl.host) {
    res.status(500).send("Bad redirect");
    return;
  }

  res.redirect(data['final-url']);
}
