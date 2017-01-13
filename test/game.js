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
import {Game as GameModel} from '../game/models';
import Game from '../shared/game';

function twoPlayerGame() {
  const storage = new GameModel({
    players: [{user: 123}, {user: 456}]
  });

  const game = new Game(storage);
  game.init();

  return game;
}

describe('Game', function() {
  describe('#init', function() {
    it(`creates a game with two players`, function() {
      const game = twoPlayerGame();
      game.players.length.should.be.equal(2);
    });

    it(`gives players letters from bag`, function() {
      const game = twoPlayerGame();
      const numberOfTiles = 100;

      game.letterBag.length.should.equal(numberOfTiles - 7 * 2);

      for (const player of game.players) {
        player.letters.length.should.equal(7);
      }
    });
  });

  describe('#currentPlayer', function() {
    it(`returns player one if no moves have been played`, function() {
      const game = twoPlayerGame();
      game.players[0].score = 1;
      game.players[1].score = 2;
      game.currentPlayer.score.should.equal(1);
    });

    it(`returns player one if it's their turn`, function() {
      const game = twoPlayerGame();
      game.players[0].score = 1;
      game.players[1].score = 2;
      game.moves = [
        {bagWasEmpty: false},
        {bagWasEmpty: false},
        {bagWasEmpty: false},
        {bagWasEmpty: false}
      ];

      game.currentPlayer.score.should.equal(1);
    });

    it(`returns player two if it's their turn`, function() {
      const game = twoPlayerGame();
      game.players[0].score = 1;
      game.players[1].score = 2;
      game.moves = [
        {bagWasEmpty: false},
        {bagWasEmpty: false},
        {bagWasEmpty: false}
      ];
      game.currentPlayer.score.should.equal(2);
    });
  });

  describe('#playMove', function() {
    it(`throws if no move provided`, function() {
      
    });

    it(`throws if tile placement is invalid`);

    it(`throws if words aren't in the dictionary`);

    it(`throws if player doesn't have correct letters`);

    it(`throws if player doesn't have enough of a particular letter`);

    it(`throws if game has already ended`);

    it(`adds move to move list`);

    it(`updates required player's score`);

    // TODO: look up correct rule
    it(`awards player a bonus if they play x tiles`);

    it(`removes letters from player's set after move`);

    it(`replenishes player's tiles from the letter bag after move`);

    it(`copes if there are fewer tiles in bag than user needs`);

    it(`copes if there are no tiles in the tile bag`);

    it(`replenishes player's tiles after move`);

    it(`does not end game if game is ongoing`);

    it(`ends if player is out of letters and letter bag is empty`);

    it(`awards winner double the tile value other players have left`);

  });

  describe('#playSwap', function() {
  });

  describe('#skipTurn', function() {
    // TODO: change this for the correct rule
    // TODO: check it doesn't adjust scores due to player's tiles
    it(`ends if all players skip and letter bag is empty`);
  });

  describe('#resignPlayer', function() {
    // TODO: does not change player's scores
    it('sets resigned');
    it('sets over');
  });
});

