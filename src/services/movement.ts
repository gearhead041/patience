import type { Move } from "../components";
import { MARKET_FLIP_COUNT } from "../settings";
import type { World } from "../world";
import type { IMovement } from "./interface/imovement";

export class MovementService implements IMovement {
    private world: World;
    public moves: Move[];

    constructor(world: World) {
        this.world = world;
        this.moves = [];
    }

    moveCard(move: Move, validate = true): boolean {
        if (validate && !this.validateMove(move)) {
			return false;
        }
		
		//TODO handle default movement by click
		const { pile: srcPile, index: srcIndex } = this.world.inPile.get(move.card)!;
		const srcPileType = this.world.pileType.get(srcPile)!.kind;
		//from animation have click event listener
		const srcPileCards = this.world.pileCards.get(srcPile)!.cards;
		const destPileCards = this.world.pileCards.get(move.dest)!.cards;
		switch (srcPileType) {
			case "stock":
				const spliceIdx = Math.min(srcPileCards.length, MARKET_FLIP_COUNT);
				const slicedArray = srcPileCards.splice(srcPileCards.length - spliceIdx);
				slicedArray.reverse();
				destPileCards.push(...slicedArray);
				//update cards locations and turn them all face up
				slicedArray.forEach((c, i) => {
					this.world.faceUp.set(c, { value: true });
					this.world.inPile.set(c, {
						pile: move.dest,
						index: destPileCards.length - slicedArray.length + i
					})
				});
				break;
			case "waste":
				const destPileType = this.world.pileType.get(move.dest)!.kind;

				const wasteSpliceIdx= destPileType === "stock" ? 0 : srcPileCards.length - 1;
				const newCards = srcPileCards.splice(wasteSpliceIdx);
				if(destPileType === "stock") newCards.reverse();
				destPileCards.push(...newCards);
				newCards.forEach((c, i) => {
					this.world.faceUp.set(c, { value: destPileType !== "stock"});
					this.world.inPile.set(c, {
						pile: move.dest,
						index: destPileCards.length - newCards.length + i
					})
				});
				break;
			default:
				const tableauSlice = srcPileCards.splice(srcIndex);

				//flip last card
				const topsrcIdx= srcPileCards[srcPileCards.length-1];

				if(topsrcIdx !== undefined) {
					this.world.faceUp.set(topsrcIdx,{value:true})!;
				}
				destPileCards.push(...tableauSlice);
				//update the card's location in the world
				tableauSlice.forEach((c, i) => 
					this.world.inPile.set(c, { 
						pile: move.dest, 
						index: destPileCards.length - tableauSlice.length + i 
					}));
				break;
		}

        this.moves.push(move);
        return true;
    }

    validateMove(move: Move) {
        const srcCard = this.world.cards.get(move.card)!;
        const destPileType = this.world.pileType.get(move.dest)!.kind;
        const pileCards = this.world.pileCards.get(move.dest)!.cards;
        const topCardPile = this.world.cards.get(pileCards[pileCards.length - 1]);

        //validate move
        switch (destPileType) {
            case "tableau":
                if (!topCardPile) {
                    return srcCard.rank === 13;
                }
                return topCardPile.rank - srcCard.rank === 1
                    && topCardPile.suit.color !== srcCard.suit.color;
            case "foundation": //TODO create default slice type for stock and waste
                if (!topCardPile) {
                    return srcCard.rank === 1;
                }
                return srcCard.rank - topCardPile.rank === 1
                    && srcCard.suit === topCardPile.suit;
            case "stock": //moving to stock can only come from waste
                if (pileCards.length > 0) return false;
                const stockSrcPile = this.world.inPile.get(move.card)!.pile;
                const stockSrcPileType = this.world.pileType.get(stockSrcPile)!.kind;
                return stockSrcPileType == "waste";
            case "waste": // and vice versa
                const wasteSrcPile = this.world.inPile.get(move.card)!.pile;
                const wasteSrcPileType = this.world.pileType.get(wasteSrcPile)!.kind;
                return wasteSrcPileType == "stock";

            default:
                console.log("the hell?!");
                return false;
        }
    }

    undo() {
        // TODO: Implement proper undo. 
        // Current implementation is broken because 'Move' does not store the source pile.
        // const lastMove = this.moves[this.moves.length - 1];
        // if(!lastMove) {
        //     return;
        // }

        // //destination is the source (where the card is now)
        // const destPile = this.world.inPile.get(lastMove.card)!.pile;
        // const reverseMove: Move = {
        //     dest: destPile,
        //     card: lastMove.card
        // }
        // this.moveCard(reverseMove,false);
    }

}