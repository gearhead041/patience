import type { Entity, EntityName } from "../../components";

export interface iRender {
    sprites: WeakMap<HTMLDivElement,Entity>;
    createEntitySprite(entity: Entity,entityName: EntityName): HTMLDivElement;
    updatePileSprite(entity: Entity): void;
}

export interface iAnimate {
}