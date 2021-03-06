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

export default class NewGame extends BoundComponent {
  constructor(props) {
    super(props);
  }
  render({loggedIn, server, onNewLocalGame}, {}) {
    return (
      <div>
        {loggedIn ?
          server ?
            <div>Loading</div>
            :
            <div>TODO: new game</div>
          :
          <div><a href="/user/login">Log in</a></div>
        }
        {server ?
          <div>Loading</div>
          :
          <button onClick={onNewLocalGame}>New local game</button>
        }
      </div>
    );
  }
}
