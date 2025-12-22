# 计算神经科学
## 一、神经元
### 1. 神经元生理结构
如高中生物所讲，神经元有静息态和激活态两种状态。
对于静息状态，可以用Nernst方程和Goldman方程定量描述粒子运动和静息膜电位。
**Nernst方程**
$$E_{ion} = \frac{RT}{zF}ln\frac{[ion]_{out}}{[ion]_{in}}$$
**Goldman方程** 
![[attachments/Pasted image 20251128144308.png]]
对于激活状态，可以用以下这个图像来大致描述神经元传递信息的过程，以及神经元的被动电特性和主动点特性。
**神经元传递信息** 
![[attachments/Pasted image 20251128144835.png]]
从图中可以看出神经元还具有绝对不应期和相对不应期，信号在绝对不应期不产生动作电位，在相对不应期不容易产生动作电位。
### 2. 神经元的生物物理模型
![[attachments/Pasted image 20251128103035.png]]
#### Leaky Integrate-and-fire Model(LIM)
LIM模型是一种现象学模型，隶属于Integrate-and-Fire (I&F) 家族。这类模型侧重于重现动作电位的发放时间，而不详细描述其上升和下降的波形。
LIF模型将神经元抽象成一个电容-电阻构成的回路，其中电容代表磷脂双分子层构成的细胞膜，电子代表离子通道。这样我们就可以根据基尔霍夫电流定律列出膜电位($u-u_{rest}$)和输入电流$I(t)$的方程：$I(t)=I_C+I_R=C\frac{d}{dt}u+\frac{u-u_{rest}}{R}$，化简得到$\tau\frac{d}{dt}u=-(u-u_{rest})+RI(t)$，其中$\tau=RC$被称**时间常数**，描述了膜充放电的速度，更大的$\tau$说明膜充放电更慢。设$V=(u-u_{rest})$则$\tau\frac{d}{dt}V=-V+RT(t)$。
![[attachments/Pasted image 20251129194132.png]]
再加上一个阈值$\theta$就成为了完整的LIF模型。具体来说，如果膜内外电压超过了阈值，膜电压就会快速重置，并向外发出一个脉冲电流(fire+reset)。
![[attachments/Pasted image 20251130111252.png]]
![[attachments/Pasted image 20251130111337.png]]
数值方法求解：用差分近似微分。
**非线性LIF(NLIF)：Quadratic I&F(QIF)与 Exponential I&F(EIF)**
NLIF的一般写法：$\tau\frac{du}{dt} = F(u) + R I(t)$
其中 $F(u)$ 是与膜电位有关的非线性函数。发放规则仍为达到某（可能无固定）值触发并重置。
**二次积分发放IF(QIF)**
一般形式：$\tau\frac{du}{dt} = c_2(u - c_1)^2 + c_0$
（参数化取决于约化与无量纲化）。二次模型能产生发放临界行为（临界点分岔）而非 LIF 的固定阈值；QIF 在某些动力学特征上能更好地模拟生理神经元的兴奋性。课件给出二次多项式表达式（可写为 $F(u)=\frac{1}{12}(u-c)^2+\dots$ 形式。
**指数积分发放IF(EIF)**
一般形式：$\tau\frac{du}{dt} = -(u - u_{rest})^2 + c_0\exp(u-\theta)$
指数模型更接近真实生理数据，常被用于做仿真；二次模型更容易数值计算，常被用于模拟。
#### Hodgkin-Huxley Model(HH模型)
**"我们试图用物理和化学原理来解释生物学现象，这是科学方法在生物学中的胜利。"**(霍奇金，于1963诺贝尔奖演讲)
**主要方程**
$$
C_m \frac{dV}{dt} = -I_{Na} - I_K - I_L + I_{ext}(t)
$$
其中：
- $C_m$：膜电容（单位：μF/cm²）
- $I_{ext}(t)$：外部注入电流（单位：μA/cm²）
- $I_{Na}, I_K, I_L$：分别为钠电流、钾电流和泄漏电流
**离子电流方程**

$$
\begin{aligned}
I_{Na} &= \bar{g}_{Na} \cdot m^3 h \cdot (V - E_{Na}) \\
I_K &= \bar{g}_K \cdot n^4 \cdot (V - E_K) \\
I_L &= g_L \cdot (V - E_L)
\end{aligned}
$$
其中$g$为最大电导，$E$为平衡电位
**门控变量的动力学方程**
三个门控变量 $m, h, n$ 均遵循**一阶动力学**：
$$
\frac{dx}{dt} = \alpha_x(V)(1 - x) - \beta_x(V)x, \quad x = m, h, n
$$
**等效形式**
$$
\tau_x(V) \frac{dx}{dt} = x_\infty(V) - x
$$
其中：
- **稳态值**：$x_\infty(V) = \frac{\alpha_x(V)}{\alpha_x(V) + \beta_x(V)}$
- **时间常数**：$\tau_x(V) = \frac{1}{\alpha_x(V) + \beta_x(V)}$
- **速率函数：** 开启速率$\alpha_x(V)=\frac{n_\infty}{\tau_n}$，关闭速率$\beta_x(V)=\frac{1-n_\infty}{\tau_n}$
![[attachments/Pasted image 20251201222538.png]]
**带阈值的HH模型：** 与LIF模型同理，我们可以给HH模型加上一个阈值，电压超过阈值则发放脉冲并重置。不过区别是HH模型的阈值与电流大小和持续时间都有关，而且HH模型可以真实的模拟生物神经元的**不应期**这一特性。
#### 对HH模型的降维
**2维HH模型与相平面分析**
我们观察到
1. m快速达到准静态
2. h与n动力学相似
所以我们可以让$m=m_\infty(u)$，$h=1-n$从而将原来的4个微分方程的模型简化为两层。此时模型就变成了$$
\begin{aligned}
\tau\frac{du}{dt}&=F(u(t),w(t))+RI(t)\\
\tau_w\frac{dw}{dt}&=G(u(t),w(t))
\end{aligned}
$$
对$\frac{du}{dt}=0$和$\frac{dw}{dt}=0$绘制u-nullcline和w-nullcline就可以对相平面进行分析。
**FitzHugh-Nagumo Model(FHN Model)**
FHN 给出了一个典型的 2D 简化模型（用更简单的函数替代 HH 的复杂非线性）：  
$$
\begin{cases}
\frac{du}{dt} = f(u) - w + I\\
\frac{dw}{dt} = \varepsilon (u - \gamma w - \beta)
\end{cases}
$$ 
其中 $f(u)$ 常取三次非线性（例如 $f(u)=u - u^3/3$）来生成 S 型 u-nullcline，从而能产生脉冲与回复轨道。
**一维HH模型**
继续忽略慢变量，会得到EIF（指数积分发放）模型。
#### 带适应性的模型
**AdEx模型**是在EIF的基础上增加一个适应变量w。
**lzhikevich模型**是用二叉树的思想对HH模型的简化，本质上是QIF+适应变量的形式。
还有直接在LIF上增加适应变量的模型。
计算复杂度：LIF < QIF < EIF
#### 带噪声的模型
**Noisy I&F Model(NIM)** 采用 **连续时间逃逸模型（escape noise）** 的思想：把放电看作带有瞬时发放概率强度(instantaneous firing rate)的点过程。
此外，还有脉冲响应模型(SRM)和广义线性模型(GLM)，更好的平衡了生物精确性和计算复杂性。
![[attachments/Pasted image 20251203114050.png]]

## 二、编码与解码
