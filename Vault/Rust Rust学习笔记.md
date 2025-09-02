# Rust学习笔记
## 1. 数据类型
### 定宽数据类型
12种定宽数据类型：
size_of函数：`use std::mem`，`mem::size_of::<isize>()`
### 指针
三种基本指针类型：Reference、Box、Raw Pointer
#### Reference
使用`std::ptr`
可以用`ptr::eq(p1, p2)`来比较两个指针的地址是否相等。
去引用`*`、只读引用和可变引用
#### Box
栈、堆
#### Raw Pointers
## 所有权转移
![[attachments/Pasted image 20250826164900.png]]
## 2. 引用
### Reference
Shared Reference和Mutable Reference
自动dereference和自动reference（`.`操作符）
引用的赋值、多层引用、引用的比较（比大小必须是同样层数。比较是否相等用`==`比较的是被引值，用`std::ptr::eq(p1, p2)`比较的是引用本身）、空引用
此外，Rust支持在表达式上创造引用，并维护其生命周期
![[attachments/Pasted image 20250828174507.png]]
**对Slice的引用：**
![[attachments/Pasted image 20250828174559.png]]
### 引用的安全性
生命周期的约束：
- 引用的生命周期不能超过本体。
- &x被赋值给变量r后&x的周期不能小于r的周期。
即：`x >= &x >= r`，如果矛盾则触发编译错误。
此外，Rust在计算一个引用的生命周期(Lifetime)时，会尽可能取较小的值。
### 函数返回引用
1. 正常情况
![[attachments/Pasted image 20250829024723.png]]
![[attachments/Pasted image 20250829024509.png]]
![[attachments/Pasted image 20250829032240.png]]
## 3. 表达式
- 代码块可以看作表达式
- match expr
- 支持复合运算符+=，不支持自增自减，不支持连续赋值
- 显示类型转换使用as关键字，隐式转换需要符合一定条件。
## 4. 错误处理
![[attachments/Pasted image 20250829125701.png]]
具体的太复杂了，用到再看ppt吧。
## Crates and Modules
## 结构体
### NFS、TLS、ULS
- Named-Field Struct
	不同属性可以有不同的可见性，缺省为private。
	所有权可以被部分转移。
	可以用缺省值表达式`.. EXPR`
- Tuple-Like Struct
	也可以理解为Named Tuple.
- Unit-Like Struct
	也可以理解为Named 0-Tuple
### impl语句
可以通过impl代码块在Struct上添加/附着方法。
self和Self语法糖，以及`.`运算符的自动类型判断。
![[attachments/Pasted image 20250831154315.png]]
### 结构体中的生命周期参数
占坑待填。。。
## Enum
