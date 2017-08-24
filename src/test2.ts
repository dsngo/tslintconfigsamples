function sayName(
    { first = "Bob", last = "Smith" }: { first?: string; last?: string } = {},
) {
    const name = first + " " + last;
    alert(name);
}

sayName();
// console.log(first);
