import { Card } from "./Card";
import { Suit, Board, Market, type move } from "./models";


export function initializeItems() {
	var suits: Suit[] = [
		new Suit("Red", "Heart"),
		new Suit("Red", "Diamond"),
		new Suit("Black", "Clubs"),
		new Suit("Black", "Spade"),
	];
	var market = new Market(createCards(suits));
	market.shuffle();
	var board: Board = new Board();
	// create pillars
	var count = 1;
	for (const pillar of board.pillars) {
		for (let i = 0; i < count; i++) {
			var card = [market.pop()!];
			pillar.push(card);
		}
		//flip the end of the pillar card over
		pillar.cards![-1].flip();
		count++;
	}
}

/// returns number of cards moved
export function makeMove(move: move) : number
{
	var cardMoved = move.source.pop(move.index);
	if (cardMoved)
	{
		var destCards = move.destination.cards!;
		// Check if the move is valid (e.g. alternating suits)
		// Also checking if destination has cards to avoid undefined access
		if (destCards.length > 0 && destCards[destCards.length - 1].suit === cardMoved[0].suit)
		{
			// If invalid, return cards to source to prevent data loss
			move.source.push(cardMoved);
			return 0;
		}
		move.destination.push(cardMoved);
		return cardMoved.length;
	}
	return 0;
}

export function undoMove(move: move, count: number) : void
{
	if (count <= 0) return;
	var destLength = move.destination.cards!.length;
	var cardsToReturn = move.destination.pop(destLength - count);
	if (cardsToReturn) {
		move.source.push(cardsToReturn);
	}
}


function createCards(suits: Suit[]): Card[] {
	var result = new Array<Card>();

	for (let i = 0; i < suits.length; i++) {
		for (let j = 0; j < 13; j++) {
			result.push(new Card(j + 1, suits[i]));
		}
	}
	return result;
}
