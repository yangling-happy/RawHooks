/**
 * 题目：手写节流函数 throttle
 * 要求：
 * 1. 在一段时间内只允许函数执行一次
 * 2. 分别用时间戳版和定时器版实现
 * 3. 返回的函数支持 cancel() 方法
 */

function throttleTimestamp(fn , delay){
    let lastTime = 0 ;

    const exec = function (...args){
        const now = Date.now() ;
        const context = this ;

        if (now - lastTime >= delay){
            fn.apply(context , args);
            lastTime = now ;
        }
    }

    exec.cancel = () => {
        lastTime = 0 ;
    }

    return exec ;
}

function throttleTimer(fn , delay){
    let timer = null ;

    const exec = function (...args){
        const context = this ;

        if (!timer){
            timer = setTimeout(() => {
                fn.apply(context , args);
                timer = null ;
            },delay)
        }
    }

    exec.cancel = () => {
        if (timer){
            clearTimeout(timer);
            timer = null ;
        }
    }
    return exec ;
}

function throttle(fn ,delay , options = {
    leading :true , trailing:true 
}){
    let timer = null ;
    let lastExecTime = 0 ;
    let lastArgs = null ;
    let lastContext = null ;

    const {leading , trailing } = options ;

    const exec = function (...args){
        const now = Date.now() ;
        lastArgs = args ;
        lastContext = this ;

        if (lastExecTime === 0 && !leading ){
            lastExecTime = now ;
        }

        const remaining = delay - (now - lastExecTime)

        if (remaining <= 0 ){
            if (timer){
                clearTimeout(timer);
                timer = null ;
            }
            fn.apply(lastContext , lastArgs)
            lastExecTime = now ;
            lastArgs = null ;
            lastContext = null ;
        }else if (!timer && trailing){
            timer = setTimeout(() => {
                fn.apply(lastContext , lastArgs);
                lastExecTime = Date.now();
                timer = null ;
                lastArgs = null ;
                lastContext = null ;
            } , remaining)
        }
    }

    exec.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null ;
        }
        lastExecTime = 0 ;
    }
    return exec ;
}

// ---------- 测试用例 ----------
// 时间戳版
const log1 = throttleTimestamp(() => console.log('时间戳版执行', Date.now()), 1000)
log1() // 立即执行
log1() // 1秒内被忽略
setTimeout(() => log1(), 500)  // 被忽略
setTimeout(() => log1(), 1200) // 执行（距离上次超过1秒）

// 定时器版
const log2 = throttleTimer(() => console.log('定时器版执行', Date.now()), 1000)
log2() // 1秒后执行
log2() // 被忽略（已经有计时器）
log2() // 被忽略

// 完整版测试
const log3 = throttle(() => console.log('完整版执行'), 1000, { leading: true, trailing: true })
log3() // 立即执行
log3() // 被忽略
setTimeout(() => log3(), 500)  // 被忽略
setTimeout(() => log3(), 1200) // 执行（距离上次超过1秒）
