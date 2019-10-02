interface bar {
  value: number;
  isSwapped: boolean;
  isCompared: boolean;
}

interface Action {
  type: string;
  first?: number;
  second?: number;
  index?: number;
  value?: number;
}

export default class Sorter {
  arr: Array<bar>;

  constructor(array: Array<bar>) {
    this.arr = array;
  }

  *bubbleSort(): IterableIterator<Action> {
    let n = this.arr.length;
    let arrayCopy = [...this.arr];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        yield { type: "comparison", first: j, second: j + 1 };
        if (arrayCopy[j].value > arrayCopy[j + 1].value) {
          yield { type: "swap", first: j, second: j + 1 };
          [arrayCopy[j], arrayCopy[j + 1]] = [arrayCopy[j + 1], arrayCopy[j]];
        }
      }
    }
  }

  *selectionSort(): IterableIterator<Action> {
    let n = this.arr.length;
    let arrayCopy = [...this.arr];
    for (let i = 0; i < n; i++) {
      let indexMin = i;
      for (let j = i + 1; j < n; j++) {
        yield { type: "comparison", first: indexMin, second: j };
        if (arrayCopy[j].value < arrayCopy[indexMin].value) {
          indexMin = j;
        }
      }
      yield { type: "swap", first: indexMin, second: i };
      [arrayCopy[indexMin], arrayCopy[i]] = [arrayCopy[i], arrayCopy[indexMin]];
    }
  }

  *insertionSort(
    left: number = 0,
    right: number = this.arr.length
  ): IterableIterator<Action> {
    let arrayCopy = [...this.arr];
    for (let i = left + 1; i < right; i++) {
      const x = arrayCopy[i].value;
      let j = i;
      yield { type: "comparison", first: j - 1, second: i };
      while (j > left && arrayCopy[j - 1].value > x) {
        yield { type: "changeValue", index: j, value: arrayCopy[j - 1].value };
        arrayCopy[j].value = arrayCopy[j - 1].value;
        j--;
        // yield compare if next is a comparison
        if (j > left) {
          yield { type: "comparison", first: j - 1, second: i };
        }
      }
      yield { type: "changeValue", index: j, value: x };
      arrayCopy[j].value = x;
    }
  }

  *mergeSort(): IterableIterator<Action> {
    function* merge(
      arr: Array<bar>,
      left: number,
      mid: number,
      right: number
    ): IterableIterator<Action> {
      let start2 = mid + 1;

      if (arr[mid].value <= arr[start2].value) {
        return;
      }

      while (left <= mid && start2 <= right) {
        // If element 1 is in right place
        yield { type: "comparison", first: left, second: start2 };
        if (arr[left].value <= arr[start2].value) {
          left++;
        } else {
          const value = arr[start2].value;
          let index = start2;

          // Shift all the elements between element 1
          // element 2, right by 1.
          while (index != left) {
            yield { type: "changeValue", index, value: arr[index - 1].value };
            arr[index].value = arr[index - 1].value;
            index--;
          }
          yield { type: "changeValue", index: left, value };
          arr[left].value = value;

          // Update all the pointers
          left++;
          mid++;
          start2++;
        }
      }
    }

    function* _mergeSort(
      arr: Array<bar>,
      left: number,
      right: number
    ): IterableIterator<Action> {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        yield* _mergeSort(arr, 0, mid);
        yield* _mergeSort(arr, mid + 1, right);
        yield* merge(arr, left, mid, right);
      }
    }

    const arr = [...this.arr];
    yield* _mergeSort(arr, 0, arr.length - 1);
  }

  *quickSort(): IterableIterator<Action> {
    function* _quickSort(
      arr: Array<bar>,
      first: number = 0,
      last: number = arr.length - 1
    ): IterableIterator<Action> {
      if (first < last) {
        let pivot = arr[last].value;
        let i = first - 1;

        for (let j = first; j < last; j++) {
          yield { type: "comparison", first: j, second: last };
          if (arr[j].value < pivot) {
            i++;
            yield { type: "swap", first: i, second: j };
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
        yield { type: "swap", first: i + 1, second: last };
        [arr[i + 1], arr[last]] = [arr[last], arr[i + 1]];
        pivot = i + 1;
        yield* _quickSort(arr, first, pivot - 1);
        yield* _quickSort(arr, pivot + 1, last);
      }
    }

    const arr = [...this.arr];
    yield* _quickSort(arr);
  }

  countingSort(): Array<number> {
    const arr = [...this.arr];
    const n = arr.length;
    const maxRange = Math.max(...arr.map(v => v.value));
    // grouping values by counts
    let countArr = new Array(maxRange + 1).fill(0);
    for (let i = 0; i < n; i++) {
      countArr[arr[i].value] += 1;
    }
    // cumulative sum in counts
    for (let j = 1; j < countArr.length; j++) {
      countArr[j] += countArr[j - 1];
    }
    // displacing elements to the right
    for (let k = countArr.length - 1; k > 0; k--) {
      countArr[k] = countArr[k - 1];
    }
    countArr[0] = 0;
    let result = new Array(n);
    for (let i = 0; i < n; i++) {
      const toPlace = arr[i].value;
      const placeIndex = countArr[toPlace];
      result[placeIndex] = toPlace;
      countArr[toPlace]++;
    }
    return result;
  }

  radixSort(arr: Array<number>): void {
    const _countingSort = (arr: Array<number>, digit: number): void => {
      const n = arr.length;
      let output = new Array(n).fill(0);
      let count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) {
        const index = arr[i] / digit;
        count[index % 10] += 1;
      }
      for (let j = 1; j < 10; j++) {
        count[j] += count[j - 1];
      }
      let i = n - 1;
      while (i >= 0) {
        const index = arr[i] / digit;
        output[count[index % 10] - 1] = arr[i];
        count[index % 10] -= 1;
        i -= 1;
      }
      i = 0;
      for (i = 0; i < n; i++) {
        arr[i] = output[i];
      }
    };

    const maxArr = Math.max(...arr);
    let digit = 1;
    while (Math.floor(maxArr / digit) > 0) {
      _countingSort(arr, digit);
      digit *= 10;
    }
  }

  *timSort(RUN: number = 32): IterableIterator<Action> {
    function* _merge(
      arr: Array<bar>,
      leftIndex: number,
      midIndex: number,
      rightIndex: number
    ): IterableIterator<Action> {
      const len1 = midIndex - leftIndex + 1,
        len2 = rightIndex - midIndex;
      let left: Array<bar> = [],
        right: Array<bar> = [];
      for (let i = 0; i < len1; i++) {
        left.push(arr[leftIndex + i]);
      }
      for (let i = 0; i < len2; i++) {
        right.push(arr[rightIndex + i]);
      }

      let li = 0,
        ri = 0,
        k = leftIndex;
      while (li < len1 && ri < len2) {
        yield { type: "comparison", first: li, second: ri };
        if (left[li].value < right[ri].value) {
          yield { type: "changeValue", index: k, value: left[li].value };
          arr[k] = left[li];
          li++;
        } else {
          yield { type: "changeValue", index: k, value: right[ri].value };
          arr[k] = right[ri];
          ri++;
        }
        k++;
      }
      while (li < len1) {
        yield { type: "changeValue", index: k, value: left[li].value };
        arr[k] = left[li];
        li++;
        k++;
      }
      while (ri < len2) {
        yield { type: "changeValue", index: k, value: right[ri].value };
        arr[k] = right[ri];
        ri++;
        k++;
      }
    }

    const arr = [...this.arr];
    const n = arr.length;
    for (let i = 0; i < n; i += RUN) {
      yield* this.insertionSort(i, Math.min(i + 31, n));
    }

    let size = RUN;
    while (size < n) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(n - 1, left + 2 * size - 1);
        yield* _merge(arr, left, mid, right);
      }
      size *= 2;
    }
  }

  *heapSort(): IterableIterator<Action> {
    interface heapArray {
      values: Array<bar>;
      heapSize: number;
    }
    const _right = (i: number): number => 2 * i + 2;
    const _left = (i: number): number => 2 * i + 1;
    function* _maxHeapify(arr: heapArray, i: number): IterableIterator<Action> {
      const l = _left(i);
      const r = _right(i);
      let largest = i;
      if (l < arr.heapSize) {
        yield { type: "comparison", first: l, second: i };
        if (arr.values[l].value > arr.values[i].value) {
          largest = l;
        }
      }
      if (r < arr.heapSize) {
        yield { type: "comparison", first: r, second: largest };
        if (arr.values[r].value > arr.values[largest].value) {
          largest = r;
        }
      }
      if (largest !== i) {
        yield { type: "swap", first: i, second: largest };
        [arr.values[i], arr.values[largest]] = [
          arr.values[largest],
          arr.values[i]
        ];
        yield* _maxHeapify(arr, largest);
      }
    }
    function* _buildMaxHeap(arr: heapArray): IterableIterator<Action> {
      arr.heapSize = arr.values.length;
      for (let i = Math.floor(arr.values.length / 2); i >= 0; i--) {
        yield* _maxHeapify(arr, i);
      }
    }
    function* _heapSort(arr: heapArray): IterableIterator<Action> {
      yield* _buildMaxHeap(arr);
      for (let i = arr.values.length - 1; i > 0; i--) {
        yield { type: "swap", first: 0, second: i };
        [arr.values[0], arr.values[i]] = [arr.values[i], arr.values[0]];
        arr.heapSize -= 1;
        yield* _maxHeapify(arr, 0);
      }
    }
    const arr = [...this.arr];
    const heapArr: heapArray = {
      values: arr,
      heapSize: 0
    };
    yield* _heapSort(heapArr);
  }
}
