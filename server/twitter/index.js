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
import qs from 'querystring';
import url from 'url';

import request from 'request';

import {twitterConsumerKey, twitterConsumerSecret, callbackUrl} from '../settings';

function promiseResponse(method, url, oauth, opts = {}) {
  return new Promise((resolve, reject) => {
    const params = Object.assign({method, url, oauth}, opts);

    request(params, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      if (response.statusCode != 200) {
        reject(Error(response.statusCode));
        return;
      }

      resolve(body);
    });
  });
}

export async function getLoginUrl({
  finalUrl = '/'
}={}) {
  const parsedCallbackUrl = url.parse(callbackUrl, true, true);
  parsedCallbackUrl.query['final-url'] = finalUrl;

  const body = await promiseResponse('POST', 'https://api.twitter.com/oauth/request_token', {
    callback: url.format(parsedCallbackUrl),
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret
  });

  const data = qs.parse(body);
  const query = qs.stringify({oauth_token: data.oauth_token});
  return `https://api.twitter.com/oauth/authenticate?${query}`;
}

export async function getLoginData(token, verifier) {
  const body = await promiseResponse('POST', 'https://api.twitter.com/oauth/access_token', {
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    token,
    verifier
  });

  const loginData = qs.parse(body);

  const userBody = await promiseResponse('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json', {
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    token: loginData.oauth_token,
    token_secret: loginData.oauth_token_secret
  }, {
    qs: {
      include_entities: false,
      skip_status: true
    }
  });

  const userData = JSON.parse(userBody);

  return Object.assign(userData, loginData);
}