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
import {includes, includesMulti} from '../game/models/dictionary';

describe('includes', function() {
  it(`returns false for 0/1 letter words`, async function() {
    await includes('').should.eventually.be.false();
    await includes('a').should.eventually.be.false();
  });

  it(`returns true for valid two letter words`, async function() {
    await includes('it').should.eventually.be.true();
    await includes('qi').should.eventually.be.true();
  });

  it(`returns true for valid words`, async function() {
    await includes('house').should.eventually.be.true();
    await includes('finder').should.eventually.be.true();
    await includes('general').should.eventually.be.true();
    await includes('party').should.eventually.be.true();
  });

  it(`returns false for invalid words`, async function() {
    await includes('pumperflink').should.eventually.be.false();
    await includes('kerangaspliff').should.eventually.be.false();
    await includes('jumpintung').should.eventually.be.false();
  });
});

describe('includesMulti', function() {
  it('works', async function() {
    await includesMulti([
      '', 'a',
      'it', 'qi',
      'house', 'finder', 'general', 'party',
      'pumperflink', 'kerangaspliff', 'jumpintung'
    ]).should.eventually.eql([
      false, false, 
      true, true,
      true, true, true, true,
      false, false, false
    ]);
  });
});

