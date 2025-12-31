import type { Move } from "../components";
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

        const { pile: srcPile, index: srcIndex } = this.world.inPile.get(move.card)!;
        const srcPileCards = this.world.pileCards.get(srcPile)!.cards;
        const destPileCards = this.world.pileCards.get(move.dest)!.cards;
        const slicedArray = srcPileCards.splice(srcIndex);

        //flip last card
        const topsrcIdx= srcPileCards[srcPileCards.length-1];

        if(topsrcIdx !== null ) {
           this.world.faceUp.set(topsrcIdx,{value:true})!;
        }

        destPileCards.push(...slicedArray);
        //update the card's location in the world
        slicedArray.forEach((c, i) => 
            this.world.inPile.set(c, { 
                pile: move.dest, 
                index: destPileCards.length - slicedArray.length + i 
            }));

        this.moves.push(move);
        return true;
    }

    validateMove(move: Move) {
        var srcCard = this.world.cards.get(move.card)!;
        var destPileType = this.world.pileType.get(move.dest)!.kind;
        var pileCards = this.world.pileCards.get(move.dest)!.cards;
        var topCardPile = this.world.cards.get(pileCards[pileCards.length - 1]);

        //validate move
        switch (destPileType) {
            case "tableau":
                if (!topCardPile) {
                    return srcCard.rank === 13;
                }
                return topCardPile.rank - srcCard.rank === 1
                    && topCardPile.suit.color !== srcCard.suit.color;
            case "foundation":
                if (!topCardPile) {
                    return srcCard.rank === 1;
                }
                return srcCard.rank - topCardPile.rank === 1
                    && srcCard.suit === topCardPile.suit;
            case "stock": //moving to stock can only come from waste
                var srcPile = this.world.inPile.get(move.card)!.pile;
                var srcPileType = this.world.pileType.get(srcPile)!.kind;
                return srcPileType == "waste";
            case "waste": // and vice versa
                var srcPile = this.world.inPile.get(move.card)!.pile;
                var srcPileType = this.world.pileType.get(srcPile)!.kind;
                return srcPileType == "stock";

            default:
                console.log("the hell?!");
                false;
        }
    }

    undo() {
        const lastMove = this.moves[this.moves.length - 1];
        if(!lastMove) {
            return;
        }

        //destination is the source (where the card is now)
        const destPile = this.world.inPile.get(lastMove.card)!.pile;
        const reverseMove: Move = {
            dest: destPile,
            card: lastMove.card
        }
        this.moveCard(reverseMove,false);
    }

}