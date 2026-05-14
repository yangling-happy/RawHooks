# new 操作符与 instanceof

## 一、new 是什么？instanceof 是什么？

**先理解两个生活场景：**

- **new**：就像工厂的生产线。你给工厂一张设计图（构造函数），工厂按照图纸造出一个新产品（实例对象），并且这个产品自动拥有了图纸上描述的技能（方法）和属性。

- **instanceof**：就像验货员。你拿着一个产品问："这是这个工厂生产的吗？" 验货员会沿着产品的生产链往上查，看能不能找到这个工厂的标记。

## 二、代码逐行解析

```javascript
/**
 * 题目：手写 new 操作符和 instanceof
 * 要求：
 * 1. myNew(Constructor, ...args)：模拟 new 操作符行为
 *    - 创建新对象，原型指向构造函数的 prototype
 *    - 执行构造函数，绑定 this
 *    - 如果构造函数返回对象则使用该对象，否则返回新对象
 * 2. myInstanceof(obj, Constructor)：沿原型链查找
 */

// 请实现 myNew 和 myInstanceof

function myNew(Constructor, ...args) {
    // 1. 创建新对象，原型指向 Constructor.prototype
    const obj = Object.create(Constructor.prototype);
    
    // 2. 执行构造函数，绑定 this 到新对象
    const result = Constructor.apply(obj, args);
    
    // 3. 如果构造函数返回对象类型（非 null），则返回该对象，否则返回 obj
    return (result !== null && typeof result === 'object') || typeof result === 'function' 
        ? result 
        : obj;
}

function myInstanceof(obj, Constructor) {
    // 边界检查：右侧必须是一个函数
    if (typeof Constructor !== 'function') {
        throw new TypeError('Right-hand side of instanceof is not callable');
    }
    
    // 边界检查：左侧不能是 null 或 undefined
    if (obj === null || obj === undefined) {
        return false;
    }
    
    // 获取对象的原型
    let proto = Object.getPrototypeOf(obj);
    const prototype = Constructor.prototype;
    
    // 沿着原型链向上查找
    while (proto !== null) {
        if (proto === prototype) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    
    return false;
}

// ---------- 测试用例 ----------
function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.sayHello = function() {
    return `Hello, I'm ${this.name}`;
};

// 测试 myNew
const p1 = myNew(Person, '张三', 18);
console.log(p1.name);        // '张三'
console.log(p1.age);         // 18
console.log(p1.sayHello());  // "Hello, I'm 张三"
console.log(p1 instanceof Person);  // true（原生 instanceof 验证）
console.log(myInstanceof(p1, Person));  // true

// 测试构造函数返回对象的情况
function Animal(name) {
    this.name = name;
    return { type: 'animal' };  // 返回对象，会覆盖默认返回值
}
const a1 = myNew(Animal, '小狗');
console.log(a1.name);   // undefined（因为返回的对象没有 name）
console.log(a1.type);   // 'animal'

// 测试基本类型返回值
function NumberWrapper(n) {
    this.value = n;
    return 123;  // 返回基本类型，会被忽略
}
const n1 = myNew(NumberWrapper, 42);
console.log(n1.value);  // 42（基本类型返回值被忽略）
console.log(n1 instanceof NumberWrapper);  // true

// 测试 myInstanceof 边界情况
console.log(myInstanceof({}, Object));     // true
console.log(myInstanceof([], Array));      // true
console.log(myInstanceof([], Object));     // true（数组的原型链上有 Object）
console.log(myInstanceof(null, Object));   // false
console.log(myInstanceof(undefined, Object)); // false
```

## 三、myNew 执行流程图解

```
调用 myNew(Person, '张三', 18)

步骤1: Object.create(Person.prototype)
┌─────────────────────────────────────┐
│  obj = {}                           │
│  obj.__proto__ = Person.prototype   │
└─────────────────────────────────────┘
            │
            ▼
步骤2: Constructor.apply(obj, args)
┌─────────────────────────────────────┐
│  Person 函数内部：                   │
│  this = obj                         │
│  this.name = '张三'                  │
│  this.age = 18                      │
│  没有 return 或返回基本类型          │
└─────────────────────────────────────┘
            │
            ▼
步骤3: 判断返回值
┌─────────────────────────────────────┐
│  result = undefined（无返回）        │
│  不是对象 → 返回 obj                 │
└─────────────────────────────────────┘
            │
            ▼
返回: { name: '张三', age: 18, __proto__: Person.prototype }
```

## 四、API 详解

| API | 作用 | 在本函数中的用途 |
|-----|------|------------------|
| `Object.create(proto)` | 创建新对象，原型指向 proto | 一步完成对象创建和原型链绑定 |
| `Function.apply(this, args)` | 调用函数，指定 this 和参数数组 | 执行构造函数，让 this 指向新对象 |
| `Object.getPrototypeOf(obj)` | 获取对象的原型 | 沿原型链向上查找 |
| `typeof` | 判断数据类型 | 检查返回值的类型是否为对象或函数 |

## 五、Object.create 深度解析

### 5.1 为什么不用 `{}` 或 `new Object()`？

```javascript
// 方法1：直接创建空对象（错误❌）
const obj1 = {};
obj1.__proto__ = Constructor.prototype;  // 不推荐直接修改 __proto__

// 方法2：Object.create（正确✅）
const obj2 = Object.create(Constructor.prototype);
// 等价于：
// const obj2 = {};
// Object.setPrototypeOf(obj2, Constructor.prototype);
```

### 5.2 Object.create 的手动实现

```javascript
// 理解 Object.create 的原理
function myObjectCreate(proto) {
    function F() {}      // 临时构造函数
    F.prototype = proto; // 原型指向 proto
    return new F();      // 返回实例，原型链自动连接
}

// 所以 myNew 也可以这样实现：
function myNew2(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype);
    // ... 后续相同
}
```

## 六、构造函数返回值的处理规则

### 6.1 返回值的类型决定最终结果

```javascript
// 情况1：返回基本类型（number, string, boolean, null, undefined）
function Test1() {
    this.value = 1;
    return 123;        // 基本类型，被忽略
}
const t1 = myNew(Test1);
console.log(t1.value);  // 1（实例对象被返回）
console.log(t1 instanceof Test1);  // true

// 情况2：返回对象（包括数组、函数、正则等）
function Test2() {
    this.value = 1;
    return { other: 2 };  // 返回对象，会覆盖
}
const t2 = myNew(Test2);
console.log(t2.value);  // undefined
console.log(t2.other);  // 2
console.log(t2 instanceof Test2);  // false（t2 不是 Test2 的实例）

// 情况3：返回 null（null 是对象类型，但逻辑上应视为基本类型）
function Test3() {
    this.value = 1;
    return null;  // null 被认为是对象，但 new 操作符会忽略它
}
const t3 = myNew(Test3);
console.log(t3.value);  // 1（null 被视为无效返回值）
```

### 6.2 myNew 中的判断逻辑拆解

```javascript
// 核心判断代码
const shouldReturnResult = 
    (result !== null && typeof result === 'object') || 
    typeof result === 'function';

// 拆解分析：
// 条件1: result !== null && typeof result === 'object'
//        → 匹配：{}、[]、new Date()、/regex/ 等
//        → 不匹配：null、undefined、123、"string"、true
//
// 条件2: typeof result === 'function'
//        → 匹配：function() {}、箭头函数、类
//        → 注意：构造函数可以返回另一个函数

return shouldReturnResult ? result : obj;
```

## 七、myInstanceof 原型链查找图解

### 7.1 查找过程可视化

```javascript
// 定义原型链
function Parent() {}
function Child() {}
Child.prototype = Object.create(Parent.prototype);

const child = new Child();

// myInstanceof(child, Child) 查找过程：
child
  ├── __proto__ → Child.prototype
  │                ├── __proto__ → Parent.prototype
  │                │                ├── __proto__ → Object.prototype
  │                │                │                ├── __proto__ → null
  │                │                │                └── 找到了！✅
  │                │                └── 不是 Child.prototype，继续
  │                └── 找到了！✅ 返回 true
  └── 不是 Child.prototype，继续
```

### 7.2 手动模拟查找过程

```javascript
function myInstanceof(obj, Constructor) {
    let proto = Object.getPrototypeOf(obj);
    const targetProto = Constructor.prototype;
    
    // 第1轮：proto = Child.prototype
    // 第2轮：proto = Parent.prototype
    // 第3轮：proto = Object.prototype
    // 第4轮：proto = null → 返回 false
    
    while (proto !== null) {
        if (proto === targetProto) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
```

## 八、边界情况与陷阱

### 8.1 基本类型的 instanceof 行为

```javascript
// 注意：原始值使用 instanceof 会返回 false（除非用包装对象）
console.log(myInstanceof(123, Number));     // false
console.log(myInstanceof('abc', String));   // false
console.log(myInstanceof(true, Boolean));   // false

// 而包装对象可以：
const numObj = new Number(123);
console.log(myInstanceof(numObj, Number));  // true

// 原生 instanceof 也有相同行为：
console.log(123 instanceof Number);   // false
console.log(new Number(123) instanceof Number);  // true
```

### 8.2 跨 iframe 的问题

```javascript
// 注意：不同 iframe 的 Array 构造函数是不同的
// 原生 instanceof 会失效，但我们的 myInstanceof 也会失效
// 解决方案通常用 Array.isArray()
```

### 8.3 修改原型链导致的问题

```javascript
function A() {}
function B() {}

const a = new A();
console.log(myInstanceof(a, A));  // true

// 动态修改原型链
Object.setPrototypeOf(a, B.prototype);
console.log(myInstanceof(a, A));  // false（原型链已改变）
console.log(myInstanceof(a, B));  // true
```

## 九、this 绑定详解

### 9.1 apply 在 myNew 中的作用

```javascript
// 不使用 apply 的话，需要这样写：
function myNewWithoutApply(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype);
    
    // 无法优雅地传递参数，需要手动处理
    Constructor.call(obj, args[0], args[1], args[2]);  // 参数个数固定
    
    return obj;
}

// 使用 apply 可以处理任意数量的参数
function myNewWithApply(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype);
    Constructor.apply(obj, args);  // 自动展开所有参数
    return obj;
}
```

### 9.2 箭头函数作为构造函数的限制

```javascript
// 箭头函数不能作为构造函数
const ArrowFn = () => {
    this.name = 'test';  // this 指向外层，不是新对象
};

try {
    const a = myNew(ArrowFn);
    console.log(a.name);  // undefined，且不会有报错
} catch(e) {
    console.log('箭头函数不能作为构造函数');
}

// 原生 new 会直接报错：
// const a = new ArrowFn();  // TypeError: ArrowFn is not a constructor
```

## 十、完整执行追踪

```javascript
// 追踪 myNew 的完整执行过程
function Dog(name) {
    this.name = name;
    this.bark = function() { return 'Woof!'; };
}

const dog = myNew(Dog, '旺财');

// 执行步骤追踪：
// 1. const obj = Object.create(Dog.prototype)
//    → obj = { __proto__: Dog.prototype }
//    → Dog.prototype 包含 constructor 指向 Dog

// 2. const result = Dog.apply(obj, ['旺财'])
//    → Dog 内部的 this 指向 obj
//    → obj.name = '旺财'
//    → obj.bark = function() { return 'Woof!'; }
//    → 无返回值，result = undefined

// 3. 判断返回值
//    → result === undefined
//    → result !== null && typeof result === 'object' → false
//    → typeof result === 'function' → false
//    → 返回 obj

// 最终 dog = {
//     name: '旺财',
//     bark: [Function],
//     __proto__: Dog.prototype
// }
```

## 十一、常见错误与调试

### 11.1 错误1：忘记处理 null 返回值

```javascript
// 错误写法
function myNewWrong(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype);
    const result = Constructor.apply(obj, args);
    return typeof result === 'object' ? result : obj;  // ❌ null 被错误处理
}

// 正确写法
function myNewCorrect(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype);
    const result = Constructor.apply(obj, args);
    return (result !== null && typeof result === 'object') || typeof result === 'function'
        ? result : obj;
}
```

### 11.2 错误2：原型链查找死循环

```javascript
// 错误写法
function myInstanceofWrong(obj, Constructor) {
    let proto = obj.__proto__;  // ❌ 不推荐直接使用 __proto__
    while (proto) {  // 可能死循环？
        if (proto === Constructor.prototype) return true;
        proto = proto.__proto__;
    }
    return false;
}

// 正确写法（使用标准 API）
function myInstanceofCorrect(obj, Constructor) {
    let proto = Object.getPrototypeOf(obj);
    const target = Constructor.prototype;
    while (proto !== null) {  // 明确终止条件
        if (proto === target) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
```

## 十二、性能优化建议

```javascript
// 1. 对于频繁的类型检查，缓存结果
const checkCache = new WeakMap();
function cachedInstanceof(obj, Constructor) {
    if (checkCache.has(obj)) {
        return checkCache.get(obj);
    }
    const result = myInstanceof(obj, Constructor);
    checkCache.set(obj, result);
    return result;
}

// 2. 避免在热点代码中使用复杂的原型链查找
// 不好
for (let i = 0; i < 10000; i++) {
    if (myInstanceof(arr, Array)) { ... }
}

// 好
const isArray = myInstanceof(arr, Array);
for (let i = 0; i < 10000; i++) {
    if (isArray) { ... }
}
```

## 十三、与原生实现的对比例

| 特性 | 原生 new | myNew |
|------|----------|-------|
| 创建空对象 | 内部实现 | Object.create() |
| 原型链绑定 | 自动完成 | 手动绑定 |
| 执行构造函数 | 自动执行 | apply 调用 |
| 返回值处理 | 有特殊规则 | 模拟规则 |
| 性能 | 极快（C++ 实现） | 较慢（JS 实现） |

| 特性 | 原生 instanceof | myInstanceof |
|------|-----------------|--------------|
| 查找原理 | 沿原型链查找 | 模拟相同逻辑 |
| 右侧要求 | 必须为函数 | 同样检查 |
| 边界处理 | 完善 | 基本完善 |
| 性能 | 极快 | 稍慢 |

## 十四、总结

**记住核心思想：**
- **new**：三步走——创建对象 → 绑定 this 执行构造函数 → 处理返回值
- **instanceof**：一路向上——沿着原型链查找，直到找到或到达 null

**关键知识点回顾：**
- `Object.create()`：一步完成对象创建和原型绑定
- `apply/call`：改变 this 指向，传递参数
- 原型链：对象通过 `__proto__` 连接，形成查找链条
- 返回值处理：只有返回对象/函数时才覆盖默认返回值
- 边界检查：null、undefined、非函数右侧值

**适用场景：**
- ✅ 实现类继承库时
- ✅ 理解 JS 底层机制时
- ✅ 需要跨环境类型检查时（绕过不同全局对象问题）
- ✅ 面试考察 JS 原型链理解时
- ❌ 生产环境直接使用（用原生 new 和 instanceof 更好）
- ❌ 对性能有极致要求的场景

---

**手写 new 和 instanceof 的核心价值在于理解 JavaScript 的原型链机制和对象创建过程，而不是在生产环境中替换原生操作符。**
