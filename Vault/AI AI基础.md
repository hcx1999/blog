# AI基础

## 1. 数学基础

### 1.1 回归与正则化

回归是多项式曲线拟合，通过最小化训练集误差来取得经验均值：

$$
f^* = \arg\min_f \frac{1}{N} \sum_{i=1}^N (f(x_i) - y_i)^2
$$

正则化用于防止过拟合：

- L1正则化（套索回归）：产生稀疏解
- L2正则化（岭回归）：平滑系数趋近于零

### 1.2 概率论基础

#### 频率学派与贝叶斯学派

贝叶斯定理：

$$
P(Y|X) = \frac{P(X|Y) \cdot P(Y)}{P(X)}
$$

#### 期望、方差、协方差

- 方差：$Var(f) = E[f^2] - E[f]^2$
- 协方差：$Cov(x,y) = E[xy^T] - E[x]E[y^T]$

#### 高斯分布

期望：$E[x] = \mu$
方差：$Var[x] = \sigma^2$

#### 最大似然估计（MLE）

对于i.i.d.数据，联合概率：

$$
p(\mathbf{x}) = \prod N(x_n|\mu, \sigma^2)
$$

取负对数作为误差函数，最大化似然等价于最小化误差。

#### 最大后验概率（MAP）

结合先验知识的估计方法。

### 1.3 信息论

#### 自信息

$$
I(x) = -\log P(x)
$$

#### 香农熵

$$
H(x) = E_{X \sim P}[I(x)] = -E_{X \sim P}[\log P(x)]
$$

#### KL散度与交叉熵

KL散度衡量两个分布的差异：

$$
D_{KL}(P||Q) = \sum P(x) \log \frac{P(x)}{Q(x)}
$$

交叉熵：$H(P,Q) = H(P) + D_{KL}(P||Q)$

## 2. 机器学习基础

### 2.1 机器学习三要素

- 任务（Task）
- 经验（Experience）
- 表现（Performance）

### 2.2 学习分类

- 有监督学习
- 无监督学习
- 半监督学习
- 弱监督学习
- 强化学习

### 2.3 线性回归

模型：$\mathbf{y} = \beta\mathbf{x} + \sigma$

最小二乘解：当$n > p$时，$\hat{\beta} = (A^TA)^{-1}A^TY$

梯度下降：沿着梯度反方向更新参数。

正则化：

- L1：$\|\beta\|_1$
- L2：$\|\beta\|_2^2$

![L1与L2正则化的比较](attachments/Pasted%20image%2020250419170637.png)
*L1正则化产生稀疏解（部分系数为零），L2正则化使系数平滑趋近于零*

MAP估计：$\hat{\beta}_{MAP} = \arg\min \sum (Y_i - X_i\beta)^2 + \lambda \|\beta\|_2^2$

### 2.4 逻辑回归

Sigmoid函数：$\sigma(x) = \frac{1}{1+e^{-(\omega^Tx + b)}}$

作为后验概率：$P(C_1|\mathbf{x}) = \sigma(\omega^Tx + b)$

## 3. 神经网络

### 3.1 单个神经元

- 输入层、输出层
- 权重矩阵、偏置向量
- 激活函数增加非线性

### 3.2 常用激活函数

- Sigmoid：$(-\infty, +\infty) \to (0,1)$
- Tanh：$(-\infty, +\infty) \to (-1,1)$
- ReLU：$f(x) = \max(0,x)$
- Leaky ReLU：$f(x) = \max(\alpha x, x)$
- Softmax：用于多分类概率输出

### 3.3 多层感知器（MLP）

通过隐藏层解决XOR等非线性问题。

### 3.4 损失函数

- 分类：交叉熵损失
- 回归：均方误差（MSE）

### 3.5 优化算法

#### 梯度下降

- 批量梯度下降
- 随机梯度下降（SGD）
- 小批量梯度下降

#### 误差反向传播

计算各层梯度：$\delta = \frac{\partial \mathcal{L}}{\partial z}$

#### 梯度消失/爆炸

使用ReLU等激活函数缓解。

#### 自适应优化器

- Adagrad
- RMSprop
- Adam

### 3.6 正则化技术

- 数据增强
- 提前停止
- 权重衰减：$\mathcal{L}_{total} = \mathcal{L} + \lambda \|W\|$
- Dropout：随机丢弃神经元

## 4. 卷积神经网络（CNN）

### 4.1 卷积操作

- 空间权重共享
- 稀疏连接
- 平移等变性

### 4.2 池化

降采样，减少计算量，提高鲁棒性。

### 4.3 层次化特征学习

低层：边缘、纹理
高层：形状、物体部分

### 4.4 经典架构

- AlexNet
- VGG
- ResNet

### 4.5 转置卷积

用于上采样，应用在图像分割、超分辨率等。

## 5. 生成对抗网络（GAN）

### 5.1 生成式模型

学习数据概率分布$p(x)$，通过采样生成新数据。

### 5.2 Vanilla GAN

- 生成器（Generator）
- 判别器（Discriminator）
- 对抗损失：自适应损失，关注整体分布

![Vanilla GAN结构图](attachments/Pasted%20image%2020250513140250.png)
*生成器从噪声生成假数据，判别器区分真假数据，通过对抗训练达到纳什均衡*

### 5.3 DCGAN

结合CNN的GAN，使用批归一化等技巧稳定训练。

### 5.4 VAE vs GAN

- VAE：Encoder + Decoder，重构损失 + KL散度
- GAN：生成更清晰图像

![VAE架构图](attachments/Pasted%20image%2020250513140854.png)
*VAE通过编码器将输入压缩到潜在空间，再通过解码器重构，加入KL散度确保潜在空间符合正态分布*

### 5.5 条件GAN（cGAN）

引入条件信息控制生成内容。

![cGAN结构图](attachments/Pasted%20image%2020250513141209.png)
*条件GAN在生成器和判别器中都加入条件信息，实现控制生成内容的GAN*

![cGAN应用示例](attachments/Pasted%20image%2020250513141236.png)
*展示条件GAN在图像生成中的应用，如根据标签生成特定类别的图像*

### 5.6 BiGAN

Generator + Discriminator + Encoder，实现双向映射。

![BiGAN架构图](attachments/Pasted%20image%2020250513142019.png)
*BiGAN通过联合训练生成器、判别器和编码器，实现数据到潜在空间的双向映射*

### 5.7 CycleGAN

无配对图像转换，使用循环一致性损失。

![CoGAN架构图](attachments/Pasted%20image%2020250513142047.png)
*CoGAN通过共享权重在两个领域间学习联合分布，实现跨领域生成*

![CycleGAN架构图](attachments/Pasted%20image%2020250513142149.png)
*CycleGAN通过循环一致性损失实现无配对图像到图像的转换*

## 6. 循环神经网络（RNN）

### 6.1 词表示

- One-hot：维数灾难
- 词袋模型：丢失位置信息
- 词嵌入：低维密集向量

### 6.2 词嵌入学习

- Word2Vec：Skip-Gram / CBOW + 负采样
- 自监督学习

### 6.3 序列数据应用

- One-to-many：图像描述
- Many-to-one：情感分析
- Many-to-many：翻译、聊天

### 6.4 Vanilla RNN

传递前一时间步信息，难以维持长期记忆。

### 6.5 LSTM

- 遗忘门
- 输入门
- 输出门
- 门控单元使用Sigmoid

### 6.6 GRU

LSTM变体，减少计算成本。

## 7. Transformer

### 7.1 背景

克服RNN/CNN的局限：

- RNN：梯度问题
- CNN：有限感受野

### 7.2 注意力机制

- 自注意力：Query, Key, Value
- 缩放点积注意力
- 多头注意力

### 7.3 Transformer架构

基于自注意力的序列模型。

### 7.4 预训练模型

- GPT
- BERT

## 8. 搜索算法

### 8.1 形式化表述

- 初始状态
- 可选动作
- 状态转移模型
- 目标状态
- 路径成本

### 8.2 搜索类型

- 无信息搜索
- 有信息搜索（启发式）

### 8.3 局部搜索

- 爬山法
- 模拟退火
- 遗传算法

### 8.4 约束满足问题（CSP）

- 变量、值域、约束
- 约束传播
- 回溯搜索

## 9. 强化学习

### 9.1 基本概念

- 环境（Environment）
- 智能体（Agent）
- 状态、动作、奖励

![强化学习环境示意图](attachments/Pasted%20image%2020250608103854.png)
*智能体在环境中通过动作与环境交互，获得状态和奖励*

![强化学习智能体示意图](attachments/Pasted%20image%2020250608103923.png)
*智能体根据当前状态选择动作，环境返回新状态和奖励*

### 9.2 学习目标

最大化累积奖励。

### 9.3 方法分类

- 基于值函数
- 基于策略
- 演员-评论家方法
