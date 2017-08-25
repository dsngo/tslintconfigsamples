import { Observable } from "rxjs";

const digits = new Map([[0, "zero"], [1, "one"], [2, "two"], [3, "three"], [4, "four"], [5, "five"], [6, "six"], [7, "seven"], [8, "eight"], [9, "nine"]]);

for (const [digit, name] of digits) {
    console.log(`${digit} -> ${name}`);
}
const a = "sfmslgasdf";
const b = "sdfasdf";

const alphaOmega = [1, 2, 3];
console.log(alphaOmega.includes(2)); // true
console.log(alphaOmega.includes(4)); // false
