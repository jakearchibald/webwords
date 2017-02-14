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
import {
  InvalidPlacementError, TileNotOwnedError,
  NotInDictionaryError, GameOverError
} from '../shared/game';
import Move from '../shared/game/move';
import Tile from '../shared/game/tile';
import {scores as letterScores} from '../shared/game/tile';
import Board from '../shared/game/board';
import {includesMulti as dictionaryLookup} from '../game/models/dictionary';

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

  describe('#currentPlayer & #currentPlayerIndex', function() {
    it(`returns player one if no moves have been played`, function() {
      const game = twoPlayerGame();
      game.players[0].score = 1;
      game.players[1].score = 2;
      game.currentPlayerIndex.should.equal(0);
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
      game.currentPlayerIndex.should.equal(0);
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
      game.currentPlayerIndex.should.equal(1);
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
      await game.playMove(undefined, dictionaryLookup).should.be.rejectedWith(TypeError);
    });

    it(`throws if tile placement is invalid`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'yes';

      const emptyMove = new Move();

      await game.playMove(emptyMove, dictionaryLookup).should.be.rejectedWith(InvalidPlacementError);

      const move = new Move();
      move.add(new Tile('y'), 8, 5);
      move.add(new Tile('e'), 9, 5);
      move.add(new Tile('s'), 10, 5);

      await game.playMove(move, dictionaryLookup).should.be.rejectedWith(InvalidPlacementError);
    });

    it(`throws if player doesn't have correct letters`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'elc ';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10); // not in player's letters

      await game.playMove(move, dictionaryLookup).should.be.rejectedWith(TileNotOwnedError);
    });

    it(`throws if player doesn't have enough of a particular letter`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'elo ';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('l'), 4, 10); // player only has one l
      move.add(new Tile('o'), 4, 11); 

      await game.playMove(move, dictionaryLookup).should.be.rejectedWith(TileNotOwnedError);
    });

    it(`throws if words aren't in the dictionary`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'elc ';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('c'), 4, 10); // not in player's letters

      const result = game.playMove(move, dictionaryLookup);

      await result.should.be.rejectedWith(NotInDictionaryError);
      await result.catch(err => err.invalidWords)
        .should.eventually.eql(['helc']);
    });

    it(`throws if game has already ended`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.over = true;
      game.players[1].letters = 'elp ';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup).should.be.rejectedWith(GameOverError);
    });

    it(`adds move to move list`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'elp ';

      const prevLength = game.moves.length;

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.moves.length.should.equal(prevLength + 1);

      const lastMove = game.moves.slice(-1)[0].toJSON();

      // Filter out Mongoose stuff
      for (const placement of lastMove.placements) {
        delete placement._id;
      }
      
      lastMove.placements.should.eql([
        {x: 4, y: 8, letter: 'e', isJoker: false},
        {x: 4, y: 9, letter: 'l', isJoker: false},
        {x: 4, y: 10, letter: 'p', isJoker: false}
      ]);
    });

    it(`updates required player's score`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[0].score = 10;
      game.players[1].score = 20;
      game.players[1].letters = 'elp ';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.players[0].score.should.equal(10);
      game.players[1].score.should.equal(
        20 + (
          letterScores['h'] +
          letterScores['e'] +
          letterScores['l'] +
          letterScores['p']
        ) * 2 // double word
      );
    });

    it(`awards player a 50 point bonus if they play 7 tiles`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].score = 20;
      game.players[1].letters = ' habitats';

      const move = new Move();
      move.add(new Tile('a'), 4, 8);
      move.add(new Tile('b'), 4, 9);
      move.add(new Tile('i'), 4, 10);
      move.add(new Tile('t'), 4, 11);
      move.add(new Tile('a'), 4, 12);
      move.add(new Tile('t'), 4, 13);
      move.add(new Tile('s'), 4, 14);

      await game.playMove(move, dictionaryLookup);

      game.players[1].score.should.equal(
        20 + (
          letterScores['h'] +
          letterScores['a'] +
          letterScores['b'] +
          letterScores['i'] +
          letterScores['t'] +
          letterScores['a'] +
          letterScores['t'] + 
          letterScores['s']
        ) * 2 // double word
        + 50 // Bonus
      );
    });

    it(`removes letters from player's set after move`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[0].letters = 'elpp ';
      game.players[1].letters = 'elpp ';

      game.letterBag = 'qudrn';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.players[0].letters.should.equal('elpp ');
      [...game.players[1].letters].sort().should.eql(
        [...'p qudrn'].sort()
      );
      game.letterBag.should.equal('');
    });

    it(`removes multiple of same letter from player's set after move`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'hello ';

      game.letterBag = 'qudrn';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('l'), 4, 10);
      move.add(new Tile('o'), 4, 11);

      await game.playMove(move, dictionaryLookup);

      [...game.players[1].letters].sort().should.eql(
        [...'h qudrn'].sort()
      );
    });

    it(`copes if there are fewer tiles in bag than user needs`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'ello ';

      game.letterBag = 'q';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('l'), 4, 10);
      move.add(new Tile('o'), 4, 11);

      await game.playMove(move, dictionaryLookup);

      game.moves.slice(-1)[0].bagWasEmpty.should.be.false();

      [...game.players[1].letters].sort().should.eql(
        [...' q'].sort()
      );
    });

    it(`copes if there are no tiles in the tile bag`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'ello ';

      game.letterBag = '';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('l'), 4, 10);
      move.add(new Tile('o'), 4, 11);

      await game.playMove(move, dictionaryLookup);

      game.moves.slice(-1)[0].bagWasEmpty.should.be.true();

      [...game.players[1].letters].sort().should.eql(
        [...' '].sort()
      );
    });

    it(`allows moves with a joker tile`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].score = 20;
      game.players[1].letters = 'elp ';

      game.letterBag = 'qudrnm';

      const move = new Move();
      move.add(new Tile('e', true), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.players[1].score.should.equal(
        20 + (
          letterScores['h'] +
          // no score for e, as it's a joker
          letterScores['l'] +
          letterScores['p']
        ) * 2 // double word
      );

      [...game.players[1].letters].sort().should.eql(
        [...'equdrnm'].sort()
      );
    });

    it(`does not end game if game is ongoing`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].score = 20;
      game.players[1].letters = 'elp ';

      const move = new Move();
      move.add(new Tile('e', true), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.over.should.be.false();
    });

    it(`ends if player is out of letters and letter bag is empty`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].score = 20;
      game.players[1].letters = 'elp';

      game.letterBag = '';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.over.should.be.true();
    });

    it(`awards winner double the tile value other players have left`, async function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[0].score = 10;
      game.players[0].letters = 'q';
      game.players[1].score = 20;
      game.players[1].letters = 'elp';

      game.letterBag = '';

      const move = new Move();
      move.add(new Tile('e'), 4, 8);
      move.add(new Tile('l'), 4, 9);
      move.add(new Tile('p'), 4, 10);

      await game.playMove(move, dictionaryLookup);

      game.over.should.be.true();
      game.players[0].score.should.equal(10);
      game.players[1].score.should.equal(
        20 + (
          letterScores['h'] +
          letterScores['e'] +
          letterScores['l'] +
          letterScores['p']
        ) * 2 // double word
        + letterScores['q'] * 2 // remaining tile from other player
      );
    });
  });

  describe('#playSwap', function() {
    it(`only swaps tiles selected`, function() {
      const game = twoPlayerGame();
      const p1Score = game.players[0].score;
      const p2Score = game.players[1].score;
      game.moves = demoMoves;
      game.players[1].letters = 'asdf ';

      game.letterBag = 'qudrn';

      game.playSwap('df');

      [...game.players[1].letters].should.containDeep([...'as']);
      game.players[0].score.should.equal(p1Score);
      game.players[1].score.should.equal(p2Score);
    });

    it(`can give players the same tiles back`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.players[1].letters = 'pqz';

      game.letterBag = 'a';

      game.playSwap('qz');

      const includesQ = game.players[1].letters.includes('q');
      const includesZ = game.players[1].letters.includes('z');

      (includesQ || includesZ).should.be.true();
    });

    it(`adds to move list`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      const prevLength = game.moves.length;
      game.playSwap(game.players[1].letters);

      game.moves.length.should.equal(prevLength + 1);

      const lastMove = game.moves.slice(-1)[0].toJSON();
      lastMove.placements.should.eql([]);
    });
  });

  describe('#skipTurn', function() {
    it(`adds to move list & scores stay the same`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      const prevLength = game.moves.length;
      game.skipTurn();

      game.moves.length.should.equal(prevLength + 1);

      const lastMove = game.moves.slice(-1)[0].toJSON();
      lastMove.placements.should.eql([]);
    });
  });

  describe('#resignPlayer', function() {
    it('sets resigned & over - does not change scores', function() {
      const game = twoPlayerGame();
      const p1Score = game.players[0].score;
      const p2Score = game.players[1].score;
      game.moves = demoMoves;

      game.resignPlayer(game.players[0]);

      game.players[0].score.should.equal(p1Score);
      game.players[1].score.should.equal(p2Score);
      game.players[0].resigned.should.be.true();
      game.players[1].resigned.should.be.false();
      game.over.should.be.true();
    });

    it('can resign either player', function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;

      game.resignPlayer(game.players[1]);

      game.players[0].resigned.should.be.false();
      game.players[1].resigned.should.be.true();
      game.over.should.be.true();
    });
  });

  describe('scoreless ending', function() {
    it(`Only happens if bag is empty`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;

      game.skipTurn();
      game.skipTurn();

      game.over.should.be.false();
    });

    it(`Only happens if each player skips`, function() {
      const game = twoPlayerGame();
      game.moves = demoMoves;
      game.letterBag = '';

      game.skipTurn();

      game.over.should.be.false();
    });

    it(`Happens & score doesn't change`, function() {
      const game = twoPlayerGame();
      const p1Score = game.players[0].score;
      const p2Score = game.players[1].score;
      game.moves = demoMoves;
      game.letterBag = '';

      game.skipTurn();
      game.skipTurn();

      game.players[0].score.should.equal(p1Score);
      game.players[1].score.should.equal(p2Score);
      game.over.should.be.true();
    });
  });
});

