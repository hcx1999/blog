JavaScript语言
# 01 JavaScript语言基础
变量->值->类型
“JavaScript没有类型”严格来说是错误的，因为虽然变量没有类型，但是值是有类型的。
## 类型
JavaScript语言有八种类型
undefined null NaN
一些细节：
- 任何变量在未赋值的时候是undefined
- 将null赋给变量之后变量的typeof会变成object
- 判断相等可以使用Math.abs(0.1+0.2-0.3) <Number.EPSILON，后者是$2^{-52}$
- NaN是number类型的特殊数值，它不与任何值相等，包括自己，只能用isNaN()方法进行判断，特殊的number还有Infinity，+0，-0（相等判断中，正负零相等）
- isSafeInteger判断的范围是$(-2^{53}, 2^{53})$
- 一个string类型的值在声明后值不再发生变化，所有的操作都是在新的空间中进行的（这是所有primitive type的特性：immutable，除了object以外的7种类型都是primitive type）
- object类型的key只能是string和symbol
- 语法糖：data property & accessor property
- `let obj = Object.create(proto)`中，proto是obj的原型(prototype)。（忒修斯之船）
- accessor property中成了精的局部变量：本质上是一种闭包。
另一种分类方法：将类型分为真假：undefined、null、false、''（空字符串）、+0、-0、NaN为假，其他为真（特别的，`let a = new Boolean(false)`也为真，因为它本质上还是object）
## Built-in Object
### constructor
一个function或一个constructor一定是一个object（像Boolean，String这些还是Built-in Object），一般可以使用`let a = new Boolean(false)`等价于`let a = Object(false)`来把原子类型的值封装在object中，此外，直接使用`let b = Boolean(true)`会被识别成强制类型转换而不是手动封装
### Array
使用`const a = new Array(3)`创建数组时是一个边界行为，实际上创建了一个长度为3每个元素都为空的空数组而不是`[3]`。
### Function
##### 作用域：
文件作用域、函数作用域、代码块作用域
特别的，同一作用域内可以先调用后声明，只需在同一作用域内即可。这也体现了JavaScript是一个带有轻量级编译的解释型语言。
有一个技术叫JIT，Just in Time，是解释器将经常调用的一个函数直接编译到二进制编码里面去。
##### 函数表达式：
- 函数名可选，如果使用函数名，作用域只有函数本身的内部。
- 作为property放在object里面有语法糖。
##### 箭头函数：
箭头指向表达式或代码块，当参数数量为1时可省略括号。
##### 特殊行为：
对function object进行typeof时返回的时'function'，但function本质上是object
##### Global Object
不是function也不是construction，但是是一个object。
每使用一个未声明的变量会自动变成一个global object的property，可以用`"use strict";`来取消这一特性。
## Prototype
![[attachments/Pasted image 20250421173342.png]]
对于Data property，其读取行为会在原型链上反向传播，直到遇到一个相同key的property，但设置行为不会传播。（改变一个变量所引用的值的行为称为设置行为）；但对于Accessor property，其读取行为和设置行为都会在原型链上反向传播。

这里ppt上有一个有关继承的例子，有空可以看一下。
## typeof
typeof也有一个很奇怪的操作，就是直接`typeof a`（a未定义）不会报错，只会返回undefined，但是要是再在作用域内部typeof的后面写一行`let a = ...`就会报错`a is not defined`。
# 02 Function
### 带记忆的函数
可以使用property实现带记忆的函数
**TODO：memoize函数！（注意拼写！）**
可以将一个参数的函数转换成带有记忆的函数。
### 不定长参数
1. **rest参数**：是在参数名称之前加三个点，得到的参数是一个数组。
2. **隐式参数arguments**：用法是`arguments[i]`，但是他不是数组，不能直接使用foreach等方法，可以用`Array.from()`方法把他变成数组之后使用（ES6之后）。arguments只记录用户传入的，不记录默认值。
3. **spread操作符**：与rest操作相反，再调用函数时在数组前面加三个点，将数组中的所有元素作为多个参数传入函数。
> **箭头函数**是一种轻量级的函数，里面没有arguments数组，在箭头函数内部使用的arguments数组实际上是外层函数的arguments。

> arguments不是原生数组而是一个object，将其转化为数组可以使用`Array.from()`，或者用`[].slice.call(arguments)`
### 函数的四种调用方式：
主要为函数上下文（function context）的不同。
#### 1. invoke as a function
严格模式下，this为undefined，不会有什么影响
否则this为global object，可能会有影响
#### 2. invoke as a method
通过this能访问到调用它的对象。
#### 3. invoke as a constructor
如果使用new，创建对象并返回即可。如果不使用new，如果返回的是对象就自动new，否则在strict模式下会报错，在正常模式下会在global object中创建元素。
还可以通过new.target变量判断是否使用了new。如果使用了会指向函数本身（即new后面的函数），否则指向undefined。从而有
```js
function f(...){
	if(new.target === undefined){
		return new f(...)
	}
	solve...
}
```
**命名约定：** 构造函数使用首字母大写的名词，普通函数使用首字母小写的动词。
#### 4. invoke with the apply or call method
一种可以指定函数上下文的方法，定义在Function.prototype中，因此所有函数都可以通过原型链访问他们。同理，手动断开原型链也会导致这些方法无法使用。
![[attachments/Pasted image 20250422171543.png]]
**bind方法**：通过`f.bind(thisArg, ...args)`可以将this固定为thisArg永远不变。
**main function**：main function的prototype就是全局变量Object的prototype。
**例外**：箭头函数没有自己的this, arguments, new.target，也不能作为构造函数被调用。
## 闭包(Closure)
每个函数在被创建的同时就有一个闭包被创建，用传值的方式包含了所有函数当前能访问的量。
具体实现方式：函数运行上下文(Function Excution Context)和词法环境(Lexical Enviorment)
- 每次函数被创建时会创建一个新的Function Excution Context，结束后被丢弃，并以栈的形式储存。
- Lexical Enviorment记录了从标识符到值的映射关系，程序员无法访问。与作用域(Scope)是同义词。
**代码块**是使用花括号围成的区域，以闭包的形式存储在栈中。
**词法环境(Lexical Envoriment)链**与原型链是JavaScript中非常重要的两个链式关系。
> 特别的，在一个代码块开始之前，编译器会先把所有的声明变量扫描一遍放在TDZ中，然后执行时每到一个let就释放一个变量，这意味着即使统一代码块的后面要声明的变量在前面使用了也会报错而不是自定义全局变量，因为这个变量名已经存在于TDZ中了。
# 03 Object
### 获取object的property
一般来说用in操作符。如果不想去原型链上查找，可以用`obj.hasOwnProperty(prop_key)`。获取全部的property可以用`Object.getOwnPropertyNames(obj)`和`Object.getOwnPropertySymbols(obj)`来得到property数组。
### property的无糖写法
#### data property的无糖写法：
`obj["age"] = 28;`就等价于
```javascript
Object.defineProperty(obj, "age", {
    value: 28,
    writable: true,
    configurable: true,
    enumerable: true
});
```
严格模式下不可对只读的property赋值，但是普通模式下可以，很逆天。
#### accessor property的无糖写法：
```javascript
const Person = function(name) {
    let my_age = 18;
    return {
        name,
        get age() { return my_age; },
        set age(v) {
            if (v < 0) throw new Error("negitive age");
            my_age = v;
        }
    };
};
```
就等价于
```javascript
const Person = function(name) {
    let age = 18;
    Object.defineProperty(this, "name", {
        get: () => name, // 没有 setter
        configurable: true,
        enumerable: true
    });
    Object.defineProperty(this, "age", {
        get: () => age,
        set: (v) => {
            if (v < 0) throw new Error("Negtive age");
            age = v;
        },
        configurable: true,
        enumerable: true
    });
};
```
这里注意accessor property不能直接将age属性和set_age()函数同时写在obj中，因为此时修改age时默认使用age属性而非set_age()函数。
此外，value/writable和set/get属性互斥，如果同时赋值会导致运行时错误，但如果后期赋值居然会导致动态改变property的类型(?)离大谱。
此外，对于无糖写法来说，可以使用`Object.defineProperties(obj, {properties})`来一次定义多个property.
### property descriptor

每个property一个key和4个property descriptor，其中configurable和enumerable都有，data property还多了value和writable，accessor property还多了get和set。
 - `Object.getOwnPropertyDescriptor(obj, prop_key)`可以获取 `obj` 上 `key` 为 `prop_key` 的 property descriptor 的信息；
 - `Object.defineProperty(obj, prop_key, prop_des)`可以在 `obj` 上定义一个新的 property 或 修改 `obj` 上已经存在的 property 的 descriptor（缺省是一个data property），property类型可以通过这个方法动态改变。
#### configurable
设为false时只能进行两种修改：将writable从true改为false或在writable为true时修改value。
#### enumerable
for-in循环语句：对一个object**及其原型链**中满足两个条件的key进行遍历：该property的enumerble为true、key的类型为string。
### iterable object
**for-of循环语句**：具有一个key为Symbol.iterator的property（Symbol.iterator是ES定义的一个well-known symbol），其value是一个function，调用这个funciton会返回一个iterator。一个iterator是一个object，有一个next方法，返回一个object。返回的object里面有两个属性：done和value，分别表示是否已经遍历了所有值和当前遍历到的值。其中done默认为false，value只在done为false时有意义。for-of循环语句也是一种语法糖。
**spread操作符**：通过在数组前面加`...`将数组转化为一组元素，可以用在任何iterable object上。
![[attachments/Pasted image 20250620014621.png]]
### class
使用原型链模拟面向对象语言中的类与类之间的扩展/继承关系。
具体的，使用对象构造函数模拟其他语言中的类，对象属性中有一个const同名函数属性模拟constructor构造函数，有一个Object.defineProperties()函数模拟class中的其他函数。
class中还有accessor property和静态方法。
可以用computed member names定义成员。
还有class expression可以定义匿名类，还是太开放了。
class的重要优点是更方便的使用extends了，子类构造函数必须先调用super。
### Object上的方法
- `Object.create(proto, properties)`
- `Object.assign()`
- `Object.preventExtensions()`和`Object.isExtensible`
- `Object.seal()`
- `Object.freeze()`
### Collections
用于对一组值进行存储、管理、变换操作的built-in objects
#### Array
- `push() pop() shift() unshift()`
- `splice(start, deleteCount, ...items)`删除一部分，用...items代替
- `silce(start, end)`左闭右开
- `arr.forEach((v, k, o) => {console.log(v, k, o == arr)})`v是元素，k是下标，o是数组arr本身
- `map()`返回数组
- `filter()`参数为lambda表达式，返回参数返回值为true的元素
- `reduce()`很迷惑，似乎可用于求和或取最值，意思是将数组浓缩成一个值
- `sort()`注意返回值不是true和false而是大于0的值和小于0的值
- `every() some()`参数为回调函数
- `find() indexOf() lastIndexOf()`不存在返回-1，还有`findIndex()`参数为函数
需要使用定长数组（如桶）的情况下使用`let arr: number[] = new Array(MAXN)`会导致arr中充满undefined，进行运算则得到NaN。为了方便可以使用TypedArray：
#### TypedArray
一、有哪些类型
- 整数（8/16/32 位）
    - Int8Array, Uint8Array, Uint8ClampedArray
    - Int16Array, Uint16Array
    - Int32Array, Uint32Array
- 浮点
    - Float32Array, Float64Array
- 大整数（元素为 bigint）
    - BigInt64Array, BigUint64Array
二、核心特性
- 固定长度、连续内存、默认值全为 0（Float 型是 +0）。
- 不能 push/pop/shift/unshift/splice；长度不可变。
- 下标越界不会增长，写入被忽略；读取得到 undefined。
- 值会被类型强制：例如 Uint8Array 只保留 0..255（Clamped 会夹紧，普通 Uint 溢出取模）。
- 适合做计数/直方图/数值计算/二进制数据处理。
#### Map
同样的`(v, k, o) => {...}`，这个设计还挺好玩的
#### Set
无重复、有序
构造函数接受的参数是数组。
并集：`const u = new Set{ [...s1, ...s2] };`
交集：`const v = new Set{ [...s1].filter(v => s2.has(v)) };`
### Destructing
赋初值、赋值都可以使用析构操作更方便的赋值。缺省√，变量重命名√，
析构赋值表达式得到的是等号右边的式子的值。
数组析构
### `?.`操作符
通常与`.`有相同的行为，区别在于对象为null或undefined时使用`.`会抛出异常，而使用`?.`会返回undefined。
> 此外，此处应当说明js和ts语言钟in和of的区别。简单讲in去的是键of取的是值。对于数组来说应该使用of，使用in并不是1..n，而是奇怪的字符串索引，容易发生意想不到的隐式转化。
# 04 Type Conversion

# 05 JS中的模块化机制
四个关键词：分解（Decomposition）、封装（Encapusulation）、接口（Interface）、复用（Reuse）
两个模块化机制：CJS和ESM，分别用扩展名.cjs和.mjs来表示
## CJS
### module.exports
### require
同一模块不会加载两次，支持循环加载。
`require.main`指向当前应用的入口模块
## ESM
### export
### import
按照模块名称判断是否重复加载，因此支持循环加载。
`import.meta.url`获取当前模块地址
## Web环境中的JavaScript
TODO
# 06 Web页面编程深入
## document对象
- `getElementById() getElementsByTagName() getElementsByClassName()`
- `obj.querySelector(selector_str) obj.querySelector(selector_str)`通过CSS选择器定位
- `element.getAttribute() element.setAttribute() element.textContent()`
- `document.createElement() p.appendChild() p.insertBefore()`
- `styles = window.getComputedStyle(element) value = styles.getPropertyValue(str)`
## Web页面事件处理
`window.setTimeOut(func, delay) window.setInterval(func, delay)`
更多：TODO
# 07 JS异步程序设计
to be done...