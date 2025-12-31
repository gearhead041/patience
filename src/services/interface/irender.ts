import type { Entity, EntityName } from "../../components";

export interface iRender {
    sprites: WeakMap<HTMLDivElement,Entity>;
    createEntitySprite(entity: Entity,entityName: EntityName): HTMLDivElement;
}

export interface iAnimate {
    moveCard(src: Entity, dest: Entity): void;
}