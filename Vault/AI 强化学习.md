# 强化学习
Sutton RLBook
## 第1章 导论
### 1. 马尔可夫过程
![强化学习环境示意图](attachments/Pasted%20image%2020250608103854.png)

例子：TicTacToe
### 2. 早期历史
- 第一条主线是源于动物心理学的试错法
- 第二条主线是关注最优控制问题以及使用价值函数和动态规划的解决方案。
- 第三条主线是时序差分方法。
## 第2章 多臂老虎机
### 一般方法
- 通过价值估计动作的选择，称为”动作-价值方法“
$$A_t \doteq argmax_a Q_t(a)$$
- 设计增量式公式以小而恒定的计算来更新平均值
$$Q_{n+1} = Q_n + \frac1n[R_n-Q_n]$$
	其中$R_n$是第n次的收益
### 具体算法
- 纯贪心、$\epsilon$-贪心
- 乐观初值
- UCB(Upper Confidence Bound)
- 梯度强盗算法
## 第3章 有限马尔可夫决策过程
有限MDP(Markov Decision Procedure)
![[attachments/Pasted image 20251006142310.png]]
