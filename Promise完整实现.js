/**
 * 自定义 Promise 类，用于模拟 ES6 Promise 的核心行为。
 * 支持异步状态管理、链式调用以及错误处理。
 */
class MyPromise {
  /**
   * 构造函数，初始化 Promise 实例并立即执行传入的执行器函数。
   * @param {Function} executor - 执行器函数，接收 resolve 和 reject 两个参数。
   *                             resolve 用于将状态变更为 fulfilled，reject 用于将状态变更为 rejected。
   */
  constructor(executor) {
    this.status = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    /**
     * 将 Promise 状态从 pending 变更为 fulfilled，并执行所有已注册的成功回调。
     * @param {*} value - 成功的结果值。
     */
    const resolve = (value) => {
      if (this.status === "pending") {
        this.status = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach((fn) => fn());
      }
    };

    /**
     * 将 Promise 状态从 pending 变更为 rejected，并执行所有已注册的失败回调。
     * @param {*} reason - 失败的原因或错误对象。
     */
    const reject = (reason) => {
      if (this.status === "pending") {
        this.status = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  /**
   * 注册当 Promise 状态变为 fulfilled 或 rejected 时的回调函数。
   * 返回一个新的 Promise 实例以支持链式调用。
   * @param {Function} onFulfilled - 当 Promise 成功时调用的回调函数。如果非函数，则透传值。
   * @param {Function} onRejected - 当 Promise 失败时调用的回调函数。如果非函数，则抛出错误。
   * @returns {MyPromise} 一个新的 Promise 实例，其状态取决于回调函数的执行结果。
   */
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      // 如果当前 Promise 已经处于 fulfilled 状态，异步执行成功回调
      if (this.status === "fulfilled") {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      // 如果当前 Promise 已经处于 rejected 状态，异步执行失败回调
      } else if (this.status === "rejected") {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      // 如果当前 Promise 仍处于 pending 状态，将回调存入队列等待后续触发
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    });

    return promise2;
  }

  /**
   * 注册当 Promise 状态变为 rejected 时的回调函数。
   * 本质上是 then(null, onRejected) 的语法糖。
   * @param {Function} onRejected - 当 Promise 失败时调用的回调函数。
   * @returns {MyPromise} 一个新的 Promise 实例。
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

/**
 * 解析 Promise 链中的返回值，处理普通值、Promise 对象及 thenable 对象。
 * 遵循 Promise/A+ 规范，确保链式调用的正确性和防止循环引用。
 * @param {MyPromise} promise - 当前 then 方法返回的新 Promise 实例。
 * @param {*} x - onFulfilled 或 onRejected 回调函数的返回值。
 * @param {Function} resolve - 新 Promise 的 resolve 函数。
 * @param {Function} reject - 新 Promise 的 reject 函数。
 */
function resolvePromise(promise, x, resolve, reject) {
  // 检测循环引用：如果返回值 x 与当前 promise 是同一个对象，则抛出类型错误
  if (promise === x) {
    return reject(new TypeError("Chaining cycle detected"));
  }

  // 判断 x 是否为对象或函数（即可能是 thenable 对象）
  if ((x && typeof x === "object") || typeof x === "function") {
    let called = false;
    try {
      const then = x.then;
      // 如果 x 具有 then 方法且为函数，则视为 thenable 对象，尝试展开它
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          },
        );
      } else {
        // 如果 x 是对象但没有 then 方法，则直接作为普通值 resolve
        resolve(x);
      }
    } catch (err) {
      // 如果在获取或调用 then 方法过程中抛出异常，且尚未处理过，则 reject
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    // 如果 x 是普通值（非对象且非函数），直接 resolve
    resolve(x);
  }
}
