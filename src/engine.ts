import { Card } from "./models/card";
import { Suit, Board, type move } from "./models/models";
import { Market, MarketPillar } from "./models/Market";
import { Foundation, SuitStack } from "./models/foundations";


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
	var foundation = new Foundation(4);
	market.draw();
	return {
		board,
		market,
		foundation,
	}
}

/// returns number of cards moved
export function makeMove(move: move) : number
{
	var destCards = move.destination.cards;
	var destCard: Card | null = null;
	var srcCard = move.source.cards[move.index];
	if(destCards.length) {
		destCard = destCards[destCards.length -1];
	}

	if(move.destination instanceof SuitStack) {
		if(((move.source.cards.length - 1) !== move.index) // must be last card from source and only one card
			|| (destCard && (destCard.suit !== srcCard.suit  // suits must match
				|| srcCard.value - destCard.value !== 1 // srccard value greater by one
			)
			) || !destCard && srcCard.value !== 1) { //start with an ace
			console.log('invalid suitstack move');	
			return 0;
		}
	}
	else if(!(move.source instanceof MarketPillar && move.destination instanceof MarketPillar) 
		&& !validateMove(srcCard,destCard))
	{
		return 0;
	}
	var srcCards = move.source.pop(move.index);

	move.destination.push(srcCards!);
	// console.log('here moved');
	return srcCards!.length;
}

function validateMove(srcCard: Card, destCard: Card | null): boolean
{
	
	if(destCard == null && srcCard.value === 13) //kings only start an empty lane
	{
		console.log('valid king rule');
		
		return true;
	}


	if( destCard?.suit.color === srcCard.suit.color // suits must alternate colors
		|| ((destCard?.value ?? 0) - srcCard.value !== 1 )// diff of one
	) 
	{
		console.log('invalid move');
		return false;
	}
	return true;
}

function undoMove(move: move, count: number) : void
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
