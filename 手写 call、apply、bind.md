# 手写 call、apply、bind

## 一、它们是什么？

先理解一个生活场景：你有一本武功秘籍（函数），但你想让张三（`context`）用他的内力来施展这套武功。`call`、`apply`、`bind` 就是帮你“借内力”的工具。

- **`call`**：立即施展武功，内力（`this`）和招式参数（`...args`）一次性都给清楚。
- **`apply`**：立即施展武功，但招式参数要打包成一箱（数组）送过去。
- **`bind`**：不着急施展，先“定制”好内力和部分招式，生成一个新的“半成品招式”留着以后用。

**核心思想：手动改变函数内部的 `this` 指向。**

## 二、代码逐行解析
```javascript
// 请实现这三个方法

// 1. myCall
Function.prototype.myCall = function(context, ...args) {
    // 处理 context 为 null/undefined 的情况，指向全局对象
    context = context ?? globalThis;

    // 创建一个独一无二的 Symbol 作为属性名，避免覆盖原对象属性
    const fnSymbol = Symbol();

    // 将当前函数（this）作为 context 的一个方法
    context[fnSymbol] = this;

    // 调用该方法，并传入参数
    const result = context[fnSymbol](...args);

    // 删除添加的临时方法
    delete context[fnSymbol];

    // 返回执行结果
    return result;
}

// 2. myApply
Function.prototype.myApply = function(context, argsArray = []) {
    // 处理 context 为 null/undefined 的情况
    context = context ?? globalThis;

    const fnSymbol = Symbol();
    context[fnSymbol] = this;

    // 与 call 唯一不同：argsArray 使用展开运算符传入
    const result = context[fnSymbol](...argsArray);

    delete context[fnSymbol];
    return result;
}

// 3. myBind
Function.prototype.myBind = function(context, ...boundArgs) {
    // 保存原函数
    const originalFn = this;

    // 返回一个新函数
    return function(...remainingArgs) {
        // 将所有参数合并：bind时传入的参数 + 调用时传入的参数（柯里化）
        const allArgs = [...boundArgs, ...remainingArgs];

        // 使用 call 执行原函数，并绑定 this
        // 注意：new 绑定优先级更高，这里简化处理，暂不考虑作为构造函数的情况
        return originalFn.call(context, ...allArgs);
    }
}

// ---------- 测试用例 ----------
function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

// 测试 myCall
greet.myCall(person, 'Hello', '!'); // 输出: Hello, Alice!

// 测试 myApply
greet.myApply(person, ['Hi', '?']); // 输出: Hi, Alice?

// 测试 myBind
const greetPerson = greet.myBind(person, 'Hey');
greetPerson('!!!'); // 输出: Hey, Alice!!!
```

### 1. 函数签名
```javascript
Function.prototype.myCall = function(context, ...args)
Function.prototype.myApply = function(context, argsArray)
Function.prototype.myBind = function(context, ...boundArgs)
```
- `context`：要绑定的 `this` 对象
- `args` / `argsArray`：传递给原函数的参数
- `boundArgs`：预先传入的部分参数（柯里化）

### 2. myCall 核心步骤
```javascript
// 1. 处理 null/undefined → 全局对象
context = context ?? globalThis;  // 浏览器中 globalThis 指向 window

// 2. 创建独一无二的属性名，避免冲突
const fnSymbol = Symbol();  // 保证不会覆盖 person 原有的属性

// 3. 把原函数挂载到 context 上
context[fnSymbol] = this;   // this 就是调用 myCall 的那个函数 greet

// 4. 通过 context 调用函数，此时函数内部的 this 就是 context
const result = context[fnSymbol](...args);

// 5. 清理临时属性，避免污染对象
delete context[fnSymbol];

// 6. 返回结果
return result;
```

### 3. myApply 与 myCall 的区别
```javascript
// myCall 接收参数列表
greet.myCall(person, 'Hello', '!');

// myApply 接收参数数组
greet.myApply(person, ['Hello', '!']);

// 实现上仅参数传递方式不同
const result = context[fnSymbol](...args);      // myCall
const result = context[fnSymbol](...argsArray); // myApply
```

### 4. myBind 核心步骤
```javascript
// 返回新函数，支持柯里化
const originalFn = this;

return function(...remainingArgs) {
    const allArgs = [...boundArgs, ...remainingArgs];
    return originalFn.call(context, ...allArgs);
}
```

## 三、API 详解

| API | 调用时机 | 参数形式 | 返回值 |
|-----|---------|---------|--------|
| `call` | 立即执行 | `fn.call(this, arg1, arg2, ...)` | 函数执行结果 |
| `apply` | 立即执行 | `fn.apply(this, [arg1, arg2, ...])` | 函数执行结果 |
| `bind` | 返回新函数，延迟执行 | `fn.bind(this, arg1, arg2, ...)` | 新函数 |

## 四、执行流程图解

### myCall 执行过程
```
1. 调用: greet.myCall(person, 'Hello', '!')
       │
2. 内部: context = person
       │
3. 临时挂载: person[Symbol()] = greet
       │
4. 执行: person[Symbol()]('Hello', '!')
       │   └─ 此时 greet 内部的 this === person
       │
5. 输出: Hello, Alice!
       │
6. 清理: delete person[Symbol()]
```

### myBind 柯里化过程
```
1. 调用: const greetPerson = greet.myBind(person, 'Hey')
       │
2. 返回新函数: function(...remainingArgs) { ... }
       │
3. 调用: greetPerson('!!!')
       │
4. 合并参数: ['Hey', '!!!']
       │
5. 执行: greet.call(person, 'Hey', '!!!')
```

## 五、代码追踪示例

```javascript
// 准备测试数据
const obj = { value: 100 };
function add(a, b) {
    return this.value + a + b;
}

// 追踪 myCall
console.log(add.myCall(obj, 10, 20));
// 步骤1: context = obj
// 步骤2: obj[Symbol()] = add
// 步骤3: obj[Symbol()](10, 20) → this.value = 100
// 步骤4: 100 + 10 + 20 = 130
// 步骤5: 删除临时属性，返回 130

// 追踪 myBind
const addTen = add.myBind(obj, 10);
console.log(addTen(20)); // 输出 130
// 步骤1: boundArgs = [10]
// 步骤2: 返回 function(...remainingArgs)
// 步骤3: 调用 addTen(20)
// 步骤4: allArgs = [10, 20]
// 步骤5: add.call(obj, 10, 20)
```

## 六、常见应用场景

### 1. 借用数组方法
```javascript
// 类数组转数组
function toArray() {
    // arguments 不是真正的数组
    // 借用数组的 slice 方法
    return Array.prototype.slice.myCall(arguments);
    // 或者
    return [].slice.myCall(arguments);
}

console.log(toArray(1,2,3)); // [1,2,3]
```

### 2. 类型判断
```javascript
// 借用 Object.prototype.toString
function getType(obj) {
    return Object.prototype.toString.myCall(obj);
}

console.log(getType([]));    // "[object Array]"
console.log(getType(null));  // "[object Null]"
```

### 3. 继承
```javascript
// 借用构造函数实现继承
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
}

function Child(name) {
    Parent.myCall(this, name);  // 借用 Parent 构造函数
}

const child1 = new Child('Tom');
child1.colors.push('green');

const child2 = new Child('Jerry');
console.log(child2.colors); // ['red', 'blue']，互不影响
```

### 4. 函数柯里化
```javascript
// 固定参数的函数
function multiply(a, b, c) {
    return a * b * c;
}

const multiplyBy2 = multiply.myBind(null, 2);
const multiplyBy2And3 = multiplyBy2.myBind(null, 3);
console.log(multiplyBy2And3(4)); // 2 * 3 * 4 = 24
```

## 七、完整测试代码

```javascript
// 测试 myCall
const testCall = {
    name: 'Call Test',
    say(age, job) {
        console.log(`${this.name} is ${age} years old and works as a ${job}`);
    }
};
testCall.say.myCall({ name: 'Bound Object' }, 25, 'Engineer');
// 输出: Bound Object is 25 years old and works as a Engineer

// 测试 myApply
const testApply = {
    name: 'Apply Test'
};
function introduce(city, country) {
    console.log(`${this.name} lives in ${city}, ${country}`);
}
introduce.myApply(testApply, ['Beijing', 'China']);
// 输出: Apply Test lives in Beijing, China

// 测试 myBind
const testBind = {
    name: 'Bind Test',
    prefix: 'Hello'
};
function greet(times, punctuation) {
    const msg = `${this.prefix}, ${this.name}`;
    console.log(`${msg}${punctuation.repeat(times)}`);
}
const boundGreet = greet.myBind(testBind, 3);
boundGreet('!'); // 输出: Hello, Bind Test!!!
```

## 八、核心机制深度剖析

### 8.1 为什么用 Symbol？（避免属性覆盖）

```javascript
// 错误做法：使用普通字符串作为属性名
Function.prototype.badCall = function(context, ...args) {
    context.tempFn = this;   // 可能覆盖原有属性
    const result = context.tempFn(...args);
    delete context.tempFn;   // 删除了可能原本就存在的属性！
    return result;
}

const obj = { tempFn: '原有数据' };
function fn() {}
fn.badCall(obj);  // 执行后 obj.tempFn 被删除，原有数据丢失！

// 正确做法：使用 Symbol
Function.prototype.myCall = function(context, ...args) {
    const fnSymbol = Symbol();  // 永远不会冲突
    context[fnSymbol] = this;
    // ...
}
```

### 8.2 this 的绑定优先级（完整版 myBind）

```javascript
// 进阶版 myBind，考虑 new 操作符
Function.prototype.advancedBind = function(context, ...boundArgs) {
    const originalFn = this;
    
    function boundFn(...remainingArgs) {
        const allArgs = [...boundArgs, ...remainingArgs];
        
        // 关键：如果通过 new 调用，this 指向实例，忽略绑定的 context
        const finalContext = this instanceof boundFn ? this : context;
        
        return originalFn.call(finalContext, ...allArgs);
    }
    
    // 保持原型链
    boundFn.prototype = Object.create(originalFn.prototype);
    
    return boundFn;
}

// 测试
function Animal(name) {
    this.name = name;
}
const context = {};

const BoundAnimal = Animal.advancedBind(context, 'Tom');
const tom = new BoundAnimal();  // new 调用，this 指向 tom 实例
console.log(tom.name); // 'Tom'，而不是 context 对象
```

### 8.3 context 为 null/undefined 的处理

```javascript
// 浏览器环境
function testThis() {
    'use strict';
    console.log(this);
}

// 严格模式下，call/apply/bind 传入 null/undefined，this 就是 null/undefined
testThis.call(null);   // null
testThis.apply(undefined); // undefined

// 非严格模式下，会指向全局对象
testThis.call(null);   // window (浏览器)
testThis.apply(undefined); // window

// 我们的实现使用 globalThis 模拟非严格模式行为
context = context ?? globalThis;
```

## 九、三个方法的对比总结

| 特性 | `myCall` | `myApply` | `myBind` |
|------|----------|-----------|----------|
| **执行时机** | 立即执行 | 立即执行 | 返回新函数，延迟执行 |
| **参数形式** | `(context, arg1, arg2, ...)` | `(context, [arg1, arg2, ...])` | `(context, arg1, arg2, ...)` |
| **返回值** | 原函数执行结果 | 原函数执行结果 | 新函数（bound function） |
| **柯里化** | 不支持 | 不支持 | 支持 |
| **典型用途** | 借用方法、指定 this | 参数为数组时 | 事件监听、偏函数 |

## 十、常见错误与调试

### 10.1 错误1：忘记处理返回值

```javascript
// 错误示例
Function.prototype.badCall = function(context, ...args) {
    context[Symbol()] = this;
    context[Symbol()](...args);  // 忘记 return
    delete context[Symbol()];
}

const result = add.badCall(null, 1, 2);
console.log(result); // undefined，实际应该返回 3
```

### 10.2 错误2：myBind 多次调用后 this 混乱

```javascript
const obj = { name: 'obj' };
const obj2 = { name: 'obj2' };

function log() {
    console.log(this.name);
}

const bound1 = log.myBind(obj);
const bound2 = bound1.myBind(obj2);  // 第二次 bind 无效
bound2(); // 输出 'obj'，不是 'obj2'

// 原因：myBind 返回的新函数内部固定了 context
// 解决方案：使用完整的 new 绑定优先级判断
```

### 10.3 错误3：类数组对象没有 forEach

```javascript
function test() {
    // 错误：arguments 没有 forEach
    // arguments.forEach(item => console.log(item));
    
    // 正确：借用数组的 forEach
    Array.prototype.forEach.myCall(arguments, item => console.log(item));
}
test(1,2,3); // 输出 1,2,3
```

## 十一、性能与最佳实践

```javascript
// 1. 优先使用原生方法，性能更好
// 原生 call/apply/bind 由 C++ 实现，速度更快

// 2. 高频场景缓存 bind 结果
// 不好
element.addEventListener('click', function() {
    this.handleClick.bind(this);
});

// 好
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
    }
}

// 3. 避免在循环中使用 bind
// 不好
for (let i = 0; i < 1000; i++) {
    fn.bind(context, i)();
}

// 好
const boundFn = fn.bind(context);
for (let i = 0; i < 1000; i++) {
    boundFn(i);
}
```

## 十二、总结

**记住核心思想：`call` 和 `apply` 是借鸡生蛋（借用别人的 `this` 立即执行），`bind` 是定制一个半成品（预设 `this` 和参数，返回新函数）。**

**关键知识点回顾：**
- Symbol：创建唯一属性名，避免覆盖
- this 指向：函数作为对象方法调用时，this 指向该对象
- 闭包：myBind 通过闭包保存原函数和预设参数
- 柯里化：参数拆分，分批传入
- 优先级：new 绑定 > 显式绑定（call/apply/bind）

**适用场景：**
- ✅ 借用数组方法操作类数组
- ✅ 继承中调用父类构造函数
- ✅ 事件处理函数绑定 this
- ✅ 函数柯里化、偏函数应用
- ✅ 类型判断（Object.prototype.toString）
- ❌ 箭头函数（已经绑定 this，无法改变）
- ❌ 严格模式下传入 null/undefined（不会指向全局）
