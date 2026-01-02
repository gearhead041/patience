import type { Entity, Move, MoveHistory } from "../../components";
import type { MoveStack } from "../movestack";

export interface IMovement {
    moves: MoveStack<MoveHistory>;
    moveCard(move: Move): boolean;
    undo(): { src: Entity; dest: Entity } | null;
}