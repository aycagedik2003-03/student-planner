// 7.31 Prime number check
let number = parseInt(prompt("Enter a number:"));
let isPrime = true;

if (number <= 1) {
    isPrime = false;
} else {
    for (let i = 2; i < number; i++) {
        if (number % i === 0) {
            isPrime = false;
            break;
        }
    }
}

if (isPrime) {
    console.log(number + " is prime");
} else {
    console.log(number + " is not prime");
}


// 7.32 Display even numbers from 1 to 50
let numbers = [];

for (let i = 1; i <= 50; i++) {
    numbers.push(i);
}

for (let num of numbers) {
    if (num % 2 === 0) {
        console.log(num);
    }
}


// 7.34 Sum of numbers divisible by 3 and 5
let sum = 0;

for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
        sum += i;
    }
}

console.log("Sum:", sum);


// 7.35 Palindrome check
let word = prompt("Enter a word:");
let reversed = word.split("").reverse().join("");

if (word === reversed) {
    console.log("Palindrome");
} else {
    console.log("Not palindrome");
}


// 7.36 Object with user data
let user = {
    name: "John",
    age: 22,
    email: "john@example.com"
};

for (let key in user) {
    console.log(key + ": " + user[key]);
}


// 7.37 Reverse array without reverse()
let arr = [1, 2, 3, 4, 5];
let reversedArr = [];

for (let i = arr.length - 1; i >= 0; i--) {
    reversedArr.push(arr[i]);
}

console.log(reversedArr);


// 7.38 Conditional operator
let n = 12;

let result = (n % 2 === 0 && n % 3 === 0)
    ? "Divisible by 2 and 3"
    : "Not divisible by 2 and 3";

console.log(result);


// 7.39 Smallest and largest number
let nums = [15, 42, 7, 23, 67, 1, 90];

let smallest = nums[0];
let largest = nums[0];

for (let i = 1; i < nums.length; i++) {
    if (nums[i] < smallest) {
        smallest = nums[i];
    }

    if (nums[i] > largest) {
        largest = nums[i];
    }
}

console.log("Smallest:", smallest);
console.log("Largest:", largest);


// 7.40 Month name with switch
let month = 3;

switch (month) {
    case 1:
        console.log("January");
        break;
    case 2:
        console.log("February");
        break;
    case 3:
        console.log("March");
        break;
    case 4:
        console.log("April");
        break;
    case 5:
        console.log("May");
        break;
    case 6:
        console.log("June");
        break;
    case 7:
        console.log("July");
        break;
    case 8:
        console.log("August");
        break;
    case 9:
        console.log("September");
        break;
    case 10:
        console.log("October");
        break;
    case 11:
        console.log("November");
        break;
    case 12:
        console.log("December");
        break;
    default:
        console.log("Invalid month");
}