/**
 * 题目：实现函数柯里化 curry
 * 要求：
 * 1. 将接受多个参数的函数转换为一系列接受单个（或部分）参数的函数
 * 2. 当收集的参数数量达到原函数参数数量时自动执行
 * 3. 支持一次传入多个参数
 */
function curry(fn){
    const arity = fn.length ;

    function curried (...args){
        if (args.length >= arity){
            return fn.apply(this,args);
        }else {
            return function(...newArgs){
                return curried.apply(this , args.concat(newArgs));
            }
        }
    }
    return curried ;
}

function add (a,b,c){
    return a + b + c ;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));
console.log(curriedAdd(1, 2)(3));
console.log(curriedAdd(1)(2, 3));
console.log(curriedAdd(1, 2, 3));
