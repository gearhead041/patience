import type { Entity, Move, MoveHistory } from "../components";
import { HISTORY_SIZE, MARKET_FLIP_COUNT } from "../settings";
import type { World } from "../world";
import type { IMovement } from "./interface/imovement";
import { MoveStack } from "./movestack";

export class MovementService implements IMovement {
	private world: World;
	public moves: MoveStack<MoveHistory>; 

	constructor(world: World) {
		this.world = world;
		this.moves = new MoveStack<MoveHistory>(HISTORY_SIZE);
	}

	moveCard(move: Move): boolean {
		if (!this.validateMove(move)) {
			return false;
		}

		//TODO handle default movement by click
		const { pile: srcPile, index: srcIndex } = this.world.inPile.get(
			move.card
		)!;
		const srcPileType = this.world.pileType.get(srcPile)!.kind;
		//from animation have click event listener
		const srcPileCards = this.world.pileCards.get(srcPile)!.cards;
		const destPileCards = this.world.pileCards.get(move.dest)!.cards;

		let cardsMoved: Entity[] = [];
		let revealedCard: Entity | undefined;
		let wasStockFlip = false;
		let wasRecycle = false;

		switch (srcPileType) {
			case "stock":
				wasStockFlip = true;
				const spliceIdx = Math.min(
					srcPileCards.length,
					MARKET_FLIP_COUNT
				);
				const slicedArray = srcPileCards.splice(
					srcPileCards.length - spliceIdx
				);
				cardsMoved = slicedArray; // Capture moved cards
				slicedArray.reverse();
				destPileCards.push(...slicedArray);
				//update cards locations and turn them all face up
				slicedArray.forEach((c, i) => {
					this.world.faceUp.set(c, { value: true });
					this.world.inPile.set(c, {
						pile: move.dest,
						index: destPileCards.length - slicedArray.length + i,
					});
				});
				break;
			case "waste":
				const destPileType = this.world.pileType.get(move.dest)!.kind;

				const wasteSpliceIdx =
					destPileType === "stock" ? 0 : srcPileCards.length - 1;
				const newCards = srcPileCards.splice(wasteSpliceIdx);
				cardsMoved = newCards; // Capture moved cards

				if (destPileType === "stock") {
					newCards.reverse();
					wasRecycle = true;
				}
				destPileCards.push(...newCards);
				newCards.forEach((c, i) => {
					this.world.faceUp.set(c, {
						value: destPileType !== "stock",
					});
					this.world.inPile.set(c, {
						pile: move.dest,
						index: destPileCards.length - newCards.length + i,
					});
				});
				break;
			default:
				const tableauSlice = srcPileCards.splice(srcIndex);
				cardsMoved = tableauSlice; // Capture moved cards

				//flip last card
				const topCardSrc = srcPileCards[srcPileCards.length - 1];

				if (topCardSrc !== undefined) {
					// Only record if we actually flip it from face down
					if (!this.world.faceUp.get(topCardSrc)?.value) {
						this.world.faceUp.set(topCardSrc, { value: true })!;
						revealedCard = topCardSrc;
					}
				}
				destPileCards.push(...tableauSlice);
				//update the card's location in the world
				tableauSlice.forEach((c, i) =>
					this.world.inPile.set(c, {
						pile: move.dest,
						index: destPileCards.length - tableauSlice.length + i,
					})
				);
				break;
		}

		this.moves.push({
			move,
			srcPile,
			cardsMoved,
			revealedCard,
			wasStockFlip,
			wasRecycle,
		});
		console.log('history',this.moves);
		return true;
	}

	validateMove(move: Move) {
		const srcCard = this.world.cards.get(move.card)!;
		const destPileType = this.world.pileType.get(move.dest)!.kind;
		const destPileCards = this.world.pileCards.get(move.dest)!.cards;
		const topCardDestPile = this.world.cards.get(
			destPileCards[destPileCards.length - 1]
		);

		//validate move
		switch (destPileType) {
			case "tableau":
				if (!topCardDestPile) {
					return srcCard.rank === 13;
				}
				return (
					topCardDestPile.rank - srcCard.rank === 1 &&
					topCardDestPile.suit.color !== srcCard.suit.color
				);
			case "foundation":
				if (!topCardDestPile) {
					return srcCard.rank === 1; //start with the ace
				}
				var srcPile  = this.world.inPile.get(move.card)!.pile;
				var srcPileCards = this.world.pileCards.get(srcPile)!.cards;
				return (
					srcPileCards[srcPileCards.length -1] === move.card && //must be top card nothing attached below
					srcCard.rank - topCardDestPile.rank === 1 &&
					srcCard.suit === topCardDestPile.suit
				);
			case "stock": //moving to stock can only come from waste
				if (destPileCards.length > 0) return false;
				const stockSrcPile = this.world.inPile.get(move.card)!.pile;
				const stockSrcPileType =
					this.world.pileType.get(stockSrcPile)!.kind;
				return stockSrcPileType == "waste";
			case "waste": // and vice versa
				const wasteSrcPile = this.world.inPile.get(move.card)!.pile;
				const wasteSrcPileType =
					this.world.pileType.get(wasteSrcPile)!.kind;
				return wasteSrcPileType == "stock";

			default:
				console.log("the hell?!");
				return false;
		}
	}

	undo(): { src: Entity; dest: Entity } | null {
		var history = this.moves.pop();

		if (!history) return null;
		
		const {
			move,
			srcPile,
			cardsMoved,
			revealedCard,
			wasStockFlip,
			wasRecycle,
		} = history;
		const destPile = move.dest;

		const srcPileCards = this.world.pileCards.get(srcPile)!.cards;
		const destPileCards = this.world.pileCards.get(destPile)!.cards;

		// 1. Remove cards from current location (destPile)
		// They are at the end of destPileCards
		const cardsToRestore = destPileCards.splice(
			destPileCards.length - cardsMoved.length,
			cardsMoved.length
		);

		// 2. Handle Reversals and Flips
		if (wasStockFlip) {
			// Stock -> Waste. Cards are now in Waste (Face Up).
			// Move back to Stock (Face Down).
			cardsToRestore.reverse();
			cardsToRestore.forEach((c) =>
				this.world.faceUp.set(c, { value: false })
			);
		} else if (wasRecycle) {
			// Waste -> Stock. Cards are now in Stock (Face Down).
			// Move back to Waste (Face Up).
			cardsToRestore.reverse();
			cardsToRestore.forEach((c) =>
				this.world.faceUp.set(c, { value: true })
			);
		} else if (revealedCard) {
			// Normal move. If a card was revealed in source, hide it again.
			this.world.faceUp.set(revealedCard, { value: false });
		}

		// 3. Put back to source
		srcPileCards.push(...cardsToRestore);

		// 4. Update InPile map
		cardsToRestore.forEach((c, i) => {
			this.world.inPile.set(c, {
				pile: srcPile,
				index: srcPileCards.length - cardsToRestore.length + i,
			});
		});

		return { src: srcPile, dest: destPile };
	}
}
