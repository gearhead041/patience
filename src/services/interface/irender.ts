import type { Entity, EntityName } from "../../components";

export interface iRender {
    sprites: Map<Entity,HTMLDivElement>;
    createEntitySprite(entity: Entity,entityName: EntityName): HTMLDivElement;
}

export interface iAnimate {
    moveCard(src: Entity, dest: Entity): void;
}