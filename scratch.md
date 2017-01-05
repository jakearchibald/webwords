# Opening screen

At some point we'll need an indeterminate state for login & games list while JS boots up (from the SW).

* Login status
* Title
* Active games
* If not logged in:
  * Log in with Twitter
* If logged in:
  * New game
* New local game

# New local game

Create entry in DB for game
Navigate to game (each game should have its own url, ideally /vs-{name}/, which would be local-1 etc for local games)
Naivgation could just be real? Yeah, real at first.

* Back
* Players and score
* Who's go is it & letters remaining
* The board
* Letters
* Play & shuffle

# New remote game

If a remote game is started, let the player make a move before telling them how to tell the other player.

# The game model

* Remaining letter bag - server only
* Player one letters - server only (unless this player)
* Player two letters - server only (unless this player)
* Player 1 score
* Player 2 score
* Start player
* Board
  * Locations of special squares (including start square)
  * Size of board
  * List of moves played
    * Each move is a list of letter placements
  * Validation methods
* Validate move - awaiting move from player, using letters owned, plus board check


