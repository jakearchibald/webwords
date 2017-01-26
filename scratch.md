# Opening screen

At some point we'll need an indeterminate state for login & games list while JS boots up (from the SW).

* Login status
* Title
* If not logged in:
  * Log in with Twitter
* If logged in:
  * New game
* New local game
* Active games

## Server load

* Server render everything but games list
* Client adds games from idb & root object

## Service worker load

* SW render everything but games list
* Client render from IDB
* Update IDB from network, update page

We're going to need a spinner or something

# Game

* Back
* Players and score
* Who's go is it & letters remaining
* The board
* Letters
* Play & shuffle

## Loading

Local games should have local at start

* Server render (empty board if local, full board otherwise)
  * Service worker may render empty board, or prerendered board (versioned)
* If not local & logged out, render invite screen
* Look for state on window, if it's there, assume fresh
* If no state, try and get from database, assume stale
* If no data, or stale, get from network


# Game urls

/name-vs-name/
  Could get ambiguous if twitter usernames contain vs
/name/vs/name/
  How to tell the difference between old games and the latest?
  What if names are the other way around? Could sort alphabetically
/games/{id}
  Not a great looking URL
