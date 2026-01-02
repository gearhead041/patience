export class RingBuffer<T> {
    private buf: T[];
    private head = 0;
    private tail = 0;

    constructor(capacity: number) {
        this.buf = new Array(capacity);
    }

    push(value: T): void {
        this.buf[this.head] = value;
        this.head = (this.head + 1) % this.buf.length;

        // overwrite oldest when full
        if (this.head === this.tail) {
            this.tail = (this.tail + 1) % this.buf.length;
        }
    }

    shift(): T | undefined {
        if (this.head === this.tail) return undefined;

        const value = this.buf[this.tail];
        this.tail = (this.tail + 1) % this.buf.length;
        return value;
    }
}
