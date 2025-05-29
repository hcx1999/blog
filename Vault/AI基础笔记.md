AI基础笔记
# 01 数学基础
## 1.回归
回归就是多项式曲线拟合，但是次数过低无法很好的拟合，次数过高又会出现过拟合，因此用一些算法来优化回归：
#### 正则化
常用的正则化有L1正则化和L2正则化
## 2.概率论
#### 频率学派与贝叶斯学派
贝叶斯定理：
$$p(Y|X)(后验posterior) = \frac{p(X|Y)(似然likelihood) * p(Y)(先验prior)}{\sum_{Y}  p(X|Y)p(Y)(归一化常量)}$$

$$posterior \propto likelihood * prior$$
#### 期望、方差、协方差
此处将方差定义为$Var(f) = E(f^2)-E^2(f)$，则自然的引出协方差的定义$Cov(x, y) = E(xy^T)-E(x)E(y^T)$。
#### 高斯分布
$$\mathbb { E } [ x ] = \int _ { - \infty } ^ { \infty } \mathcal { N } \left( x \mid \mu , \sigma ^ { 2 } \right) x \mathrm { ~ d } x = \mu
$$
$$
\mathbb { E } \left[ x ^ { 2 } \right] = \int _ { - \infty } ^ { \infty } \mathcal { N } \left( x \mid \mu , \sigma ^ { 2 } \right) x ^ { 2 } \mathrm { ~ d } x = \mu ^ { 2 } + \sigma ^ { 2 }
$$
$$
 \operatorname { v a r } [ x ] = \mathbb { E } \left[ x ^ { 2 } \right] - \mathbb { E } [ x ] ^ { 2 } = \sigma ^ { 2 }
$$

#### 最大似然估计（MLE）
取似然函数的负对数作为误差函数，似然函数的积变成误差函数的和，最大化似然函数就是最小化误差函数。
**推导：高斯分布在MLE中的参数估计**
观察数据集$\mathbf{x} = (x_{1}, \dots, x_{n})^T$满足独立同分布(i.i.d)，对于满足i.i.d的变量，有联合概率$p(\mathbf{x}) = \prod N(x_n|\mu, \sigma^2)$ ，最大化$p(\mathbf x)$ 可以找到最佳的$\mu$和$\sigma$。
最大化的方法是取对数之后分别对$\mu$和$\sigma$求偏导并令导数等于0，最终可以得到$\mu _{M⁢L} = \frac{1}{N}\sum _{n = 1}^{N}x_{n}$，$\sigma _{M⁢L}^{2} = \frac{1}{N}\sum _{n = 1}^{N}\left(x_{n}−\mu _{M⁢L}\right)2$  
#### 最大后验概率（MAP）
## 3.信息论
#### 自信息Self-Infomation
$$I(x)=-lnP(x)$$
单位是纳特nats
### 香农熵Shannon-Entropy
自信息只能衡量一个事件的信息量，香农熵用来衡量整个概率分布的不确定性。
$$H ( \mathrm { x } ) = \mathbb { E } _ { \mathrm { X } \sim P } [ I ( x ) ] = - \mathbb { E } _ { \mathrm { X } \sim P } [ \log P ( x ) ]
$$

### KL-散度(KL-divergence)与交叉熵(cross entropy)
# 02 机器学习
**三要素**：任务、经验、表现
**分类**：有监督学习、无监督学习、半监督学习、弱监督学习、强化学习
（机器学习分类和一些经典的任务可见a神笔记）
## 1. 线性回归(Linear Regression)
$$\mathbf{y} = \beta\mathbf{x} + \sigma$$
#### 模型介绍
通过最小化训练集误差来取得经验均值(Empirical Mean)，$f ^ { * } = \arg \min _ { f } \frac { 1 } { N } \sum _ { i = 1 } ^ { N } \left( f \left( x _ { i } \right) - y _ { i } \right) ^ { 2 }$
### 模型求解
对$A_{n*p}$进行最小二乘法，因为有n个训练样本，每个训练样本有p个维度。
- 如果n远大于p，可以认为$A^TA$是可逆的，通过偏导等于0解出来$\hat{\beta} = (A^TA)^{-1}A^TY$，则称此式有闭式(closed form)解。但n太大时直接求解并不合适，此时可以用梯度下降来求解。
**梯度下降**
每次沿着梯度的反方向走learning-rate的长度，只要损失函数是凸函数，就总能走到最优解。
- 如果n小于p，$A^TA$不可逆，则可以为$\beta$假设先验分布prior distribution，后验概率=先验概率$\times$似然函数。
对函数的先验假设的过程就是正则化的过程。
### 正则化
对于高斯分布作为先验假设的最大后验概率(MAP)经推导后得到的结果是：
$$\hat { \beta } _ { \mathrm { M A P } } = \arg \min \sum _ { i = 1 } ^ { n } \left( Y _ { i } - X _ { i } \beta \right) ^ { 2 } + \lambda \| \beta \| _ { 2 } ^ { 2 }$$
从max变成min的原因是从最大化概率变成了最小化误差。
其中$\lambda \| \beta \| _ { 2 } ^ { 2 }$是正则项（惩罚项），随先验假设的变化而变化。
$\lambda$是一个超参数，作用是控制对参数的偏好，防止过拟合。

推广到通用正则化项之后得到：
$$\min _ { \beta } ( \mathbf { A } \beta - \mathbf { Y } ) ^ { T } ( \mathbf { A } \beta - \mathbf { Y } ) + \lambda \operatorname { p e n } ( \beta ) = \min J ( \beta ) + \lambda \operatorname { p e n } ( \beta)$$
其中$J(\beta)$是损失函数，$pen(\beta)$是惩罚项。
对于惩罚项一半有L1和L2正则化两种选择：
- L1正则化（1-范数）：$\operatorname { p e n } ( \beta ) = \| \beta \| _ { 1 } = \sum _ { i = 1 } ^ { n } \left| \beta _ { i } \right|$，选择拉普拉斯分布作为先验分布。
- L2正则化（2-范数）：$\operatorname { p e n } ( \beta ) = \| \beta \| _ { 2 } ^ { 2 } = \sum _ { i = 1 } ^ { n } \beta _ { i } ^ { 2 }$，选择高斯分布作为先验分布。
其解有以下特点：
- L1套索回归的正则化项： $\lambda \sum _ { j = 1 } ^ { p } \left| \beta _ { j } \right| ,$ 这是一个L1范数，它对所有系数施加相同的惩罚，这会导致一些系数直接为零，从而产生一个**稀疏解**。**非零 $w$ 更少**。 
- L2岭回归的正则化项： $\lambda \sum _ { j = 1 } ^ { p } \beta _ { j } ^ { 2 }$, 这是一个L2范数，它对大的系数施加更大的惩罚，导致系数**平滑地趋近于零**。**有些 $w$ 更小**。
![[attachments/Pasted image 20250419170637.png]]
## 2. 逻辑回归(Logistic Regression)
#### Sigmoid函数
$\sigma(x) = -\frac{1}{1+e^{-(\omega^Tx+b)}}$
把它作为网格输出$C_1$的后验概率，即$P(C_1|\mathbf{x})=-\frac{1}{1+e^{-(\omega^Tx+b)}}$

后面的就听不懂了。
# 03 神经网络
## 1. 单个神经元
输入层(input layer)、输出层(output layer)、权重(weight)、偏置(bias)
其中权重是矩阵，输入、输出、偏置都是向量。
偏置(bias)在分类(classification)问题中起到让决策边界(decision boundary)可以不经过原点的作用。
## 2. 激活函数
作用：在模型中增加非线性的属性。
#### Sigmoid函数
- 表达式：$\sigma(z) = \frac{1}{1+e^{-z}}$
- 映射关系：$(-\infty, +\infty)\rightarrow(0, 1)$输出值在 0 到 1 之间，用以表示概率
#### Tanh函数
- 公式： $f ( x ) = \frac { e ^ { x } - e ^ { - x } } { e ^ { x } + e ^ { - x } } = \frac { 2 } { 1 + e ^ { - 2 x } }$ 
- 映射关系： $( - \infty , + \infty ) \rightarrow ( - 1 , 1 ) ,$ 输出值在-1到1之间，常用于回归任务
#### ReLU函数
- 公式 $f ( x ) = \max ( 0 , x )$ 
- 映射关系： $( - \infty , + \infty ) \rightarrow ( 0 , + \infty ) ,$ 最常用的分类函数，可以用于特征提取、**简化网络优化**（缓解梯度消失问题、偏导数好计算) 
#### Leaky ReLU函数
公式： $f ( x ) = \max ( \alpha x , x )$ 
映射关系： $( - \infty , + \infty ) \rightarrow ( - \infty , + \infty ) ,$ 解决R e L U 函数中负数部分输出为0的问题，其中的 $\alpha$ 是一个小的常数，如0.01，在ParametricReLU 中，这个 $\alpha$ 是一个可学习的参数。
#### Softmax函数
公式： $f \left( x _ { i } \right) = \frac { e ^ { x _ { i } } } { \sum _ { j = 1 } ^ { n } e ^ { x _ { j } } }$ 
映射关系： $( - \infty , + \infty ) \rightarrow ( 0 , 1 ) ,$ 输出值在0到1之间，用以表示概率，使得所有激活值之和为1.
## 3. 多层感知器
解决XOR异或分类问题，可以通过添加一个隐藏层来解决。
一般使用上标表示层序号，用下标表示该层的神经元序号。
> 多层感知器可以进一步抽象成 Encoder-Decoder 模型，其中 Encoder 用于提取特征，Decoder 用于还原数据。
## 4. 损失函数
#### 逻辑回归（分类问题）：交叉熵损失函数（Cross-Entropy Loss）
- 交叉熵非负
- 交叉熵=真实熵+KL散度
- 交叉熵是不对称的
#### 线性回归（回归问题）：均方误差损失函数（Mean Squared Error）
MSE使用L2范数进行正则化。
## 5. 优化
默认使用**梯度下降(Gradient Descent)**->需要求出梯度$\frac{\partial \mathcal L}{\partial \theta}$->使用误差反向传播(Error Back-Propagation)计算所有参数的梯度。
#### 误差反向传播
误差反向传播是用来计算神经网络中所有参数的梯度$\frac{\partial \mathcal L}{\partial \theta}$的方法，计算梯度时，引入误差函数对输出值$z$的偏导$\delta = \frac{\partial\mathcal L}{\partial z}$作为中间结果，并用这个中间结果计算每一层的梯度。
具体咋求的我也没听懂，反正可以用$\delta$来求梯度。可见pptLecture5P58.
#### 梯度消失和梯度爆炸
**梯度消失(Gradient Vanish)** 问题是指反向传播的过程中中间结果$\delta$变得很小导致靠近输入层的参数无法更新的问题。解决方法一般是用ReLU(LeakyReLU, ELU等)函数代替Sigmoid函数。
#### 随机梯度下降
**随机梯度下降(Stochastic Gradient Descent)** 每次用所有的训练样本来计算误差$\mathcal{L}$会很慢，所以每次更新$\mathcal{L}$时从中随机选取一批(batch)数据来计算误差，这批数据被称为mini-batch。
具体的，我们随机选取一批数据计算均值，再以此均值为随机梯度下降的方向。这样做有利于充分利用硬件资源，减少单样本采样导致的抖动。
缺点：容易陷入局部最优解。
#### 学习率调度
自适应学习率，有Adagrad、RMSprop、Adam等，都是SGD的变种。
#### 超参数选择(Hyper-Parameter Selection)
一般来说，可以把训练集数据分为训练数据和验证数据(Validation Data)。
对于数据稀少的情况，可以使用K折交叉验证(K-Fold Cross Validation)，是吧整个数据集平均分成K份，每次取一个做测试集其余做训练集。
## 6. 正则化
广义的正则化泛指一切可以减少过拟合(overfitting)的方法。
#### 数据增强
水平对称翻转(horizental flipping)、旋转(rotating)、平移(shifting)、缩放(zooming)等
#### 提前停止
当网络开始过拟合时提前停止训练
#### 权重衰减
其思想是在损失函数中添加损失项来限制权重的大小，从而减小模型复杂度
$\mathcal{L}_{total} = \mathcal{L} + \lambda||W||$
权重衰减只用于权重weight，不适用于偏置bias
#### $\mathcal{L}1$和$\mathcal{L}2$正则化
作为权重衰减的惩罚项，$\mathcal L 1$稀疏，$\mathcal L 2$平滑。
#### Dropout
随机丢弃一部分神经元（对隐藏输出置0）
注意模型测试/正常使用时就不要再Dropout了。
# 04 卷积神经网络
解决由于作为高维数据无法全部作为矩阵丢进神经网络的问题。
## 1. 卷积
- **空间上的权值共享**：平等对待每一个位置（一个位置可以理解为一片像素）
- **稀疏连接**：每个神经元仅与前一层的感受野内的神经元存在连接，而非像神经网络一样全连接。
- **等变表示**：卷积具有平移不变性。
卷积算法：2D/3D卷积、填充(padding)、卷积核形状、感受野
**感受野**指的是 输出特征图 上的一个元素（或者说像素）在原始输入图像上映射的区域大小。
## 2. 池化
池化是一种特殊的卷积操作，它 没有一个可学习的参数 （即一般卷积核的权重），只是对输入数据进行一种固定的操作。池化操作可以 减少特征图的尺寸（所以也是降采样） ，减少计算量和参数数量，同时提高模型的鲁棒性。
## 3. 分层表示学习
在 CNN 中，我们通过堆叠多个卷积层和池化层来逐渐提取图像的高级特征，实现 层次化的特征学习 。这种网络中，越

低的层次（感受野小）提取的是图像的低级特征，如边缘、纹理等，而越高的层次（感受野大）提取的是图像的高级特

征，如物体的形状、部分等。
## 4. 卷积神经网络结构
Basic: AlexNet、VGG、ResNet
More: SqueezeNet, MobileNet, ShuffleNet
## 5. 转置卷积（反卷积）
上采样（Upsampling）
**应用**：
- 图像重建与去噪
- 生成对抗网络（Generative Adversarial Network，GAN）
- 图像分割（Image Segmentation）
- 超分辨率（Super-resolution）
# 05 对抗神经网络
## 1. 生成式模型 Generative Models
#### 计算机视觉
- 计算机图形学依赖大量 **先验知识（Prior Knowledge）** ，如材料、物理建模、光照等，来精确地生成图像。
- 统计 / 深度生成模型（Statistical/Deep Generative Model）则通过学习 **大量数据**，尝试减少对先验知识的依赖。
#### 先验知识
- **先验知识** ：在模型训练或图像生成前已经存在的知识，如物理规则或专家知识。
- **数据** ：模型训练或图像生成过程中使用的数据。
#### 生成式模型
生成模型的目的是为了 **学习数据的概率分布** $p(x)$。理解了这个分布后，我们可以通过采样（sampling）来生成新的数据样本，即 $x_{new}∼p(x)$。
**关键词**：概率分布、采样、密度估计、无监督学习
与生成式模型（Generative Models）相对的是判别式模型（Discriminator Models）
## 2. 朴素对抗神经网络 Vanilla GAN
![[attachments/Pasted image 20250513140250.png]]
### 对抗性损失 Adversarial Loss vs. 均方误差 MSE
我们可以发现，对抗学习比 MSE 更加像人类，我们通常说 **对抗学习是一种自适应的损失函数** （Adversarial loss = automatic/adaptive loss），在训练不同阶段，它能够关注不同的东西。这是因为对抗损失 **不仅考虑像素级别的相似度，还考虑了图像的整体分布**。这意味着生成的图像在整体结构和细节上都更加逼真。
### 深度卷积对抗神经网络 DCGAN
DCGAN 是一种结合了卷积神经网络（CNN）和 GAN（生成对抗网络）的深度学习模型。DCGAN 的 Generator **使用卷积神经网络来生成图像**，而判别器（Discriminator）同样使用卷积网络来判断图像是真实的还是由生成器（Generator）生成的。
除此之外，DCGAN 的创新之处还体现在它使用了一系列的技巧来稳定训练过程，如使用批归一化（Batch Normalization）、去除全连接层、使用 ReLU 激活函数等。
### 变分自编码器 VAE
![[attachments/Pasted image 20250513140854.png]]
VAE（变分自编码器）是一种生成模型，它包含一个 Encoder **将数据编码为一个潜在空间的表示**，和一个 Generator（也称为 Decoder） **将潜在空间的表示解码回数据**。
**GAN 通常能够生成比 VAE 更清晰、更逼真的图像**，因为 GAN 的对抗性损失促使生成器学习到更加精细的数据分布，而 VAE 的重构损失和 KL 散度（KLD）则可能导致生成的图像较为模糊。
- **VAE** = Generator + Encoder
- **Vanilla GAN** = Generator + Discriminator
- **Better GAN** = Generator + Discriminator + Encoder
## 3. 精选对抗神经网络
### 条件对抗神经网络（Conditional GAN, cGAN）
条件对抗神经网络是对抗神经网络（GAN）的一种扩展，它通过 **引入额外的条件信息**，控制生成内容。这种方法能够解决多模态问题，即对于同一个条件，存在多种可能的输出。
最经典的一个生成任务就是，输入希望生成的图像类别标签，然后根据这个标签来生成图像，比如控制生成花、生成鸟、或者别的东西。
#### 结构：
![[attachments/Pasted image 20250513141209.png]]
#### 应用：
![[attachments/Pasted image 20250513141236.png]]
### 寻找编码器（Find Latent Representation）
#### VAE(variational autoencoder)
VAE = Generator + Encoder
Vanilla GAN = Generator + Discriminator
![[attachments/Pasted image 20250525102449.png]]
### 双向生成对抗网络（Bidirectional GAN, BiGAN）
BiGAN = G + D + E
#### 结构
BiGAN 包括三个主要部分：生成器（G）、编码器（E）和判别器（D）。
- **生成器（G）**：接收随机噪声 $Z$，输出生成的数据 $\hat{X}$。
- **编码器（E）**：接收真实数据 $X$，输出编码表示 $\hat{Z}$。
- **判别器（D）**：用来判断输入是来自生成器的输出还是编码器的输出。
![[attachments/Pasted image 20250513142019.png]]
#### 训练过程
1. **训练生成器**：输入随机噪声 $Z$ 到生成器，生成 $\hat{X}$；同时把 $Z$ 和 $\hat{X}$ 一起给判别器。
2. **训练编码器**：输入真实数据 $X$ 到编码器，生成 $\hat{Z}$；同时把 $X$ 和 $\hat{Z}$ 一起给判别器。
3. **判别器的目标**：减小生成器和编码器输出的联合分布之间的差异。
#### 最终目标
当生成器和编码器达到最优时，编码器将成为生成器的逆函数，即$E = G^{-1}$。此时，$G(E(X))=X$和$E(G(z))=Z$。
### 协同生成对抗网络（Cooperative GAN，CoGAN）
CoGAN 可以学习两个（语义相似）领域的联合分布 p(XA,XB)p(XA​,XB​)，并且能够同时生成两个领域的数据。两个领域的数据没有已知的映射关系。
![[attachments/Pasted image 20250513142047.png]]
CoGAN 通过 **共享权重机制使得两个生成网络可以生成具有相似性质的数据**，而不需要为每个数据集训练独立的模型。
#### 主要应用：
Unpaired Image-to-Image Translation（无配对图像到图像的转换）。
#### 局限性
它在不知道映射关系的情况下学习了两个领域的联合分布，但是当给定一张图片时，它不能输出另一个领域的图片
因此，我们需要将图像映射回潜在编码以便进行更多应用。
### 循环生成对抗网络（CycleGAN）
#### 结构
![[attachments/Pasted image 20250513142149.png]]
#### 应用
引入L1 Loss（非相对loss）评估相似性，改善了BiGAN和coGAN的诸多问题，是比较新的一个GAN形式。但现在主流应用并非GAN而是扩散模型。
# 06 循环神经网络
用于处理时间序列数据集，与之相对的是前馈神经网络。
## 词的表示
### One-hot vector
过于原始，维数灾难。
### 词袋模型 Bag of Words
在计算机视觉中常用。
在RNN中可能有维数灾难，且丢失位置信息。
### 词嵌入 Word Embedding
用一组浮点数向量来表示单词。
#### 优点
- 维度低
- 用相近向量代表相近词义，甚至可以用向量加减表示语义(?)
- 密集向量容易计算
#### 习得词嵌入
通过数据学习词嵌入表，是一种自监督学习(self-supervised learning)
#### 具体算法
**Word2Vec = Skip-Gram / CBOW+ Negative Sampling(负采样技术)**
（Skip-Gram是通过中间词预测上下文，CBOW是通过上下文预测中间词。）
**噪声对比估计（NCE）**
## 序列数据 Sequential Data
### 时间步
序列数据的重要概念，每个单词可以看作一个时间步，时间步按照单词在句子中你出现的先后顺序排序，表示句子中单词的序列信息。
### 一些用途
- one to many: 输入图片，输出图片描述
- many to one: 输入句子，输出情感分析数值
- 异步many to many: 语言翻译，再开始翻译之前拥有整个句子；交通计数，实施输入视频
- 同步many to many: 天气预测，每个时间步都有输入和输出；聊天机器人(！)
### Vanilla RNN
将前一个时间步的信息传给下一个时间步。
局限性：很难维持较为长期的信息。
### 长短期记忆网络 LSTM(Long Short-Term Memory)
#### 门控单元
门控函数通过将输入向量与门控向量逐元素相乘来过滤信息。
遗忘门、输入门、输出门
大部分时候使用Sigmoid函数，也有时候使用ReLU或tanh。特殊的，输入门需要用tanh以获得更好的特征表达。
### LSTM变体：门控循环单元 GRU
不具有cell state，减少了LSTM的计算成本和内存使用。
并没有提供显著改进。
# Transformer
目前的处理序列问题的工具：
- RNN：长序列会梯度消失/梯度爆炸
- LSTM/GRU：计算效率较低
- CNN：感受野有限，不能捕捉全局信息
### 人类注意力机制
心理学：非自主性提示、自主性提示
灵长类视觉系统分层级的信号处理
- 低层级（视网膜）：视觉编码
- 中层级（视皮层）：视觉解码
- 高层级（其他脑区）：理解与感知
灵长类中央凹(20%)与注意力机制有关，外周视觉(80%)与高效编码有关。
### 自注意力机制 Self-attention
注意力提示：
- 非自住性提示：Key, Value
- 自主性提示：Query
- 注意力汇聚：打分函数（缩放点积注意力、加性注意力）、注意力权重矩阵、加权平均
将输入序列的线性表示（矩阵）通过三个不同的线性层投影分别生成查询矩阵Q，键矩阵K和值矩阵V，用于计算注意力输出。
### 多头注意力
h个self-attention的组合，类似于神经网络全连接层堆叠神经元
### Transformer
### 常用的预训练模型
GPT、BERT