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

export default class Status extends BoundComponent {
  constructor(props) {
    super(props);
  }
  render({user}, {}) {
    return (
      <div>
        {user ?
          <div>
            <img
              src={`${user.avatarUrl}_normal.jpg`}
              alt=""
              srcset={`${user.avatarUrl}_bigger.jpg 1.5x`}
            />
            {user.name}
          </div>
          :
          <div>Not logged in</div>
        }
      </div>
    );
  }
}
