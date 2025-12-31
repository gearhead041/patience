import type { Entity, EntityName, Move } from "../components";
import { PILLAR_FACEDOWN_OFFSET, PILLAR_FACEUP_OFFSET } from "../constants";
import type { World } from "../world";
import type { IMovement } from "./interface/imovement";
import type { iAnimate, iRender } from "./interface/irender";
import { MovementService } from "./movementrules";

export class Animate implements iRender, iAnimate {
    sprites: WeakMap<HTMLDivElement, Entity> = new WeakMap<HTMLDivElement, Entity>();
    private readonly entityToSprites: Map<Entity, HTMLDivElement> = new Map<Entity, HTMLDivElement>();
    private readonly world: World;
    private readonly movementService: IMovement;

    constructor(world: World) {
        this.world = world;
        this.movementService = new MovementService(world);
    }

    moveCard(src: Entity, dest: Entity): void {
        throw new Error("Method not implemented.");
    }

    createEntitySprite(entity: Entity, entityName: EntityName): HTMLDivElement {
        var div = document.createElement("div");
        switch (entityName) {
            case "Card":
                var cardData = this.world.cards.get(entity)!;
                div.className = "card";
                div.classList.add(cardData.suit.shape);
                div.classList.add("facedown");
                this.makeDraggable(div);
                break;
            case "Pile":
                div.classList.add("pillar");
                var pileType = this.world.pileType.get(entity)!.kind;
                div.classList.add(pileType);
                break;
            default:
                console.log("the hell?!");
                throw Error("unallowed type for sprite rendering")
        }
        this.sprites.set(div, entity);
        this.entityToSprites.set(entity, div);
        return div;
    }

    private updatePileSprite(entity: Entity) {
        var pileDiv = this.entityToSprites.get(entity)!;
  
        var pileCards = this.world.pileCards.get(entity)!.cards;
        var cardDivs = pileCards.map(x => this.entityToSprites.get(x)!);
        if (cardDivs) {
            pileCards.forEach((c, i) => {
                var cardDiv = cardDivs[i];
                var cardData = this.world.cards.get(c)!;
                cardDiv.style.zIndex = (i).toString();
                cardDiv.style.left = ""; // Reset drag position to snap to parent/pillar
                cardDiv.style.right = "";
                var isFaceup =  this.world.faceUp.get(c)!.value;

                if(isFaceup && cardDiv.classList.contains("facedown")) {
                    cardDiv.classList.replace("facedown", "faceup");
			        var textNode = document.createElement("div");
			        textNode.classList.add("card-face");
			        textNode.textContent = cardData.rank.toString();
			        cardDiv.appendChild(textNode);
                }

                if (i > 0) {
                    cardDiv.style.top = isFaceup
                    ? PILLAR_FACEUP_OFFSET : PILLAR_FACEDOWN_OFFSET;
                }
                else {
                    cardDiv.style.top = "0";
                }
            });
            pileDiv.appendChild(cardDivs[0]);
            cardDivs.reduce((prev, curr) => prev.appendChild(curr));
        }

    }

    private makeMove(src: HTMLDivElement, dest: HTMLDivElement): boolean {
        var destPile = this.sprites.get(dest)!;
        var card = this.sprites.get(src)!;
        var srcPile = this.world.inPile.get(card)!.pile;
        const move: Move = {
            card: card,
            dest: destPile
        }
        var result = this.movementService.moveCard(move);
        if (!result) {
            return false;
        }
        this.updatePileSprite(srcPile);
        this.updatePileSprite(destPile);
        return true;
    }

    ///add draggable event listener
    private makeDraggable(div: HTMLDivElement) {
        var offset = [0, 0];
        var zIndex: string;

        const onMouseMove = (event: MouseEvent) => {
            event.preventDefault();
            const mousePosition = {
                x: event.clientX,
                y: event.clientY,
            };
            div.style.left = mousePosition.x + offset[0] + "px";
            div.style.top = mousePosition.y + offset[1] + "px";
        };

        function getLowerPillarElem(event: MouseEvent): HTMLDivElement | null {
            div.hidden = true;
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            div.hidden = false;
            if (elemBelow) {
                if (elemBelow.closest('.market')) {
                    return null;
                }
                const pillarDiv = elemBelow.closest('.pillar');
                return pillarDiv as HTMLDivElement;
            }
            return null;
        }

        const onMouseUp = (event: MouseEvent) => {
            event.preventDefault();
            div.style.zIndex = zIndex;

            ///  get entities
            var lowerElem = getLowerPillarElem(event);
            if (lowerElem) {
                var success = this.makeMove(div, lowerElem);
                if (!success) {
                    //reset
                }
            }

            //reset

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        div.addEventListener(
            "mousedown",
            (e: MouseEvent) => {
                if(div.classList.contains("faceup")){
                    offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
                    zIndex = div.style.zIndex;
                    div.style.zIndex = "1000"; //make sure it's on top while dragging
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                }
            },
        );
    }

}

