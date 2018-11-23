var _ = require("lodash");

class Node {
  constructor(value, priority) {
    this.value = value;
    this.priority = priority;
  }
}

class PriorityQueue {
  constructor() {
    this.heap = [null];
  }

  getParentIndex(currentIndex) {
    return Math.floor(currentIndex / 2);
  }

  getChildIndex(currentIndex) {
    let [left, right] = [2 * currentIndex, 2 * currentIndex + 1];
    let childIndex;
    if (this.heap[left] && this.heap[right]) {
      childIndex =
        this.heap[left].priority < this.heap[right].priority ? left : right;
    } else if (this.heap[left] && !this.heap[right]) {
      childIndex = left;
    } else if (!this.heap[left] && this.heap[right]) {
      childIndex = right;
    }
    return childIndex;
  }

  insert(value, priority) {
    let newNode = new Node(value, priority);

    this.heap.push(newNode);

    let currentIndex = this.heap.length - 1;
    let parentIndex = this.getParentIndex(currentIndex);
    while (
      this.heap[parentIndex] &&
      this.heap[currentIndex].priority < this.heap[parentIndex].priority
    ) {
      let temp = this.heap[parentIndex];
      this.heap[parentIndex] = this.heap[currentIndex];
      this.heap[currentIndex] = temp;
      currentIndex = parentIndex;
      parentIndex = this.getParentIndex(currentIndex);
    }
  }

  remove() {
    if (this.heap.length < 3) {
      let returnNode = this.heap.pop();
      this.heap[0] = null;
      return returnNode;
    }

    let returnNode = this.heap[1];
    this.heap[1] = this.heap.pop();

    let currentIndex = 1;

    let childIndex = this.getChildIndex(currentIndex);

    while (
      this.heap[childIndex] &&
      this.heap[currentIndex].priority > this.heap[childIndex].priority
    ) {
      let temp = this.heap[childIndex];
      this.heap[childIndex] = this.heap[currentIndex];
      this.heap[currentIndex] = temp;

      currentIndex = childIndex;
      childIndex = this.getChildIndex(currentIndex);
    }

    return returnNode;
  }
}

export default PriorityQueue;

// test cases
/*
let queue = new PriorityQueue();
queue.insert(9, 9);
queue.insert(3, 5);
queue.insert(1, 7);
queue.insert(2, 8);
queue.insert(17, 4);
queue.insert(36, 3);
queue.insert(25, 6);
queue.insert(100, 1);
queue.insert(19, 2);
console.log(queue.heap);
console.log(queue.remove());
console.log(queue.heap);
*/
