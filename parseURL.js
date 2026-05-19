/**
 * 题目：实现 URL 解析函数
 * 要求：
 * 1. 解析 URL 字符串，返回包含各部分的对象
 * 2. 需要解析出：protocol, host, port, pathname, query（对象形式）, hash
 * 3. query 部分需要正确解码
 */

function parseURL(url ){
    const urlObj = new URL(url);

    const query = {};
    for (const [key ,value] of urlObj.searchParams.entries()){
        query[key] = value ;
    }

    return {
        protocol : urlObj.protocol ,
        host : urlObj.host ,
        port: urlObj.port || null ,
        pathname : urlObj.pathname , 
        query : query , 
        hash : urlObj.hash || null 
    };
}

const url = 'https://www.example.com:8080/products/list?name=手机&page=2#top';
const result = parseURL(url);
console.log(result);
