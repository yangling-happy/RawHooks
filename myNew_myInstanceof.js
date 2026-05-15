/**
 * 题目：手写 new 操作符和 instanceof
 * 要求：
 * 1. myNew(Constructor, ...args)：模拟 new 操作符行为
 *    - 创建新对象，原型指向构造函数的 prototype
 *    - 执行构造函数，绑定 this
 *    - 如果构造函数返回对象则使用该对象，否则返回新对象
 * 2. myInstanceof(obj, Constructor)：沿原型链查找
 */
function myNew(Constructor , ...args){
    const obj = Object.create(Constructor.prototype);

    const result = Constructor.apply(obj , args);

    return (result !== null && typeof result === 'object') || typeof result ==='function' ? result : obj ;
}

function myInstanceof(obj , Constructor){
    if (typeof Constructor !== 'function'){
        throw new TypeError();
    }

    if (obj === null || obj === undefined){
        return false ;
    }

    let proto = Object.getPrototypeOf(obj);
    const prototype = Constructor.prototype;

    while (proto !== null){
        if (proto === prototype ){
            return true ;
        }

        proto = Object.getPrototypeOf(proto);
    }
    return false ;
}

function Person (name ,age ){
    this.name = name ;
    this.age = age ;
}
Person.prototype.sayHello = function (){
    return `Hello , I'm ${this.name}`;
}

const p1 = myNew (Person , '张三' , 18 );
console.log(p1.name);
console.log(p1.age);
console.log(p1.sayHello());
console.log(p1 instanceof Person);
console.log(myInstanceof(p1,Person));
