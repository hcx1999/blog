Javascript-tds
# ES6
#### **一、ECMAScript 版本演进**
1. **ES6 (ES2015)**  
   - 里程碑版本，引入块级作用域、箭头函数、解构赋值等核心特性。  
   - 后续版本按年份命名（ES2016、ES2017 等），每年发布新特性。  
2. **相关标准**  
   - ECMA-262（核心语言标准）、ECMA-402（国际化）、ECMA-404（JSON）。  
#### **二、核心新语法**
1. **块级作用域**  
   - `let` 和 `const` 替代 `var`，解决变量提升和闭包循环问题。  
   - 示例：`for (let i=0; i<5; i++) { ... }`。  
2. **解构赋值**  
   - 数组：`const [a, b] = [1, 2]`。  
   - 对象：`const { name, age } = person`，支持重命名 `{ name: n }`。  
3. **箭头函数**  
   - 语法：`(a, b) => a + b`，无 `this`，继承外层上下文。  
   - 适用场景：回调函数、简化代码。  
4. **模板字符串**  
   - 多行文本：使用反引号（`）包裹。  
   - 变量嵌入：`Hello, ${name}!`。  
5. **展开与剩余运算符**  
   - 展开数组：`[...arr1, ...arr2]`。  
   - 剩余参数：`function sum(...nums) { ... }`。  
6. **对象属性简写**  
   - 同名属性简写：`const obj = { name, age }`。  
   - 方法简写：`sayHello() { ... }`。  
#### **三、面向对象与类**
1. **Class 语法**  
   - 定义类：`class Person { constructor() { ... } }`。  
   - 继承：`class Student extends Person { ... }`，`super` 调用父类方法。  
2. **原型链与继承**  
   - 原型对象：`Person.prototype`，`__proto__` 指向原型。  
   - 早期继承：`Student.prototype = new Person()`。  
#### **四、函数与闭包**
1. **闭包（Closure）**  
   - 函数内部函数引用外部变量，形成私有作用域。  
   - 应用：柯里化（Currying）、封装变量。  
   - 示例：`function outer() { let x=0; return () => x++; }`。  
2. **高阶函数**  
   - 函数作为参数或返回值：`map`、`filter`、`reduce`。  
   - 示例：`arr.map(item => item * 2)`。  
3. **this 指向**  
   - 默认指向调用者，可通过 `bind`、`call`、`apply` 改变。  
   - 箭头函数无独立 `this`，继承外层。  
#### **五、内置对象与 API**
1. **字符串与数组**  
   - 字符串方法：`includes()`、`startsWith()`、`padStart()`。  
   - 数组方法：`find()`、`findIndex()`、`flat()`、`flatMap()`。  
2. **集合类型**  
   - `Set`（不重复集合）：`new Set([1,2,3])`。  
   - `Map`（键值对）：`new Map([['key', 'value']])`。  
3. **Promise 与异步**  
   - 解决回调地狱，支持链式调用：`.then().catch()`。  
   - `async/await`（ES2017）：同步写法处理异步。  
#### **六、JSON 与数据交互**
1. **JSON 格式**  
   - 轻量级数据交换，键名需双引号，值可为对象、数组等。  
   - 与 JS 对象区别：JSON 不支持函数、严格语法。  
2. **前后端交互**  
   - `JSON.stringify()` 和 `JSON.parse()` 转换数据。  
#### **七、环境对象（DOM/BOM）**
1. **DOM 操作**  
   - 获取元素：`document.querySelector()`、`getElementById()`。  
   - 事件绑定：`element.addEventListener('click', handler)`。  
2. **BOM 对象**  
   - `window`：全局对象，`innerWidth`、`location`。  
   - `location`：操作 URL，`location.href = '...'`。  
   - `navigator`：浏览器信息，`userAgent`、`platform`。  
#### **八、类型与转换**
1. **类型判断**  
   - `typeof`、`instanceof`、`Object.prototype.toString.call()`。  
2. **相等与全等**  
   - `==`（类型转换后比较） vs `===`（严格类型与值比较）。  
3. **隐式转换规则**  
   - 字符串拼接：`1 + '2' = '12'`。  
   - 布尔转换：`0`、`''`、`null`、`undefined` 为 `false`。  
#### **九、严格模式（Strict Mode）**
- 启用：`'use strict';`。  
- 限制：禁止未声明变量、删除不可删属性、`arguments` 不可重写等。  
#### **十、考点与常见问题**
1. **闭包与循环陷阱**  
   - `var` 在循环中的问题，`let` 解决。  
2. **箭头函数 vs 普通函数**  
   - `this` 绑定差异。  
3. **解构赋值的嵌套应用**  
   - 复杂对象解构：`const { data: { list } } = response`。  
4. **原型链继承问题**  
   - `instanceof` 与 `Object.getPrototypeOf()`。  
5. **类型转换陷阱**  
   - `[] == ![]` 结果为 `true`（因隐式转换）。  
### 总结  
ES6 是 JavaScript 现代化开发的核心，重点掌握块级作用域、箭头函数、解构赋值、Class、Promise 等特性，同时理解原型链、闭包、`this` 指向等底层机制。结合 DOM/BOM 操作和异步编程，能够高效构建复杂应用。

# 考点
html和html5基础的元素，html5语义元素、多媒体、输入
css属性、定位、行为（交互功能）、特殊技巧
