export const typescriptKnowledge = `
OVERVIEW
TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript. It offers optional types, classes, and modules to JavaScript, enhancing tooling and facilitating the structuring of large JavaScript applications.

ESSENTIAL USAGE
To use Typescript, create a file with a .ts extension and compose your code. Subsequently, run the TypeScript compiler (tsc) to turn the code into JavaScript. TypeScript introduces additional features like static types, interfaces, classes, namespaces, etc.

Example:
#
const studentName = 'John';
function greet(name: string): void {
  console.log("Hello, name");
}
greet(studentName);
#

ADVANCED CONCEPTS
In advanced TypeScript, you'll find concepts like Mapped types, Conditional types, Indexed Access types, and more. Understanding generics and leveraging utility types enables developers to write robust and scalable applications.

Example of Generics:
#
class Queue<T> {
  private data: T[] = [];

  push(item: T) {
    this.data.push(item);
  }

  pop(): T | undefined {
    return this.data.shift();
  }
}
#
// Use number queue
const queue = new Queue<number>();
queue.push(0);
console.log(queue.pop()?.toFixed());

// Use string queue
const queue2 = new Queue<string>();
queue2.push('Hello');
console.log(queue2.pop()?.toUpperCase());

GOOD PRACTICES
- Use types wherever possible to take full advantage of TypeScript's type checking capabilities.
- Make use of interfaces to ensure object shape.
- Leverage Generics for creating reusable components/code.
- Implement 'strictNullChecks' to avoid null and undefined errors.
- Divide your code into modules for better structure and manageability.`.trim();
