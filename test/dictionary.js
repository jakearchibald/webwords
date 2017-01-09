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
/* eslint-env mocha */
import 'source-map-support/register';
import should from 'should';
import Dictionary from '../shared/dictionary';
import index from '../shared/dictionary/sowpods';

describe('Dictionary', function() {
  const dictionary = new Dictionary(index);

  describe('#includes', function() {
    it(`returns false for 0/1 letter words`, function() {
      dictionary.includes('').should.be.false();
      dictionary.includes('a').should.be.false();
    });

    it(`returns true for valid two letter words`, function() {
      dictionary.includes('it').should.be.true();
      dictionary.includes('qi').should.be.true();
    });

    it(`returns true for valid words`, function() {
      dictionary.includes('house').should.be.true();
      dictionary.includes('finder').should.be.true();
      dictionary.includes('general').should.be.true();
      dictionary.includes('party').should.be.true();
    });

    it(`returns false for invalid words`, function() {
      dictionary.includes('pumperflink').should.be.false();
      dictionary.includes('kerangaspliff').should.be.false();
      dictionary.includes('jumpintung').should.be.false();
    });
  });

});

