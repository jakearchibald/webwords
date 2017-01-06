/* eslint-env mocha */
import 'source-map-support/register';
import should from 'should';
import Board from '../shared/board';
import Move from '../shared/board/move';
import Tile from '../shared/board/tile';
import Word from '../shared/board/word';
import Placement from '../shared/board/placement';

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

  describe('#getWordsPlayed', function() {
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
      board.getWordsPlayed.should.be.a.Function();
    });

    it('returns arrays of Words', function() {
      const words = board.getWordsPlayed(move);
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
      const foundWords = board.getWordsPlayed(move)
        .map(word => word.toString())
        .sort();
      
      foundWords.should.be.eql(expectedWords);
    });
  });
});