export class MoveStack<T> {
	private readonly moveStack: T[] = [];
	private readonly capacity: number;
	private readonly undoneStack: T[] = [];

	constructor(capacity: number) {
		this.capacity = capacity;
	}

	push(state: T): void {
		this.moveStack.push(state);
		if (this.moveStack.length > this.capacity) {
			this.moveStack.shift();
		}
		if( this.undoneStack.length > 0) {
			this.undoneStack.length = 0; //clear redo stack on new move
		}
	}

	pop(): T | undefined {	
		var lastMove = this.moveStack.pop();
		if (lastMove) {
			this.undoneStack.push(lastMove);
		}
		return lastMove;
	}

	redo(): T | undefined {
		var lastUndone = this.undoneStack.pop();
		if (lastUndone) {
			this.moveStack.push(lastUndone);
		}
		return lastUndone;
	}
	
}
