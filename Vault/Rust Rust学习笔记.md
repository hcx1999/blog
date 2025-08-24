# Rust学习笔记
## 数据类型
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
