class Startup {
    public static main(): number {
        console.log("Hello World");
        return 0;
    }
}

const obj = { number: 1, age: 19, name: "daniel" };
const obj2 = { ...obj };
// console.log(obj2);
// Startup.main();

// export { obj, obj2, }
// export const a = 11, b = 12;

export default { Startup, obj, obj2 };
