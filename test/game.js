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
import {Game} from '../game/models';

describe('Game', function() {
  describe('#currentPlayer', function() {
    it(`returns player one if no moves have been played`, function() {
      const game = new Game({
        players: [
          {score: 1},
          {score: 2}
        ]
      });
      game.currentPlayer.score.should.equal(1);
    });

    it(`returns player one if it's their turn`, function() {
      const game = new Game({
        moves: [
          {bagWasEmpty: false},
          {bagWasEmpty: false},
          {bagWasEmpty: false},
          {bagWasEmpty: false}
        ],
        players: [
          {score: 1},
          {score: 2}
        ]
      });
      game.currentPlayer.score.should.equal(1);
    });

    it(`returns player two if it's their turn`, function() {
      const game = new Game({
        moves: [
          {bagWasEmpty: false},
          {bagWasEmpty: false},
          {bagWasEmpty: false}
        ],
        players: [
          {score: 1},
          {score: 2}
        ]
      });
      game.currentPlayer.score.should.equal(2);
    });
  });

  describe('#shouldNaturallyEnd', function() {
    it(`returns false if not`, function() {
      const game = new Game({
        players: [
          {score: 1, letters: 'a'},
          {score: 2, letters: 'b'}
        ]
      });

      game.shouldNaturallyEnd().should.be.false();
      game.moves.push({bagWasEmpty: false});
      game.shouldNaturallyEnd().should.be.false();
    });

    it(`returns true if a player is out of letters and letter bag is empty`, function() {
      const game = new Game({
        players: [
          {score: 1, letters: ''},
          {score: 2, letters: 'b'}
        ],
        letterBag: ''
      });

      game.shouldNaturallyEnd().should.be.true();
      game.moves.push({bagWasEmpty: true});
      game.shouldNaturallyEnd().should.be.true();
    });

    it(`returns true if all players skip and letter bag is empty`, function() {
      const game = new Game({
        players: [
          {score: 1, letters: 'a'},
          {score: 2, letters: 'b'}
        ],
        letterBag: '',
        moves: [
          {bagWasEmpty: false},
          {bagWasEmpty: true},
          {bagWasEmpty: true}
        ]
      });

      game.shouldNaturallyEnd().should.be.true();
    });
  });

  describe('#naturallyEndGame', function() {
    it(`sets 'ongoing' to false`);
    it(`fines players for letters remaining`);
  });

  describe('#removeLettersFromPlayer', function() {
    it(`removes letters`);
    it(`throws if player doesn't have those letters`);
  });

  describe('#pickLettersFromBag', function() {
    it(`picks letters at random from bag`);
  });

  describe('#putLettersInBag', function() {
    it(`works`);
  });

  describe('#giveLettersToUser', function() {
    it(`works`);
  });

  describe('#resignPlayer', function() {
    it('sets resigned');
    it('sets over');
  });
});

