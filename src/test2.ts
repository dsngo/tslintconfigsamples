function sayName(
  { first = 'Bob', last = 'Smith' }: { first?: string; last?: string } = {},
) {
  var name = first + ' ' + last;
  alert(name);
}

sayName();
console.log(first);
