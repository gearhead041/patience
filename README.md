# Patience

## System Design
### Overview
- Initialize game
  - Shuffle card deck
  - share into 7 column with each size increasing by one
  - leave remaining cards in pool/market
- While moves are still possible
  - Determine available moves using [ruleset](#ruleset)
  - Player moves OR undoes a move
  - Game records moves
  - If [win state](#win-state) reached, end game
  - If [no moves are left](#no-moves-left) end game or player undoes move

### Ruleset
- From initialization
  - Cards can only be moved onto card of a different color
  - Cards can only be moved onto a card on the board with a higher value by one
  - Cards can only be moved onto a card on the suithome with a lower value by one
  - Cards that are face down cannot be moved
  - Cards can only be turned face up
  - Cards can only be moved onto cards that are face up
  - Stacks can only be started by the King card
  - Card is moved with other cards on top of it if any
  - Upturned stacks can be split to be moved

### Win state
- Pool/market is empty 
- All cards are facing up
  
### No moves left
- Handle switching of the same move as a failure


## Subsystems

### Game movement

#### Move
- Contains a source and a valid destination
- Contains the card being moved
  
#### Requirements
- Track all moves in a game (think of chess game on macos)
- Allow for moves to be reversed sequentially (LIFO- See Stack)
- Move must be valid according to ruleset
  
### Game Scoring (TBD)

## Game Items

### Card : Lane
- Number value (1-13)
- [Suit](#suit)
- Isfaceup (boolean)
- [Card](#card--lane) on top if any
  
### Suit
- Color (Red, Black)
- Shape (Club, Diamond, Heart, Spades)
  
### Pool/market : lane
- List of [Cards](#card--lane) face down
- List of [Cards](#card--lane) turned with set number of cards face up

### Board
- Seven [BoardLanes](#board-lane)

### Board Lane : Lane
- contains a list of [cards](#card--lane)
- contains top [card](#card--lane)
  
### Lane
- Contains a stack


### Suit Home
- Four [suitlanes](#suitlanes--lane)
  
#### SuitLanes : Lane
- Contains only faceup [cards](#card--lane)
- Can only contain cards of same [suit](#suit)
- Can only contains card stackes

  
