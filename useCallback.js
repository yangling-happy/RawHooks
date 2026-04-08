// React 内部每个组件维护一个“记忆状态链表”
let currentlyRenderingComponent = {
  memoizedState: null, // 指向第一个 Hook 的节点
  nextHookIndex: 0
};

function useCallback(callback, deps) {
  // 1. 获取当前 Hook 对应的“旧节点”
  const hook = currentlyRenderingComponent.memoizedState; 
  
  if (hook === null) {
    // 首次渲染：直接存储 callback 和 deps
    const newHook = {
      memoizedState: callback,   // 存储函数
      next: null,
      deps: deps                 // 存储依赖数组
    };
    currentlyRenderingComponent.memoizedState = newHook;
    return callback;
  } else {
    // 更新阶段：对比依赖
    const prevDeps = hook.deps;
    const prevCallback = hook.memoizedState;
    
    // 2. 逐个比较依赖（使用 Object.is）
    let depsAreEqual = true;
    if (prevDeps === null) depsAreEqual = false;
    else {
      for (let i = 0; i < deps.length; i++) {
        if (!Object.is(prevDeps[i], deps[i])) {
          depsAreEqual = false;
          break;
        }
      }
    }
    
    // 3. 如果依赖没变，返回旧函数；否则更新并返回新函数
    if (depsAreEqual) {
      return prevCallback;
    } else {
      hook.memoizedState = callback;
      hook.deps = deps;
      return callback;
    }
  }
}
