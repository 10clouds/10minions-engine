export const oopKnowledge = `
Principle 1: Understand and Use Classes

In TypeScript, the Class concept is a core part of Object-Oriented programming. A class encapsulates data and functions which manipulate data.

Example:
# typescript
class Employee {
  name: string;
  id: number;

  constructor(name: string, id: number){
    this.name = name;
    this.id = id;
  }
  
  displayInfo(): void {
    console.log('Employee Name: {this.name}, Employee ID: {this.id}');
  }
}

let emp1 = new Employee("John", 101);
emp1.displayInfo();
#

Principle 2: Implementing Inheritance

Inheritance is a feature that promotes re-usability of the code.

Example:
# typescript
class Manager extends Employee {
  department: string;
  
  constructor(name: string, id: number, department: string){
    super(name, id);
    this.department = department;
  }
  
  displayInfo(): void {
    super.displayInfo();
    console.log('Department: {this.department}');
  }
}

let mgr1 = new Manager("Mark", 102, "IT");
mgr1.displayInfo();
#

Principle 3: Working with Interfaces

Interfaces define a code contract that classes can implement. This leads to more structured code and also to a kind of code documentation.

Example:
# typescript
interface IEmployee {
  name: string;
  id: number;
  displayInfo(): void;
}

class Employee implements IEmployee {
  // implementations...
}
#

Principle 4: Understand and Use Encapsulation

Encapsulation protects an object's attributes by making them accessible only through methods of its class.

Example:
# typescript
class Employee {
  private name: string;
  private id: number;

  constructor(name: string, id: number){
    this.name = name;
    this.id = id;
  }
  
  // getters and setters...
}
#

Principle 5: Use Polymorphism 

Polymorphism is an object-oriented programming concept that refers to the ability of a variable, function or object to take on multiple forms.

Example:
# typescript
class Employee {
  // …
}

class Manager extends Employee {
  // different implementations…
}

let emp1: Employee = new Employee(…); 
let mgr1: Employee = new Manager(…); // treat Manager as Employee
#

Following these principles will help you to write cleaner, well-organized, and easy-to-manage TypeScript code.`.trim();
