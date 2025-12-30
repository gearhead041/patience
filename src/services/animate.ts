import type { Entity, EntityName, PileType } from "../components";
import type { EntityManager } from "../world";
import type { iAnimate, iRender } from "./interface/irender";

class Animate implements iRender, iAnimate {
    sprites: Map<Entity, HTMLDivElement> = new Map<Entity, HTMLDivElement>();
    world: EntityManager;
    /**
     *
     */
    constructor(world: EntityManager) {
        this.world = world;
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
                this.sprites.set(entity,div);
                return div;
            case "Pile":
                div.classList.add("pillar");
                var pileType = this.world.pileType.get(entity)!.kind;
                div.classList.add(pileType);
                return div;
            default:
                console.log("the hell?!");
                throw Error("unallowed type for sprite rendering")
        }
    }

    ///add card animation triggers


}