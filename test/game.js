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
import {InvalidPlacementError} from '../shared/game';
import Move from '../shared/game/move';
import Tile from '../shared/game/tile';
import Board from '../shared/game/board';

/**
 * @returns {Game}
 */
function twoPlayerGame() {
  const storage = new GameModel({
    players: [{user: 123}, {user: 456}]
  });

  const game = new Game(storage);
  game.init();

  return game;
}

// These are the same moves as createDemoBoard() in the board tests
const demoMoves = [{
  placements: [{
    x: 4, y: 7, letter: 'h', isJoker: false
  }, {
    x: 5, y: 7, letter: 'e', isJoker: false
  }, {
    x: 6, y: 7, letter: 'l', isJoker: false
  }, {
    x: 7, y: 7, letter: 'l', isJoker: false
  }, {
    x: 8, y: 7, letter: 'o', isJoker: false
  }],
  bagWasEmpty: false,
  date: Date.now()
}, {
  placements: [{
    x: 7, y: 8, letter: 'o', isJoker: false
  }, {
    x: 7, y: 9, letter: 'v', isJoker: false
  }, {
    x: 7, y: 10, letter: 'e', isJoker: false
  }],
  bagWasEmpty: false,
  date: Date.now()
}, {
  placements: [{
    x: 7, y: 11, letter: 's', isJoker: false
  }, {
    x: 8, y: 11, letter: 'a', isJoker: false
  }, {
    x: 9, y: 11, letter: 'l', isJoker: false
  }, {
    x: 10, y: 11, letter: 'e', isJoker: false
  }],
  bagWasEmpty: false,
  date: Date.now()
}];

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

  describe('#createBoard', function() {
    it(`returns a board`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;

      game.createBoard().should.be.an.instanceOf(Board);
    });

    it(`puts tiles in the correct place`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      const board = game.createBoard();

      const tileIndex = {};

      for (const move of demoMoves) {
        for (const placement of move.placements) {
          tileIndex[`${placement.x}:${placement.y}`] = new Tile(placement.letter, placement.isJoker);
        }
      }

      for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
          should(board.getTile(x, y)).eql(tileIndex[`${x}:${y}`]);
        }
      }
    });
  });

  describe('#playMove', function() {
    it(`throws if no move provided`, async function() {
      const game = twoPlayerGame();
      await game.playMove().should.be.rejectedWith(TypeError);
    });

    it(`throws if tile placement is invalid`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;

      const emptyMove = new Move();

      await game.playMove(emptyMove).should.be.rejectedWith(InvalidPlacementError);

      const move = new Move();
      move.add(new Tile('a'), 9, 7);
      move.add(new Tile('a'), 10, 7);
      move.add(new Tile('a'), 8, 8);

      await game.playMove(move).should.be.rejectedWith(InvalidPlacementError);
    });

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

