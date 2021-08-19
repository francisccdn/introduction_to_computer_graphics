// 3.3
// Implement the quicksort algorithm

const swap = function (array, a, b) {
  const aux = array[a];
  array[a] = array[b];
  array[b] = aux;
};

const partition = function (array, low, high) {
  const pivot = array[high]; // rightmost pivot

  let left_greater = low;

  for (let left_unknown = low; left_unknown < high; left_unknown++) {
    if (array[left_unknown] <= pivot) {
      swap(array, left_unknown, left_greater);
      left_greater++;
    }
  }

  swap(array, left_greater, high);
  return left_greater;
};

const quicksort = function (array, low, high) {
  if (low < high) {
    pivot_location = partition(array, low, high);
    quicksort(array, low, pivot_location - 1);
    quicksort(array, pivot_location, high);
  }
};

// Handling user interaction

const sort_user_array = function () {
  const arr = document
    .getElementById("problem-3-array")
    .value.split(",")
    .map((x) => +x);
  
  quicksort(arr, 0, arr.length - 1);
  document.getElementById("problem-3-sorted").innerHTML = arr.toString();
};
