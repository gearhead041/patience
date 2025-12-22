import { Card } from "./models/card";
import { Suit, Board, type move } from "./models/models";
import { Market, MarketPillar } from "./models/Market";


export function initializeItems() {
	//TODO this is absolutely shitty performance make it faster
	var suits: Suit[] = [
		new Suit("Red", "heart"),
		new Suit("Red", "diamond"),
		new Suit("Black", "clubs"),
		new Suit("Black", "spade"),
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
		pillar.cards![pillar.cards.length-1].flip();
		count++;
	}
	market.draw();
	return {
		board,
		market,
		suits,
	}
}

/// returns number of cards moved
export function makeMove(move: move) : number
{
	var destCards = move.destination.cards;
	var destCard: Card | null = null;

		
		if(destCards.length) {
			destCard = destCards[destCards.length -1];
		}
		
		if(!(move.source instanceof MarketPillar && move.destination instanceof MarketPillar) 
			&& !validateMove(move.source.cards[move.index],destCard))
		{
			// //unflip source card
			// if(move.source.cards.length){
				
			// 	move.source.cards[move.source.cards.length -1].flip();
			// }
			// //undo move	
			// move.source.push(srcCards);
			return 0;
		}
		var srcCards = move.source.pop(move.index);

		move.destination.push(srcCards!);
		console.log('here moved')
		return srcCards!.length;
	
	return 0;
}

function validateMove(srcCard: Card, destCard: Card | null): boolean
{
	if(destCard == null && srcCard.value === 13) //kings only start an empty lane
	{
		return true;
	}
	if( destCard?.suit.color === srcCard.suit.color // suits must alternate colors
		|| ((destCard?.value ?? 0) - srcCard.value !== 1 )// diff of one
	) 
	{
		console.log('invalid move')
		return false;
	}
	return true;
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
