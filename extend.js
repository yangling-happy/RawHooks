/**
 * 题目：实现 JavaScript 继承
 * 要求：分别用以下方式实现继承，并说明各自的优缺点
 * 1. 原型链继承
 * 2. 借用构造函数继承
 * 3. 组合继承
 * 4. 寄生组合继承（最优方案）
 * 5. ES6 class 继承
 */

// 定义一个父类（构造函数）
function Animal(name) {
    this.name = name;
    this.colors = ['black', 'white']; // 引用类型属性，用于测试问题
}

// 在父类的原型上添加一个方法
Animal.prototype.sayName = function() {
    console.log(`My name is ${this.name}`);
};

// ==================== 1. 原型链继承 ====================
console.log('========== 1. 原型链继承 ==========');

function Dog() {}
// 核心：子类的原型指向父类的实例
Dog.prototype = new Animal();

// 修复构造函数指向（否则 Dog.prototype.constructor 会指向 Animal）
Dog.prototype.constructor = Dog;

// 添加子类自己的方法
Dog.prototype.bark = function() {
    console.log('Woof!');
};

const dog1 = new Dog();
dog1.name = 'Buddy';
dog1.colors.push('brown');
console.log(dog1.colors); // ['black', 'white', 'brown']

const dog2 = new Dog();
dog2.name = 'Max';
console.log(dog2.colors); // ['black', 'white', 'brown']  ⚠️ 所有实例共享 colors！

dog1.sayName(); // My name is Buddy
dog1.bark();    // Woof!

/*
 * 优点：
 *   - 实现简单，易于理解
 *   - 子类可以访问父类原型上的方法和属性
 *   - 可以复用父类构造函数中的方法
 * 
 * 缺点：
 *   - 引用类型属性（如 colors）会被所有子类实例共享，一个实例修改会影响其他实例
 *   - 无法向父类构造函数传递参数（所有实例的父类属性都是一样的）
 *   - 创建子类实例时无法自定义父类属性的初始值
 */

// ==================== 2. 借用构造函数继承 ====================
console.log('\n========== 2. 借用构造函数继承 ==========');

function Cat(name) {
    // 核心：在子类构造函数中调用父类构造函数，并绑定 this
    Animal.call(this, name);
}

const cat1 = new Cat('Tom');
cat1.colors.push('gray');
console.log(cat1.colors); // ['black', 'white', 'gray']
console.log(cat1.name);   // Tom

const cat2 = new Cat('Jerry');
console.log(cat2.colors); // ['black', 'white']  ✅ 不受 cat1 影响
console.log(cat2.name);   // Jerry

// cat1.sayName();  // ❌ TypeError: cat1.sayName is not a function（无法访问父类原型方法）

/*
 * 优点：
 *   - 解决了原型链继承中引用类型共享的问题
 *   - 可以向父类构造函数传递参数
 *   - 每个子类实例都有独立的父类属性副本
 * 
 * 缺点：
 *   - 无法继承父类原型上的方法（如 sayName），只能继承构造函数中定义的属性
 *   - 方法都在构造函数中定义，无法复用，造成内存浪费
 *   - 子类实例无法访问父类原型链上的方法
 */

// ==================== 3. 组合继承 ====================
console.log('\n========== 3. 组合继承 ==========');

function Bird(name) {
    // 第二次调用 Animal：创建实例属性（name, colors）
    Animal.call(this, name);
}

// 第一次调用 Animal：设置原型链
Bird.prototype = new Animal();
Bird.prototype.constructor = Bird;

// 添加子类自己的方法
Bird.prototype.fly = function() {
    console.log(`${this.name} is flying`);
};

const bird1 = new Bird('Sparrow');
bird1.colors.push('yellow');
console.log(bird1.colors); // ['black', 'white', 'yellow']
console.log(bird1.name);   // Sparrow
bird1.sayName();           // My name is Sparrow
bird1.fly();               // Sparrow is flying

const bird2 = new Bird('Eagle');
console.log(bird2.colors); // ['black', 'white']  ✅ 不受影响
bird2.sayName();           // My name is Eagle

/*
 * 优点：
 *   - 结合了原型链继承和借用构造函数的优点
 *   - 可以继承父类原型上的方法，也拥有独立的实例属性
 *   - 可以向父类传递参数
 *   - 最常用的继承方式之一
 * 
 * 缺点：
 *   - 会调用两次父类构造函数（一次在设置原型时，一次在实例化时）
 *   - 子类原型上会多出一份不必要的父类实例属性（造成内存浪费）
 *   - 虽然实例属性会覆盖原型上的同名属性，但原型上仍然存在这些属性
 */

// ==================== 4. 寄生组合继承（最优方案） ====================
console.log('\n========== 4. 寄生组合继承 ==========');

function Fish(name) {
    // 只调用一次父类构造函数
    Animal.call(this, name);
}

// 核心：使用 Object.create() 创建父类原型的副本，避免调用父类构造函数
function inheritPrototype(subType, superType) {
    // 创建一个空对象，其原型指向 superType.prototype
    const prototype = Object.create(superType.prototype);
    // 修复构造函数指向
    prototype.constructor = subType;
    // 设置子类的原型
    subType.prototype = prototype;
}

inheritPrototype(Fish, Animal);

// 添加子类自己的方法
Fish.prototype.swim = function() {
    console.log(`${this.name} is swimming`);
};

const fish1 = new Fish('Nemo');
fish1.colors.push('orange');
console.log(fish1.colors); // ['black', 'white', 'orange']
console.log(fish1.name);   // Nemo
fish1.sayName();           // My name is Nemo
fish1.swim();              // Nemo is swimming

const fish2 = new Fish('Dory');
console.log(fish2.colors); // ['black', 'white']  ✅ 独立
console.log(fish2.name);   // Dory

console.log(Fish.prototype.constructor === Fish); // true
console.log(fish1 instanceof Animal); // true
console.log(fish1 instanceof Fish);   // true

/*
 * 优点：
 *   - 只调用了一次父类构造函数（解决了组合继承的缺点）
 *   - 原型链上不会有多余的父类实例属性
 *   - 保持了原型链的完整性
 *   - 是 ES5 中最理想的继承方案，也是很多框架（如 YUI）使用的方案
 * 
 * 缺点：
 *   - 实现相对复杂，需要额外的工具函数
 *   - 需要理解 Object.create() 和原型链的细节
 */

// ==================== 5. ES6 class 继承 ====================
console.log('\n========== 5. ES6 class 继承 ==========');

class Mammal {
    constructor(name) {
        this.name = name;
        this.colors = ['black', 'white'];
    }
    
    sayName() {
        console.log(`My name is ${this.name}`);
    }
    
    // 静态方法
    static getClassName() {
        return 'Mammal';
    }
}

class Whale extends Mammal {
    constructor(name, size) {
        // 必须调用 super() 才能使用 this
        super(name);  // 相当于调用父类的构造函数
        this.size = size;
    }
    
    // 重写父类方法
    sayName() {
        super.sayName(); // 调用父类方法
        console.log(`And I'm a whale`);
    }
    
    swim() {
        console.log(`${this.name} is swimming`);
    }
    
    // 静态方法也会被继承
    static getClassName() {
        return super.getClassName();
    }
}

const whale1 = new Whale('Blue', 'huge');
whale1.colors.push('blue');
console.log(whale1.colors);  // ['black', 'white', 'blue']
whale1.sayName();  // My name is Blue \n And I'm a whale
whale1.swim();     // Blue is swimming

console.log(whale1 instanceof Mammal);  // true
console.log(whale1 instanceof Whale);   // true
console.log(Whale.getClassName());      // Mammal

/*
 * 优点：
 *   - 语法简洁清晰，接近传统面向对象语言
 *   - 内部实现就是寄生组合继承，是最优方案的语法糖
 *   - 支持 super 关键字方便调用父类方法
 *   - 支持静态方法继承
 * 
 * 缺点：
 *   - 需要转译（Babel）才能在旧环境运行
 *   - 本质上还是原型链，不是真正的类
 *   - 必须使用 new 调用，不能作为普通函数
 */
