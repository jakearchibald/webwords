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

# Storage

* Remaining letter bag - server only
* Players
  * Score
  * Letters - server only (unless this player)
  * twitter id
* Is game active
* Who resigned (if any)
* Moves played
  * Placements (empty if skipped or swapped)
  * Number of letters in bag remaining (so it can be tracked if there is a skip from each player)

Store "friends" on client, which is anyone the user has started a game with.
