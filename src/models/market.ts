import { MARKET_FLIP_COUNT, MARKET_OFFSET } from "../constants";
import { makeMove } from "../engine";
import type { Card } from "./card";
import { Pillar } from "./pillar";

export class Market {
	public cards: Card[];
	public div!: HTMLDivElement;
	public left!: MarketPillar;
	public right!: MarketPillar;

	constructor(cards: Card[]) {
		this.cards = cards;
	}


	public shuffle() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	public pop(): Card | undefined {
		return this.cards.pop();
	}

	public draw() {
		this.div = document.createElement("div");
		this.left = new MarketPillar();
		this.right = new MarketPillar();
		this.div.classList.add("market");
		this.left.div.classList.add("left");
		this.right.div.classList.add("right");

		this.div.appendChild(this.left.div);
		this.div.appendChild(this.right.div);
		this.left.push(this.cards);
		popAndPushMarket(this);		
	}
}

export class MarketPillar extends Pillar {
	constructor() {
		super();
		this.div.classList.add();
	}

	public override offsetCards() {

		if(this.div.classList.contains("left")) {
			this.cards.forEach((c,i) => {
							c.div.style.zIndex = (i).toString();
				if(c.isFaceup) c.flip(); //turn facedown
				c.div.style.left = "0";
			});
			return;
		}

		var newIndex = this.cards.length - MARKET_FLIP_COUNT;
		this.cards.slice(- MARKET_FLIP_COUNT)
		.forEach((c, i) => { //refresh entire z index starting from last card added using MAX_FLIP_COUNT
			c.div.style.zIndex = (newIndex+i).toString();
			if(i === 0) {
				c.div.style.left = "0";
			}
			if(i > 0) {
				c.div.style.left = MARKET_OFFSET;
			}
			c.div.style.top = "0";
		});
	}

	public override pop(index: number): Card[] | null {
		var cardPopped: Card | null;
		if (index === 0) {
			cardPopped = this.cards![0];
			this.div.removeChild(cardPopped.div); //TODO change for right pillar only allow top card to be popped
		}
		else {
			var cardBelow = this.cards![index - 1]; //detach from lower card
			cardPopped = cardBelow.popTop();
		}
		var cardsPopped = this.cards?.splice(index) ?? null;
		cardsPopped.forEach((x) =>{
			if(!x.isFaceup) x.flip()
		} );
		if(this.div.classList.contains('left')) {
			//reverse the nesting of cards popped
			//TODO can probably optimize this
			for (let i = cardsPopped.length -1; i > 0; i--) {
				const curr = cardsPopped[i];
				const next = cardsPopped[i-1];

				next.popTop();
				curr.pushTop(next);
			}
		}
		return cardsPopped;
	}

	public override push(cards: Card[]): void {
		if(this.div.classList.contains('right')) {
			cards.reverse(); //TODO fix reversal bug on reset of empty market
			console.log('cards',cards);
			//put each card array in  div so there can be an overlay
			this.div.appendChild(cards[0].div);

			if(this.cards.length){
				this.cards[0].pushTop(cards[0]);
			}
			this.cards.push(...cards);
			this.offsetCards();
			console.log('cards contained',this.cards)
		}
		else {
			super.push(cards);
		}
	}
}

function popAndPushMarket(market: Market) {
	var left = market.left;
	var right = market.right;

	left.div.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		if(!left.cards.length)
		{
			makeMove({
				source:right,
				destination:left,
				index:0
			})
			return;
		}
		//if it's less than move count move the whole thing
		var cardCountToMove = 0;
		if(left.cards.length > MARKET_FLIP_COUNT)
		{
			cardCountToMove = left.cards.length - MARKET_FLIP_COUNT
		}
		makeMove(
			{
				source:left,
				destination:right,
				index: cardCountToMove
			}
		);
	});
}