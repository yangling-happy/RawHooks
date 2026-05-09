/**
 * 题目：手写防抖函数 debounce
 * 要求：
 * 1. 在事件被触发 delay 毫秒后再执行回调，如果在这段时间内又被触发，则重新计时
 * 2. 支持 immediate 参数：为 true 时先立即执行一次，后续触发重新计时
 * 3. 返回的函数支持 cancel() 方法取消延迟调用
 */

// 请实现 debounce(fn, delay, immediate)
function debounce(fn , delay , immediate = false ){
    let timer = null ;

    const exec = function (...args){
        const context = this ;

        if (timer) clearTimeout(timer);

        if (immediate && !timer){
            fn.apply(context , args) ;
        }

        timer = setTimeout(() => {
            if (!immediate){
                fn.apply(context ,args );
            }
            timer = null ;
        },delay)
    }

    exec.cancel = () => {
        clearTimeout(timer);
    }

    return exec ;
}

const log = debounce(() => console.log('执行了') , 500);
log()
log()
log()

const logImmediate = debounce(() => console.log('立即执行') , 500) ;
logImmediate()
logImmediate()
