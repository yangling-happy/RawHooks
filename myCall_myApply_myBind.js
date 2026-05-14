/**
 * 题目：手写 call、apply、bind
 * 要求：
 * 1. 实现 Function.prototype.myCall(context, ...args)
 * 2. 实现 Function.prototype.myApply(context, argsArray)
 * 3. 实现 Function.prototype.myBind(context, ...args)，返回新函数，支持柯里化传参
 * 4. context 为 null/undefined 时指向全局对象
 */

Function.prototype.myCall = function (context , ...args){
    context = context ?? globalThis ;

    const fnSymbol = Symbol();
    context[fnSymbol] = this ;

    const result = context[fnSymbol](...args);

    delete context[fnSymbol];

    return result ;
}

Function.prototype.myApply = function (context, argsArray = [] ){
    context = context ?? globalThis ;

    const fnSymbol = Symbol();
    context[fnSymbol] = this ;

    const result = context[fnSymbol](...argsArray);
    delete context[fnSymbol];
    return result;

}

Function.prototype.myBind = function (context , ...boundArgs){
    const originalFn = this ;

    return function(...remainingArgs){
        const allArgs = [...boundArgs , ...remainingArgs];
        return originalFn.call(context , ...allArgs);
    }
}

function greet(greeting , punctuation){
    console.log (`${greeting},${this.name}${punctuation}`);
}

const person = {name :'Alice'};

greet.myCall(person ,'Hello','!');
greet.myApply(person,['Hi','?']);

const greetPerson = greet.myBind(person ,'Hey');
greetPerson('!!!');
