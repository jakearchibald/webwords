/* eslint-env mocha */
import 'source-map-support/register';
import should from 'should';
import Board from '../shared/game/board';
import Move from '../shared/game/move';
import Tile from '../shared/game/tile';
import {scores as tileScores} from '../shared/game/tile';
import Word from '../shared/game/word';
import Placement from '../shared/game/placement';

function createBoard(ascii) {
  const board = new Board();
  const lines = ascii.split('\n')
    .map(l => l.trim()).filter(l => l)
    // remove x axis
    .slice(1)
    // remove y axis
    .map(l => l.slice(1));

  for (const [y, line] of lines.entries()) {
    for (const [x, char] of [...line].entries()) {
      if (char.trim()) board.placeTile(new Tile(char), x, y);
    }
  }

  return board;
}

function createDemoBoard() {
  return createBoard(`
    .012345678901234
    0               
    1               
    2               
    3               
    4               
    5               
    6               
    7    hello           
    8       o       
    9       v       
    0       e       
    1       sale       
    2               
    3               
    4               
  `);
}

describe('Tile', function() {
  it('exists', function() {
    Tile.should.be.a.Function();
  });

  it('works', function() {
    const tile = new Tile('a');
    tile.letter.should.equal('a');
    tile.isJoker.should.be.false();
    
    const jokerTile = new Tile('q', true);
    jokerTile.letter.should.equal('q');
    jokerTile.isJoker.should.be.true();
  });

  it('has the correct score', function() {
    let tile = new Tile('a');
    tile.score.should.equal(1);

    tile = new Tile('q');
    tile.score.should.equal(10);

    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      let tile = new Tile(letter);
      tile.score.should.be.above(0);
    }
  });

  it('jokers have no score', function() {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      let tile = new Tile(letter, true);
      tile.score.should.be.equal(0);
    }
  });

  it(`jokers don't require a letter`, function() {
    let tile = new Tile('', true);
    tile.score.should.be.equal(0);
    tile.letter.should.be.equal('');
  });
});

describe('Move', function() {
  it('exists', function() {
    Move.should.be.a.Function();
  });

  it('can be constructed', function() {
    const move = new Move();
    move.should.be.an.instanceOf(Move);
  });

  describe('#add', function() {
    it('exists', function() {
      const move = new Move();
      move.add.should.be.a.Function();
    });

    it('works', function() {
      const move = new Move();
      move.placements.should.be.empty();

      move.add(new Tile('a'), 1, 1);
      move.add(new Tile('b', true), 2, 3);
      move.placements[0].tile.letter.should.be.equal('a');
      move.placements[1].tile.letter.should.be.equal('b');
      move.placements[0].tile.isJoker.should.be.false();
      move.placements[1].tile.isJoker.should.be.true();
      move.placements[0].x.should.be.equal(1);
      move.placements[1].x.should.be.equal(2);
      move.placements[0].y.should.be.equal(1);
      move.placements[1].y.should.be.equal(3);
    });
  });
});

describe('Board', function() {
  it('exists', function() {
    Board.should.be.a.Function();
  });

  it('can be constructed', function() {
    const board = new Board();
    board.should.be.an.instanceOf(Board);
  });

  it('can be constructed via helper', function() {
    const board = createBoard(`
      .012345678901234
      0               
      1               
      2               
      3               
      4               
      5               
      6               
      7               
      8               
      9               
      0               
      1               
      2               
      3               
      4               
    `);

    board.should.be.an.instanceOf(Board);
  });

  describe('#getTile', function() {
    it('exists', function() {
      const board = new Board();
      board.getTile.should.be.a.Function();
    });
    
    it('works', function() {
      const board = createDemoBoard();

      should(board.getTile(3, 7)).be.undefined();
      board.getTile(4, 7).letter.should.equal('h');
      board.getTile(5, 7).letter.should.equal('e');
      board.getTile(6, 7).letter.should.equal('l');
      board.getTile(7, 7).letter.should.equal('l');
      board.getTile(8, 7).letter.should.equal('o');
      board.getTile(7, 8).letter.should.equal('o');
      board.getTile(7, 9).letter.should.equal('v');
      board.getTile(7,10).letter.should.equal('e');
      board.getTile(7,11).letter.should.equal('s');
      should(board.getTile(7,12)).be.undefined();
    });

    it('Returns undefined if out of bounds', function() {
      const board = createBoard(`
        .012345678901234
        0aaaaaaaaaaaaaaa
        1aaaaaaaaaaaaaaa
        2aaaaaaaaaaaaaaa
        3aaaaaaaaaaaaaaa
        4aaaaaaaaaaaaaaa
        5aaaaaaaaaaaaaaa
        6aaaaaaaaaaaaaaa
        7aaaaaaaaaaaaaaa
        8aaaaaaaaaaaaaaa
        9aaaaaaaaaaaaaaa
        0aaaaaaaaaaaaaaa
        1aaaaaaaaaaaaaaa
        2aaaaaaaaaaaaaaa
        3aaaaaaaaaaaaaaa
        4aaaaaaaaaaaaaaa
      `);

      should(board.getTile(-1, 0)).be.undefined();
      should(board.getTile(0, -1)).be.undefined();
      should(board.getTile(-1, -1)).be.undefined();
      should(board.getTile(-100, -100)).be.undefined();
      should(board.getTile(15, 0)).be.undefined();
      should(board.getTile(0, 15)).be.undefined();
      should(board.getTile(15, 15)).be.undefined();
      should(board.getTile(100, 100)).be.undefined();
    });
  });

  describe('#validatePlacement', function() {
    it('exists', function() {
      const board = new Board();
      board.validatePlacement.should.be.a.Function();
    });

    it('rejects empty moves', function() {
      const emptyBoard = new Board();
      const board = createDemoBoard();
      const emptyMove = new Move();
      emptyBoard.validatePlacement(emptyMove).should.be.false();
      board.validatePlacement(emptyMove).should.be.false();
    });

    it('rejects non-linear placements', function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 9, 7);
      move.add(new Tile('a'), 10, 7);
      move.add(new Tile('a'), 8, 8);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 6, 6);
      move.add(new Tile('a'), 7, 5);
      board.validatePlacement(move).should.be.false();
    });

    it(`rejects first moves that don't go through the centre`, function() {
      const emptyBoard = new Board();
      let move = new Move();
      move.add(new Tile('a'), 1, 1);
      move.add(new Tile('a'), 1, 2);
      move.add(new Tile('a'), 1, 3);
      emptyBoard.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 5, 7);
      move.add(new Tile('a'), 6, 7);
      move.add(new Tile('a'), 4, 7);
      emptyBoard.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 8, 8);
      move.add(new Tile('a'), 8, 9);
      move.add(new Tile('a'), 8, 10);
      emptyBoard.validatePlacement(move).should.be.false();
    });

    it(`rejects moves that aren't ajacent to an existing tile`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 0, 0);
      move.add(new Tile('a'), 1, 0);
      move.add(new Tile('a'), 2, 0);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 10, 7);
      move.add(new Tile('a'), 11, 7);
      move.add(new Tile('a'), 12, 7);
      board.validatePlacement(move).should.be.false();
    });

    it(`rejects moves that cover an existing tile`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 4, 7);
      move.add(new Tile('a'), 4, 8);
      board.validatePlacement(move).should.be.false();
    });

    it(`rejects moves that place multiple tiles on the same square`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 4, 4);
      move.add(new Tile('a'), 4, 5);
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 4, 5);
      board.validatePlacement(move).should.be.false();
    });

    it(`rejects moves that don't form a contiguous line`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 4, 4);
      move.add(new Tile('a'), 4, 5);
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 4, 9);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 11, 11);
      move.add(new Tile('a'), 11, 13);
      move.add(new Tile('a'), 11, 14);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 2, 2);
      move.add(new Tile('a'), 3, 2);
      move.add(new Tile('a'), 4, 2);
      move.add(new Tile('a'), 6, 2);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 2, 2);
      move.add(new Tile('a'), 4, 2);
      move.add(new Tile('a'), 6, 2);
      move.add(new Tile('a'), 8, 2);
      board.validatePlacement(move).should.be.false();
    });

    it(`rejects out of bound moves`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), -1, 7);
      move.add(new Tile('a'), 0, 7);
      move.add(new Tile('a'), 1, 7);
      move.add(new Tile('a'), 2, 7);
      move.add(new Tile('a'), 3, 7);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 9, 7);
      move.add(new Tile('a'), 10, 7);
      move.add(new Tile('a'), 11, 7);
      move.add(new Tile('a'), 12, 7);
      move.add(new Tile('a'), 13, 7);
      move.add(new Tile('a'), 14, 7);
      move.add(new Tile('a'), 15, 7);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 10, 12);
      move.add(new Tile('a'), 10, 13);
      move.add(new Tile('a'), 10, 14);
      move.add(new Tile('a'), 10, 15);
      board.validatePlacement(move).should.be.false();

      move = new Move();
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 4, 5);
      move.add(new Tile('a'), 4, 4);
      move.add(new Tile('a'), 4, 3);
      move.add(new Tile('a'), 4, 2);
      move.add(new Tile('a'), 4, 1);
      move.add(new Tile('a'), 4, 0);
      move.add(new Tile('a'), 4, -1);
      board.validatePlacement(move).should.be.false();
    });

    it(`allows first moves that go through the centre`, function() {
      const board = new Board();
      let move = new Move();
      move.add(new Tile('a'), 6, 7);
      move.add(new Tile('a'), 7, 7);
      move.add(new Tile('a'), 8, 7);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles above once`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 10, 13);
      move.add(new Tile('a'), 10, 12);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles above many`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 6, 12);
      move.add(new Tile('a'), 7, 12);
      move.add(new Tile('a'), 8, 12);
      move.add(new Tile('a'), 9, 12);
      move.add(new Tile('a'), 10, 12);
      move.add(new Tile('a'), 11, 12);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles below once`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 4, 5);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles below many`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 3, 6);
      move.add(new Tile('a'), 4, 6);
      move.add(new Tile('a'), 5, 6);
      move.add(new Tile('a'), 6, 6);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles to the left once`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 11, 10);
      move.add(new Tile('a'), 11, 11);
      move.add(new Tile('a'), 11, 12);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles to the left many`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 8, 8);
      move.add(new Tile('a'), 8, 9);
      move.add(new Tile('a'), 8, 10);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles to the right once`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 4, 9);
      move.add(new Tile('a'), 5, 9);
      move.add(new Tile('a'), 6, 9);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles to the right many`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 6, 9);
      move.add(new Tile('a'), 6, 10);
      move.add(new Tile('a'), 6, 11);
      move.add(new Tile('a'), 6, 12);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves that touch tiles on multiple axis`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 8, 8);
      board.validatePlacement(move).should.be.true();
    });

    it(`allows moves either side of an existing tile`, function() {
      const board = createDemoBoard();
      let move = new Move();
      move.add(new Tile('a'), 6, 9);
      move.add(new Tile('a'), 8, 9);
      board.validatePlacement(move).should.be.true();
    });
  });

  describe('#getWordsForMove', function() {
    const board = createDemoBoard();
    let move = new Move();
    move.add(new Tile('z'), 6, 6);
    move.add(new Tile('a'), 6, 8);
    move.add(new Tile('b'), 6, 9);
    move.add(new Tile('c'), 6, 10);
    move.add(new Tile('d'), 6, 11);
    move.add(new Tile('e'), 6, 12);
    move.add(new Tile('f'), 6, 13);

    it('exists', function() {
      board.getWordsForMove.should.be.a.Function();
    });

    it('returns arrays of Words', function() {
      const words = board.getWordsForMove(move);
      words.should.be.an.Array();
      for (const word of words) {
        word.should.be.an.instanceOf(Word);

        for (const placement of word.placements) {
          placement.should.be.an.instanceOf(Placement);
        }
      }
    });

    it('finds the correct words', function() {
      const expectedWords = ['zlabcdef', 'ao', 'bv', 'ce', 'dsale'].sort();
      const foundWords = board.getWordsForMove(move)
        .map(word => word.toString())
        .sort();
      
      foundWords.should.be.eql(expectedWords);
    });
  });

  describe('#getActionTiles', function() {
    it('works', function() {
      const board = new Board();
      const actionTiles = board.getActionTiles();

      actionTiles.length.should.be.above(0);
      
      for (const actionTile of actionTiles) {
        actionTile.x.should.be.a.Number();
        actionTile.y.should.be.a.Number();
        actionTile.type.should.be.a.String();
      }
    });
  });

  describe('#getActionTile', function() {
    it('reflects #getActionTiles()', function() {
      const board = new Board();
      const actionTiles = board.getActionTiles();
      
      for (const actionTile of actionTiles) {
        board.getActionTile(actionTile.x, actionTile.y).should.be.equal(actionTile.type);
      }

      should(board.getActionTile(1, 0)).be.undefined();
    });
  });

  describe('#getScoreForWords', function() {
    const board = createDemoBoard();

    it('gets scores from multiple words & existing letters', function() {
      const move = new Move();
      move.add(new Tile('z'), 6, 6);
      move.add(new Tile('a'), 6, 8);
      move.add(new Tile('b'), 6, 9);
      move.add(new Tile('c'), 6, 10);
      move.add(new Tile('d'), 6, 11);
      move.add(new Tile('e'), 6, 12);
      move.add(new Tile('f'), 6, 13);
      const words = board.getWordsForMove(move);

      // ['zlabcdef', 'ao', 'bv', 'ce', 'dsale']
      const expectedScore = 0
        + tileScores['z'] * 2
        + tileScores['l']
        + tileScores['a'] * 2
        + tileScores['b']
        + tileScores['c']
        + tileScores['d']
        + tileScores['e'] * 2
        + tileScores['f']
        // next word
        + tileScores['a'] * 2
        + tileScores['o']
        // next word
        + tileScores['b']
        + tileScores['v']
        // next word
        + tileScores['c']
        + tileScores['e']
        // next word
        + tileScores['d']
        + tileScores['s']
        + tileScores['a']
        + tileScores['l']
        + tileScores['e']
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`applies triple letters`, function() {
      const move = new Move();
      move.add(new Tile('a'), 5, 8);
      move.add(new Tile('b'), 5, 9);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + tileScores['e']
        + tileScores['a']
        + tileScores['b'] * 3
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`applies double words`, function() {
      const move = new Move();
      move.add(new Tile('s'), 11, 11);
      move.add(new Tile('a'), 11, 12);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['s']
          + tileScores['a']
          + tileScores['l']
          + tileScores['e']
          + tileScores['s']
        ) * 2 // dw
        +
        (0
          + tileScores['s']
          + tileScores['a']
        ) * 2 // dw
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`only applies double words to correct words`, function() {
      const move = new Move();
      move.add(new Tile('s'), 9, 10);
      move.add(new Tile('a'), 10, 10);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['s']
          + tileScores['l']
        )
        +
        (0
          + tileScores['s']
          + tileScores['a']
        ) * 2 // dw
        +
        (0
          + tileScores['a']
          + tileScores['e']
        ) * 2 // dw
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`applies triple words`, function() {
      const move = new Move();
      move.add(new Tile('o'), 7, 12);
      move.add(new Tile('u'), 7, 13);
      move.add(new Tile('l'), 7, 14);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['l']
          + tileScores['o']
          + tileScores['v']
          + tileScores['e']
          + tileScores['s']
          + tileScores['o']
          + tileScores['u']
          + tileScores['l']
        ) * 3 // tw
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });
    it(`triple words multiply correctly`, function() {
      const board = createBoard(`
        .012345678901234
        0               
        1               
        2               
        3               
        4               
        5               
        6               
        7    hello           
        8       o       
        9       v       
        0       e       
        1       sale       
        2       o       
        3       u       
        4               
      `);

      const move = new Move();
      move.add(new Tile('t'), 0, 14);
      move.add(new Tile('e'), 1, 14);
      move.add(new Tile('r'), 2, 14);
      move.add(new Tile('a'), 3, 14);
      move.add(new Tile('g'), 4, 14);
      move.add(new Tile('o'), 5, 14);
      move.add(new Tile('u'), 6, 14);
      move.add(new Tile('l'), 7, 14);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['l']
          + tileScores['o']
          + tileScores['v']
          + tileScores['e']
          + tileScores['s']
          + tileScores['o']
          + tileScores['u']
          + tileScores['l']
        ) * 3 // tw
        + (0
          + tileScores['t']
          + tileScores['e']
          + tileScores['r']
          + tileScores['a'] * 2
          + tileScores['g']
          + tileScores['o']
          + tileScores['u']
          + tileScores['l']
        ) * 3 * 3 // tw*2
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`double words multiply correctly`, function() {
      const move = new Move();
      move.add(new Tile('o'), 4, 4);
      move.add(new Tile('o'), 4, 5);
      move.add(new Tile('o'), 4, 6);
      move.add(new Tile('o'), 4, 8);
      move.add(new Tile('o'), 4, 9);
      move.add(new Tile('o'), 4, 10);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['o']
          + tileScores['o']
          + tileScores['o']
          + tileScores['h']
          + tileScores['o']
          + tileScores['o']
          + tileScores['o']
        ) * 2 * 2 // dw * 2
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`doesn't use action tiles for tiles already on the board`, function() {
      const move = new Move();
      move.add(new Tile('s'), 11, 11);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['s']
          + tileScores['a']
          + tileScores['l']
          + tileScores['e']
          + tileScores['s']
        ) * 2 // dw
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`doesn't assign a score to new joker tiles`, function() {
      const move = new Move();
      move.add(new Tile('q', true), 9, 7);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['h']
          + tileScores['e']
          + tileScores['l']
          + tileScores['l']
          + tileScores['o']
          + 0
        )
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });

    it(`doesn't assign a score to existing joker tiles`, function() {
      const board = createDemoBoard();
      board.placeTile(new Tile('q', true), 9, 7);
      const move = new Move();
      move.add(new Tile('s'), 10, 7);
      const words = board.getWordsForMove(move);

      const expectedScore = 0
        + (0
          + tileScores['h']
          + tileScores['e']
          + tileScores['l']
          + tileScores['l']
          + tileScores['o']
          + 0
          + tileScores['s']
        )
      ;

      board.getScoreForWords(words).should.equal(expectedScore);
    });
  });
});