// 3.2
// Code a program that calculates the quantity of even numbers in an array of 10 random positive integers

// Returns array with n random int elements
const make_random_int_array = function (size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
};

// Returns quantity of even numbers in array
const num_even_in_array = function (arr) {
  let num_even = 0;
  arr.forEach((element) => {
    if (element % 2 === 0) {
      num_even++;
    }
  });
  return num_even;
};

// Handling user interaction
const write_random_int_array = function () {
  const arr = make_random_int_array(10);
  document.getElementById("problem-2-array").innerHTML = arr.toString();
};

const write_num_even = function () {
  const arr = document
    .getElementById("problem-2-array")
    .innerHTML.split(",")
    .map((x) => +x);

  document.getElementById("problem-2-array")
    .innerHTML += ` has ${num_even_in_array(arr)} even numbers.`;
};
