# URL 解析函数

## 一、URL 解析是什么？

先理解一个生活场景：你收到一个快递包裹单号 `https://www.example.com:8080/products/list?name=手机&page=2#top`，需要拆解出：用什么快递公司（protocol）、哪个仓库（host）、哪个货架（pathname）、有什么备注（query）、送到哪个具体位置（hash）。

**URL 解析就是：将 URL 字符串拆解成各个组成部分，方便程序分别处理。**

## 二、代码逐行解析

```javascript
/**
 * 题目：实现 URL 解析函数
 * 要求：
 * 1. 解析 URL 字符串，返回包含各部分的对象
 * 2. 需要解析出：protocol, host, port, pathname, query（对象形式）, hash
 * 3. query 部分需要正确解码
 */

function parseURL(url) {
    // 1. 使用 URL API 解析
    const urlObj = new URL(url);
    
    // 2. 解析 query 参数为对象
    const query = {};
    for (const [key, value] of urlObj.searchParams.entries()) {
        // 3. 正确解码（URL API 已经自动解码）
        query[key] = value;
    }
    
    // 4. 返回解析结果
    return {
        protocol: urlObj.protocol,           // 协议
        host: urlObj.host,                   // 主机名（含端口）
        port: urlObj.port || null,           // 端口（默认端口返回null）
        pathname: urlObj.pathname,           // 路径
        query: query,                        // 查询参数对象
        hash: urlObj.hash || null            // 哈希（不含#则返回null）
    };
}

// ---------- 测试用例 ----------
const url = 'https://www.example.com:8080/products/list?name=手机&page=2#top';
const result = parseURL(url);
console.log(result);
// 输出：
// {
//   protocol: "https:",
//   host: "www.example.com:8080",
//   port: "8080",
//   pathname: "/products/list",
//   query: { name: "手机", page: "2" },
//   hash: "#top"
// }

// 测试默认端口
const url2 = 'http://example.com/path?q=hello#section';
console.log(parseURL(url2));
// 输出：
// {
//   protocol: "http:",
//   host: "example.com",
//   port: null,
//   pathname: "/path",
//   query: { q: "hello" },
//   hash: "#section"
// }
```

### 1. 函数签名
```javascript
function parseURL(url)
```
- `url`：要解析的 URL 字符串（如 `'https://example.com/path?name=value#hash'`）

### 2. 使用内置 URL 构造函数
```javascript
const urlObj = new URL(url);
```
- `URL` 是浏览器和 Node.js 内置的 API
- 会自动将 URL 字符串解析成结构化对象
- 自动处理编码解码

### 3. URL API 提供的属性

| 属性 | 说明 | 示例 |
|------|------|------|
| `protocol` | 协议（包含冒号） | `"https:"` |
| `hostname` | 主机名 | `"www.example.com"` |
| `port` | 端口号 | `"8080"` 或 `""` |
| `host` | 主机名+端口 | `"www.example.com:8080"` |
| `pathname` | 路径（以/开头） | `"/products/list"` |
| `search` | 查询字符串（含?） | `"?name=手机&page=2"` |
| `searchParams` | 查询参数对象 | `URLSearchParams` 实例 |
| `hash` | 哈希（含#） | `"#top"` |

### 4. query 参数解析

```javascript
const query = {};
for (const [key, value] of urlObj.searchParams.entries()) {
    query[key] = value;
}
```

#### 为什么用 `searchParams.entries()`？
- 自动处理 URL 编码（`%E6%89%8B%E6%9C%BA` → `手机`）
- 正确处理重复的 key（如 `?a=1&a=2`）
- 比手动 split 更可靠

#### 等价写法：
```javascript
// 方法1：使用 for...of
for (const [key, value] of urlObj.searchParams) {
    query[key] = value;
}

// 方法2：使用 Object.fromEntries
const query = Object.fromEntries(urlObj.searchParams);

// 方法3：手动遍历
urlObj.searchParams.forEach((value, key) => {
    query[key] = value;
});
```

## 三、API 详解

| API | 作用 | 示例 |
|-----|------|------|
| `new URL(url)` | 解析 URL 字符串 | `new URL('https://example.com')` |
| `url.searchParams` | 获取查询参数对象 | `url.searchParams.get('name')` |
| `searchParams.entries()` | 获取所有参数的迭代器 | `for(const [k,v] of params) {}` |
| `decodeURIComponent()` | 解码 URL 编码的字符串 | `decodeURIComponent('%E6%89%8B')` → `"手"` |

## 四、URL 各组成部分图解

```
https://www.example.com:8080/products/list?name=手机&page=2#top
└─┬─┘ └──────┬──────┘└┬┘ └─────┬─────┘ └───────┬───────┘ └┬┘
  │          │        │        │              │          │
protocol   host     port    pathname        query      hash
```

## 五、手动实现（不依赖 URL API）

```javascript
function parseURLManual(url) {
    // 1. 解析协议
    let protocol = null;
    let remaining = url;
    const protocolMatch = url.match(/^([a-z][a-z0-9.+-]*:)/i);
    if (protocolMatch) {
        protocol = protocolMatch[1];
        remaining = url.slice(protocol.length);
    }
    
    // 2. 解析 host/port（跳过 //）
    let host = null;
    let port = null;
    if (remaining.startsWith('//')) {
        remaining = remaining.slice(2);
        const slashIndex = remaining.indexOf('/');
        const hostPart = slashIndex === -1 ? remaining : remaining.slice(0, slashIndex);
        remaining = slashIndex === -1 ? '' : remaining.slice(slashIndex);
        
        // 分离 host 和 port
        const colonIndex = hostPart.lastIndexOf(':');
        if (colonIndex !== -1) {
            host = hostPart.slice(0, colonIndex);
            port = hostPart.slice(colonIndex + 1);
        } else {
            host = hostPart;
            port = null;
        }
    }
    
    // 3. 解析 pathname
    let pathname = '';
    let hashIndex = remaining.indexOf('#');
    let queryIndex = remaining.indexOf('?');
    
    const pathEnd = Math.min(
        hashIndex === -1 ? Infinity : hashIndex,
        queryIndex === -1 ? Infinity : queryIndex
    );
    pathname = pathEnd === Infinity ? remaining : remaining.slice(0, pathEnd);
    pathname = pathname || '/';
    remaining = remaining.slice(pathname.length);
    
    // 4. 解析 query
    const query = {};
    if (remaining.startsWith('?')) {
        remaining = remaining.slice(1);
        const queryEnd = remaining.indexOf('#');
        const queryString = queryEnd === -1 ? remaining : remaining.slice(0, queryEnd);
        remaining = queryEnd === -1 ? '' : remaining.slice(queryEnd);
        
        if (queryString) {
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
                }
            });
        }
    }
    
    // 5. 解析 hash
    let hash = null;
    if (remaining.startsWith('#')) {
        hash = remaining;
    }
    
    return { protocol, host, port, pathname, query, hash };
}
```

## 六、手动实现逐行解析

### 1. 解析协议
```javascript
const protocolMatch = url.match(/^([a-z][a-z0-9.+-]*:)/i);
// 正则说明：
// ^        - 从开头匹配
// [a-z]    - 协议名首字母必须是字母
// [a-z0-9.+-]* - 后面可以是字母、数字、.、+、-
// :        - 以冒号结尾
// /i       - 不区分大小写

// 示例：
// 'https://...'  → 匹配 'https:'
// 'http://...'   → 匹配 'http:'
// 'file://...'   → 匹配 'file:'
```

### 2. 解析主机和端口
```javascript
if (remaining.startsWith('//')) {
    remaining = remaining.slice(2);  // 跳过 '//'
    const slashIndex = remaining.indexOf('/');
    const hostPart = slashIndex === -1 ? remaining : remaining.slice(0, slashIndex);
    // hostPart = 'www.example.com:8080' 或 'www.example.com'
    
    const colonIndex = hostPart.lastIndexOf(':');  // 用 lastIndexOf 因为 IPv6 地址包含冒号
    if (colonIndex !== -1) {
        host = hostPart.slice(0, colonIndex);
        port = hostPart.slice(colonIndex + 1);
    } else {
        host = hostPart;
        port = null;
    }
}
```

### 3. 解码 query 参数
```javascript
// 为什么需要解码？
const encoded = '%E6%89%8B%E6%9C%BA';  // URL 编码的"手机"
console.log(decodeURIComponent(encoded));  // '手机'

// 手动解码示例：
function decodeQueryString(str) {
    return str.replace(/%[0-9A-Fa-f]{2}/g, match => {
        return String.fromCharCode(parseInt(match.slice(1), 16));
    });
}
```

## 七、边界情况处理

### 7.1 没有端口
```javascript
parseURL('https://example.com/path');
// port: null  （而不是空字符串）
```

### 7.2 没有 pathname
```javascript
parseURL('https://example.com');
// pathname: '/'  （而不是空字符串）
```

### 7.3 没有 query
```javascript
parseURL('https://example.com/path#hash');
// query: {}  （空对象）
```

### 7.4 没有 hash
```javascript
parseURL('https://example.com/path?q=1');
// hash: null
```

### 7.5 特殊字符
```javascript
const url = 'https://example.com/?name=%E5%BC%A0%E4%B8%89&msg=hello%20world';
const result = parseURL(url);
// query: { name: "张三", msg: "hello world" }
```

### 7.6 重复的 query 参数
```javascript
const url = 'https://example.com/?tag=js&tag=ts&tag=react';
const result = parseURL(url);
// query: { tag: "react" }  ← 后面的覆盖前面的

// 如果需要保留所有值：
const query = {};
for (const [key, value] of urlObj.searchParams) {
    if (query[key]) {
        query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key], value];
    } else {
        query[key] = value;
    }
}
// 结果：{ tag: ["js", "ts", "react"] }
```

## 八、URL API vs 手动实现

| 特性 | URL API | 手动实现 |
|------|---------|----------|
| 代码量 | 少（~10行） | 多（~80行） |
| 可靠性 | 高（浏览器原生） | 中（可能有bug） |
| 性能 | 快 | 较慢 |
| 兼容性 | IE不支持 | 全兼容 |
| 编码处理 | 自动 | 需手动 |
| IPv6 支持 | 是 | 复杂 |

**推荐：优先使用 URL API，需要兼容 IE 时使用手动实现或 polyfill。**

## 九、完整测试用例

```javascript
// 测试函数
function testParseURL() {
    // 1. 完整 URL
    const url1 = 'https://www.example.com:8080/path/to/page?name=张三&age=18#section';
    console.log(parseURL(url1));
    // 预期：protocol: "https:", host: "www.example.com:8080", port: "8080"
    //       pathname: "/path/to/page", query: { name: "张三", age: "18" }, hash: "#section"
    
    // 2. 无端口
    const url2 = 'http://example.com/api/users';
    console.log(parseURL(url2));
    // 预期：port: null
    
    // 3. 无 pathname
    const url3 = 'https://example.com';
    console.log(parseURL(url3));
    // 预期：pathname: "/"
    
    // 4. 只有协议和域名
    const url4 = 'ftp://files.example.com';
    console.log(parseURL(url4));
    // 预期：protocol: "ftp:", host: "files.example.com"
    
    // 5. 特殊编码
    const url5 = 'https://example.com/?msg=%E4%BD%A0%E5%A5%BD&space=a%20b';
    console.log(parseURL(url5));
    // 预期：query: { msg: "你好", space: "a b" }
    
    // 6. 空 query
    const url6 = 'https://example.com/path?';
    console.log(parseURL(url6));
    // 预期：query: {}
    
    // 7. 多个相同参数
    const url7 = 'https://example.com/?id=1&id=2&id=3';
    console.log(parseURL(url7));
    // 预期：query: { id: "3" }
}

testParseURL();
```

## 十、实际应用场景

### 10.1 路由参数解析
```javascript
function getRouteParams(url) {
    const { pathname, query } = parseURL(url);
    const pathParts = pathname.split('/').filter(Boolean);
    return { pathParts, query };
}

// 使用
const { pathParts, query } = getRouteParams('/users/123/posts?page=2');
// pathParts: ['users', '123', 'posts']
// query: { page: '2' }
```

### 10.2 构建请求参数
```javascript
function buildRequest(url) {
    const { protocol, host, pathname, query } = parseURL(url);
    return {
        baseURL: `${protocol}//${host}`,
        path: pathname,
        params: query
    };
}
```

### 10.3 修改 URL 参数
```javascript
function updateQueryParam(url, key, value) {
    const { protocol, host, port, pathname, query, hash } = parseURL(url);
    query[key] = value;
    const queryString = Object.entries(query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    return `${protocol}//${host}${port ? ':' + port : ''}${pathname}?${queryString}${hash || ''}`;
}
```

## 十一、常见错误与调试

### 11.1 错误1：忘记处理默认端口
```javascript
// 错误
port: urlObj.port  // 默认端口返回空字符串 ""

// 正确
port: urlObj.port || null  // 统一返回 null
```

### 11.2 错误2：手动解析时忘记解码
```javascript
// 错误
query[key] = value;  // 得到 "%E5%BC%A0%E4%B8%89"

// 正确
query[decodeURIComponent(key)] = decodeURIComponent(value);  // 得到 "张三"
```

### 11.3 错误3：IPv6 地址解析错误
```javascript
// IPv6 地址包含冒号，不能用 split(':') 简单分割
const ipv6Url = 'http://[2001:db8::1]:8080/path';
// 正确做法：用 lastIndexOf(':') 找最后一个冒号
const colonIndex = hostPart.lastIndexOf(':');
```

## 十二、性能优化建议

```javascript
// 1. 缓存解析结果（如果同一个 URL 多次使用）
const urlCache = new Map();
function parseURLWithCache(url) {
    if (urlCache.has(url)) return urlCache.get(url);
    const result = parseURL(url);
    urlCache.set(url, result);
    return result;
}

// 2. 懒解析（需要时才解析）
class URLParser {
    constructor(url) {
        this._url = url;
        this._parsed = null;
    }
    get parsed() {
        if (!this._parsed) this._parsed = parseURL(this._url);
        return this._parsed;
    }
}

// 3. 避免重复创建 URL 对象
// 不好
function getQuery(url, key) {
    return new URL(url).searchParams.get(key);  // 每次都创建
}

// 好
const urlObj = new URL(url);
function getQuery(key) {
    return urlObj.searchParams.get(key);
}
```

## 十三、总结

**记住核心思想：URL 解析就是将字符串拆解成 protocol、host、port、pathname、query、hash 六个部分。**

**关键知识点回顾：**
- URL API：最可靠的解析方式
- searchParams：自动处理编码的 query 参数
- 解码：`decodeURIComponent()` 处理特殊字符
- 端口：默认端口（80/443）返回 null
- 边界：处理好空值情况（pathname、query、hash）

**适用场景：**
- ✅ 前端路由解析
- ✅ API 请求参数处理
- ✅ 链接分享功能
- ✅ 爬虫 URL 分析
- ❌ 需要修改 URL 的场景（用 URL API 的 setter）
- ❌ 极老浏览器兼容（需要 polyfill）

## 十四、Node.js 环境注意事项

```javascript
// Node.js 中使用 URL API（内置）
const { URL } = require('url');  // Node.js v10+ 也可直接使用 global.URL

// 或使用 querystring 模块解析 query
const querystring = require('querystring');
function parseURLNode(url) {
    const urlObj = new URL(url);
    return {
        protocol: urlObj.protocol,
        host: urlObj.host,
        port: urlObj.port || null,
        pathname: urlObj.pathname,
        query: querystring.parse(urlObj.search.slice(1)),
        hash: urlObj.hash || null
    };
}
```
