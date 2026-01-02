import type { Move, MoveHistory } from "../../components";
import type { RingBuffer } from "../ringbuffer";

export interface IMovement {
    moves: RingBuffer<MoveHistory>;
    moveCard(move: Move): boolean;
    undo(): void;
}