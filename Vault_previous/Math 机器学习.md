# 机器学习
## 01 线性回归

**目的：** 现在有一组数据$\{(x_1, y_1)...(x_n, y_n)\},x_i\in\mathbb{R}^d, y_i\in\mathbb{R}$，我期望找到一个线性函数（称为模型）$\hat{y}=f(x) = w^Tx+b$使得预测值$\hat{y}$与真实值$y$接近（$w\in \mathbb{R}^d, b\in \mathbb{R}$）。
那么首先考虑如何定义“最近”，即如何找一个合适的**损失函数**。我们的原则是**经验风险最小化**。
**经验风险最小化：** $\min\limits_{w,b}\frac1n\sum\left(y_i-(w^Tx_i+b)\right)^2$（其中1/n为常量可忽略），损失函数$L(w,b)=\sum\left(y_i-(w^Tx_i+b)\right)^2$被称为**均方误差损失函数**。
这是一个最优化问题，对这个问题直接求导可以得到$\hat{W}=(X^TX)^{-1}X^Ty$，其中$\hat{W}=\left(w^T, b\right)^T\in\mathbb{R^{d+1}}$，X的第i个行向量为$(x_i^T, 1)$，$x\in\mathbb{R}^{n\times(d+1)}$，故当且仅当$X^TX$可逆时有闭式解。
现在考虑$X^TX$不可逆的情况。这种情况一般是X的行向量极为相似导致的（多重共线性）。对应到宏观特征即X的两个维度相似度很高。这个问题我们使用**正则化**来解决。
**L2正则化：** 将损失函数变为$\min\limits_{\hat{W}}L(\hat{W})+\lambda||\hat{W}||^2$，使用这个损失函数的回归称为岭回归(Ridge Regression)。此时解变为$(X^TX+\lambda I)^{-1}X^Ty$，而容易证明这个矩阵一定可逆。
**L1正则化：** 将损失函数变为$\min\limits_{\hat{W}}L(\hat{W})+\lambda||\hat{W}||$，使用这个损失函数的回归被称为套索回归(Lasso Regression)。他与岭回归的区别是$\hat{W}$向量的更多维度会取到0(exactly 0)。
从几何的视角来看，正则化的过程是让目标超平面在拟合数据的情况下系数$\hat{W}$的模长尽可能小。

## 02 逻辑回归
**目的：** 给定一组数据，区别在于$y\notin\mathbb{R}$，$y\in\{0,1\}$，我们需要得到概率$P(y=1|x)\in[0,1]$。方法是使用线性回归$f(x)=w^Tx+b$得到值之后用sigmoid函数$\sigma(x)=\frac1{1+e^x}$得到概率。
显然经验风险最小化极其衍生的损失函数已经不适合解决分类问题。现在我们用另一个原则定义损失函数：**最大似然估计**
**似然：** 一个数据点的似然被定义为$P(y_i|x_i)=\{\sigma(w^Tx_i+b),y_i=1; 1-\sigma(w^Tx_i+b),y_i=0\}=(\sigma(w_Tx_i+b))^{y_i}(1-\sigma(w_Tx_i+b))^{1-y_i}$，数据集的似然就是所有数据点的似然相乘。
**最大似然估计：** 对数据集的似然取负log即可得到损失函数，$J(w, b) = \sum(-y_i\log\sigma(w^Tx_i+b) + (1-y_i)\log(1-\sigma(w^Tx_i+b)) )$，这就是**交叉熵损失函数**。
至于这个损失函数为什么叫交叉熵，是因为在**信息论**中，一个离散随机变量的**信息熵**被定义为$H(X)=-\sum P(x)logP(x)$，它衡量了单个事件的信息量。而**交叉熵**被定义为$H(P,Q)=-\mathbb{E}_{x\sim P}[logQ(x)]=-\sum P(X)logQ(x)$，它衡量了在真实分布为P的情况下，使用模型分布Q来编码时所需的平均编码长度。而二者的差$D_KL(P||Q)$衡量了用模型分布编码真实分布所需的额外信息量，被称为**KL散度**。

与线性回归相同，由于存在离群点、模型线性不可分等原因，逻辑回归也需要正则化项来避免过拟合。

**多分类问题：** 可以先使用k个分类器进行分类，最后$P(y=k|x)=\frac{exp(w_kx+b_k)}{\sum exp(w_ix+b_i)}$即可，当然也可以使用神经网络，最后softmax一下。

现在我们知道均方误差损失函数不能解决分类问题，那么交叉熵损失函数能不能解决回归问题呢？答案是**可以！** 仅需要在原模型$y=w^Tx+b$加一个噪声$\epsilon\sim\mathbb{N}(0,\sigma^2)$便可以得到$P(y|X_i;\hat{W},\sigma^2)=\frac1{\sqrt{2\pi}\sigma}exp(-\frac{(y-\hat{W}^TX_i)^2}{2\sigma^2})$，其中$\sigma$是超参数。这个式子表示在超参数取特定值、待训练参数取特定值时某个数据点的似然。把所有的数据点的似然相乘再取负log即可得到原均方误差损失函数的形式(!)好神奇。

此外，还有有一种贝叶斯学派的思想，即“一切变量都是随机变量”。当我们把$\hat{W}$也看成随机变量时，就可以用贝叶斯学派的**最大后验分布**的思想来推导同样的损失函数。因为$\epsilon\sim\mathbb{N}(0,\sigma^2)$，所以y的后验$p(y|\hat{W},X)=\mathbb{N}(\hat{W}X,\sigma^2I)$，我们要寻找W使得y的后验最大，即$\mathcal{L}_{MLE}=p(y|\hat{W},X)=\frac1{2\sigma^2}||y-\hat{W}X||^2$，但这还没完，当$\hat{W}$也被看作随机变量时，$\mathcal{L}_{MLE}=p(y|\hat{W},X)\cdot p(\hat{W})$，这才是最终结果。对其取负对数就能得到与均方误差损失函数相同的形式。如果$\hat{W}$先验是高斯分布，那么这个损失函数就是岭回归；如果先验是拉普拉斯分布，那么就是套索回归。从这个角度，我们可以将之前的正则化项理解为$\hat{W}$偏移先验的惩罚。

## 03 支持向量机
**目标：** 对于训练样本 $\{(x_i,y_i)\}_{i=1}^n$，$y_i\in\{-1,+1\}$寻找一个超平面$w^Tx+b=0$来分割高维空间中的n个点，使得离平面最近的点与平面的距离尽量远。
我们首先考虑简单的情况：n个点在空间中线性可分（**硬间隔SVM**）考虑第i个点与超平面的距离（**几何间隔**）$\gamma_i=\frac{y_i(w^Tx_i+b)}{||w||}$，最小的几何间隔$\gamma=\min\limits_i\gamma_i$，我们要求的是$arg\max\limits_{w,b}\gamma$，这样就抽象成了一个数学模型。
下一步比较难以理解，我们定义$y_i(w_Tx_i+b)$为第i个点的**函数间隔**，此时我们发现，如果将$w$和$b$同比例缩放，将只会影响函数间隔大小，不会影响几何间隔和实际超平面。那不妨直接固定一个函数间隔，令函数间隔的绝对值的最小值为1。此时问题就转化成了$\max\limits_{w,b}\frac1{||w||},s.t.\forall i,y_i(w^Tx_i+b)\geq 1$，为了方便求导，可以进一步转化成$\min\limits_{w,b}\frac12||w||^2,s.t.\forall i,y_i(w^Tx_i+b)\geq 1$，这个式子被称为**SVM原始形式**。这是一个带约束凸优化问题，唯一解存在（若线性可分），我们可以构造拉格朗日函数来求解。

### 拉格朗日函数
拉格朗日函数用于求解带约束的优化问题，本质上是将带约束的优化转换成无约束的优化问题。
对于有m个等式优化$h_i(x) = 0,i = 1\dots m$和p个不等式优化$g_i(x) \leq 0,i = 1\dots p$，拉格朗日函数为$L(x, \lambda, \mu) = f(x) + \sum \lambda_i h_i(x) + \sum \mu_j g_j(x)$
几何解释：在最优解$x^*$处，目标函数的梯度必须位于约束函数梯度张成的空间中。通俗来讲，要不目标函数梯度为0，要不目标函数梯度指向一部分约束的梯度方向（即与约束边界垂直）。
**KKT条件：** KKT条件是拉格朗日函数最优解的**必要不充分**条件，包含：
- 稳定性条件：$\nabla_xL(x^*,\lambda,\mu)=0$
- 原始可行性：$h_i(x^*)=0,g_j(x^*)\leq 0$
- 对偶可行性：$\mu_i^*\geq 0$
- 互补松弛条件：$\mu_jg_j(x^*)=0$
可以用这个必要条件来求解SVM中遇到的带约束优化问题。

经过拉格朗日函数的处理之后，我们的问题就变成了$\min\limits_{w,b}\max\limits_{\alpha_i\geq 0}L(w,b,\alpha)=\min\limits_{w,b}\max\limits_{\alpha_i\geq 0}\frac12||w||^2+\sum\alpha_i-\sum\alpha_iy_i(w^Tx+b)$。遗憾的是，SVM问题的拉格朗日函数并不能用KKT条件求解。不过数学家在上世纪九十年代将拉格朗日对偶理论引入SVM，实现了一种很漂亮的解法。
**SVM对偶形式：**$\max\limits_{\alpha_i\geq 0}\min\limits_{w,b}L(w,b,\alpha)$
引理：对偶形式的解$p^*$与原始形式解$d^*$满足$d^*\leq p^*$，如果等号满足则称为强对偶，否则称为弱对偶。（证明：咕咕咕）
**slater条件：** 对于一个凸问题，如果其所有的约束都是线性的，那么这个问题与其对偶问题是强对偶。（证明：咕咕咕）
这样我们就可以直接用KKT条件求出对偶形式的内部问题的解是$w=\sum\alpha_iy_ix_i$，同时还可以解出来一个约束条件$\sum\alpha_iy_i=0$。此时考虑外层，将$w$和这个条件带入，$\max\limits_{\alpha_i\geq 0,\sum\alpha_iy_i=0}\sum\alpha_i-\frac12\sum\sum\alpha_i\alpha_jy_iy_jx_i^Tx_j$
现在问题转化成了求一组$\alpha^*$使得上式取max，只需要求得这一组$\alpha^*$就能解出$w^*=\sum\alpha_i^*y_ix_i$和$b^*=y_i-w^{*T}x_i$了！
**SMO算法：** SMO算法用于求解这个问题。核心思想是每次取出两个$\alpha$进行更新，固定其他$\alpha$不动。
1. 初始化所有$\alpha_i=0$
2. 随机选择（或者使用启发式规则选择两个违反KKT条件最严重的）两个$\alpha_i,\alpha_j$
3. 固定其他$\alpha$，得到$\alpha_iy_i+\alpha_jy_j=-\sum\limits_{k\neq i,j}\alpha_ky_k=C$
4. 解析求解问题并更新$\alpha_i,\alpha_j$，确保新值在$[0,C]$范围内
5. 如果收敛就停止，否则跳转至第2步

**支持向量：** 支持向量机的名字来源于支持向量，所有距离超平面最近的数据点称为支持向量。支持向量还有一些性质：
- 支持向量对应的的$\alpha>0$，否则$\alpha=0$
- 只有支持向量影响最终的平面，$w^*=\sum\alpha_i^*y_ix_i$和$b^*=y_i-w^{*T}x_i$只加支持向量的结果是一样的。
- 如上文所说，支持向量满足$w^Tx+b=+1$（正类）或$w^Tx+b=-1$（负类）
- 容易证明正类和负类都至少有1个支持向量。
支持向量机采用**结构风险最小化(SRM)** 的思想，与逻辑回归的**经验风险最小化(ERM)** 相比，SVM更关心分界线周围的样本，而完全不关注偏移很远的样本。

好！现在我们已经成功的解决了满足**硬间隔**+**线性可分**两个假设的SVM问题。接下来我们去掉线性可分这一假设，如果数据点仍然可分但是不线性可分，该怎么处理？
要解决这个问题的核心思想是如果在当前空间内不线性可分，那只需要增加维度就会在某个更高维的空间中线性可分。因此我们将x映射到更高维的空间中。定义$\varphi:\mathbb{R}^d\rightarrow\mathbb{R}^{d^{\prime}}$并用$\varphi(x)$替换$\max\limits_\alpha\sum\alpha_i-\frac12\sum\sum\alpha_i\alpha_jy_iy_jx_i^Tx_j$中的x，理论上就可以解决这个问题了。但是计算$\varphi(x_i)^T\varphi(x_j)$需要$O(d^2)$的复杂度，这过于复杂了。我们通过一种巧妙的**核技巧**来简化。
**核技巧：** 定义核函数$K(x,z)$并用$K(x_i,x_j)$来代替原式中的$x_i^Tx_j$，这样就省去了先映射再相乘的步骤，复杂度优化为$O(d)$。常用的核函数有以下几种：
- 线性核：$K(x,z)=x^Tz$
- 多项式核：$K(x,z)=(x^Tz+1)^p$
- 高斯核（RBF核）：$K(x,z)=exp(-\frac{||x-z||}{2\sigma^2})$
**Mercer定理：**$K(\cdot,\cdot)$是一个合法的核函数如果：
1. 对称：$K(x,z)=K(z,x)$
2. Gram矩阵半正定（对任意向量组）
严格来讲，Mercer定理给出了核函数有效的充分条件。但是就机器学习实践中其实可以当作充要条件。

从几何角度来看，核函数实际上描述了低维空间中的点在高维空间的相似程度，它通过“扭曲空间”将弯曲面展成平面从而实现在高维空间中线性可分。
以RBF核为例，$K(x,z)=exp(-\frac{||x||}{2\sigma^2})exp(-\frac{||z||}{2\sigma^2})exp(\frac{x^Tz}{\sigma^2})=exp(-\frac{||x||}{2\sigma^2})exp(-\frac{||z||}{2\sigma^2})\sum\limits_{n=0}^{+\infty}\frac1{n!}(\frac{x^Tz}{\sigma^2})^n$，$\sigma^2$决定了高维还是低维的衰减速度（这里的“衰减”指的是对核函数进行泰勒展开之后多项式系数随次数增高的衰减），从而决定谁对决策平面的影响更大。直观来讲就是决定决策边界的弯曲程度。当$\sigma^2$较小时衰减很快，低维特征占主导，得到的曲面就接近平面，需要的支持向量更多，容易过拟合。当$\sigma^2$较大时衰减很慢，高维特征也就是相似程度占主导，得到的曲面就高度弯曲甚至形成封闭球面，需要的支持向量更少，容易欠拟合。

好！现在我们已经解决了硬间隔SVM，我们把最后一个假设也去掉，如果数据中确实存在离群点该怎么做呢？
对于这种情况，我们引入**松弛变量(Slack Variables)** $\xi$，将原始形式SVM变成$\min\limits_{w,b,\xi}\frac12||w||^2+C\sum\xi_i,s.t.\forall i，y_i(w^Tx+b)\geq 1-\xi_i$即可。注意到$\xi_i\geq max(0,1-y_i(w^Tx_i+b))$，所以问题可以进一步化简：$\min\limits_{w,b}\frac12||w||^2+C\sum max(0,1-y_i(w^Tx_i+b))$。这时我们惊奇的发现这个结果是一个**合页损失函数(hinge loss)** 加上一个正则化项的形式！不过为什么这么巧呢？我个人认为可能是学习定理给出了最优解的一般形式，无论从哪一条路都必然会走到这个终点。
番外：Tikhonov正则化：$\min\limits_f\frac1n\sum L(y_i,f(x_i))+\lambda R(f)$
## 04 表示定理
**目的：** 证明用无限维的核方法求出的最优解保证存在于有限维子空间中，从而证明核方法的可行性。
**内容：** 对于再生希尔伯特空间(RKHS)$\mathcal{H}$中正则化风险最小化问题$\min\limits_{f\in\mathcal{H}}\frac1n\sum L(y_i,f(x_i))+\lambda||f||^2_{\mathcal{H}}$的最优解总是具有$f^*(x)=\sum\alpha_iK(x_i,x)$的形式。

### 再生希尔伯特空间RKHS：
说到“空间”，我们为什么需要空间？空间的存在其实是为了提供一个衡量数据点之间远近的标尺，从而才能进行划分。<!--最简单的空间是**线性空间**，在**线性空间**基础上添加**距离**的概念衡量两个点之间的距离就得到了一个**线性度量空间**。再引入一个叫**范数**的概念：范数是度量一个向量自己的长度的属性，满足非负性、齐次性、三角不等式，常见范数有**L2范数、L1范数、
无穷范数($||x||_\infty=max(|x_i|)$)** 等。引入范数概念的线性度量空间叫做**线性赋范空间**。接下来引入最重要的一个概念：**内积**。内积的重要性在于我们可以用内积定义范数($||x||=\sqrt{x,x}$)，从而定义距离。-->
考虑一个希尔伯特空间，我们希望得到一个核函数$K(\cdot,\cdot)$，它将两个有限维向量$x,z\in\mathbb{R}^d$映射到一个实数$K(x,z)\in\mathbb{R}$，并且函数值衡量了两个有限维向量的相似程度，即其在无穷维空间中的映射的内积$K(x,z)=\Phi(x)\Phi(z)$（其中$\Phi(x):\mathbb{R}^d\rightarrow\mathbb{R}^\infty$表示有限维空间中的向量向无穷维空间的映射）。
为了实现这个目的，我们定义**再生性**：对于一个希尔伯特空间$\mathcal{H}$和一个核函数$K(\cdot,\cdot)$，$\mathcal{H}$中的任意一个函数$f$在任意一点的取值$f(x)$，都可以通过$f$与核函数$K(\cdot,x)$做内积得到，即$\forall f,\forall x,f(x)=<f,K(\cdot,x)>_\mathcal{H}$，那么这个希尔伯特空间就满足**再生性**，被称为一个**再生希尔伯特空间(RKHS)**。这个核函数被称为这个RKHS的**再生核**，再生核与RKHS其实构成双射。
现在我们可以直接定义这个神秘的映射$\Phi(x)=K(\cdot,x)$了！可以证明在由$K(\cdot,\cdot)$确定的RKHS中满足了我们想要的$K(x,z)=\Phi(x)\Phi(z)$（证明：咕咕咕）。事实上，核函数和其对应的RKHS巧妙的统一了函数的代数计算操作$f(x)$和空间中的几何上的内积操作。从几何角度来讲，我还没有学会，咕咕咕咕咕咕

现在我们来将使用L2正则化的线性回归、逻辑回归、SVM都推到成表示定理所示的形式：
咕咕咕

## 06 学习理论
**大致目的：** 学习理论旨在数学化的回答为什么机器学习能够work的一系列问题，包括`为什么训练集上表现好的模型可以在测试集上表现的好？`、`需要多少样本才能达到期望的性能？`以及`如何衡量机器学习算法的好坏？`
**具体目的和问题设定：** 现在有一个未知的分布$\mathcal{D}\in\mathcal{X}\times\mathcal{Y}$和服从这些分布的训练集和测试集，训练的过程就是使用训练集数据得到一个模型$h\in\mathcal{H}$使得训练集误差$E_{in}(h)$（经验风险）尽量小，而我们此时关心的问题是$h$在测试集的误差$E_{out}(h)$（期望风险）能否被限制在一个范围内。如果能，那么就说明这种训练是有效果的。我们定义**泛化误差GE(Generalization Error)**=$E_{out}(h)-E_{in}(h)$，并对GE进行限制。

### PAC理论
遗憾的是，我们没办法给出一个绝对的界，只能给出一个概率意义上的界。那么一般来说，我们会希望得到一个比较小的概率$\delta$和一个关于模型空间$\mathcal{H}$、训练集大小$n$和概率$\delta$的函数$\epsilon(\mathcal{H},n,\delta)$，使得$P(GE>\epsilon(\mathcal{H},n,\delta))<\delta$，即GE大概率要小于这个$\epsilon(\mathcal{H},n,\delta)$的函数值。这套语言称为Probably Approximately Correct (PAC) Theory。
### Hoeffding不等式
**适用条件：** 损失函数有界、数据相互独立（不是必须独立同分布）、决策空间维数有限。相反，如果对于无界的损失函数（比如均方误差的损失函数可能无限大）、数据之间不独立（比如时间序列数据和图数据）、假设空间为无限维（神经网络、SVM）的情况则不适用。
**基本形式：** 对于训练集样本$X_1,\dots,X_n(X_i\in[a_i,b_i])$这n个独立随机变量，其经验均值$\bar{X}=\frac1n\sum X_i$满足$P(\bar{X}-E(\bar{X})\geq\epsilon)\leq exp(-\frac{2n^2\epsilon^2}{\sum(b_i-a_i)^2})$和$P(E(\bar{X})-\bar{X}\geq\epsilon)\leq exp(-\frac{2n^2\epsilon^2}{\sum(b_i-a_i)^2})$。这个不等式被称为**Hoeffding不等式的均值形式**。
**扩展到模型空间$\mathcal{H}$：** 这里需要用到两个设定：
- $\bar{X}_n = E_{in}(h)$（经验风险）
- $E[\bar{X}_n] = E_{out}(h)$（真实风险）
那么就有$GE=E[\bar{X}_n]-\bar{X}_n$。对于一个有限维模型空间$\mathcal{H}$中的任意模型$h$，有$P\left(GE\geq\epsilon\right) \leq 2\exp(-2n\epsilon^2)$。但由于我们进行可行性分析的时候并没有训练结果$h$，所以我们需要考虑$\mathcal{H}$中最坏的情况$P(\max_{h \in \mathcal{H}} GE(h) \geq \epsilon)$，对这个max使用联合界(Union Bound)就有$P(\max GE(h) \geq \epsilon)= P(\bigcup_{h \in \mathcal{H}} \{GE(h) \geq \epsilon\})\leq \sum P\left(GE(h) \geq \epsilon\right)\leq \sum2\exp(-2n\epsilon^2)= 2m\exp(-2n\epsilon^2)$，其中$m=|\mathcal{H}|$。这时我们只需要令$2m\exp(-2n\epsilon^2) = \delta$即可解出$\epsilon = \sqrt{\frac{1}{2n}\ln\left(\frac{2m}{\delta}\right)}$。这表明$\forall h\in\mathcal{H},P\left(GE(h) < \sqrt{\frac{1}{2n}\ln\left(\frac{2m}{\delta}\right)}\right)>1-\delta$，这说明有极大的概率泛化误差GE会被这个上限限制住。
看起来这与中心极限定理有点像，但是中心极限定理要求样本数量n趋于无穷，而Hoeffding对任意的n都成立。

### VC维
好！现在我们已经解决了有限维假设空间中泛化误差的概率上界，接下来介绍成长函数和打散的概念以引出VC维的概念，来解决无限维假设空间中的问题。（此处仅解决二分类问题，其他问题需要用到其他妙妙数学工具进行推广）
**成长函数(Growth Function)**
定义$\mathcal{H}$中的一个线性分类器$h$对数据点作用得到的n元组$(h(x_1),\dots,h(x_n))$为一个二分，定义$\mathcal{H}(x_1,\dots,x_n)$为$\mathcal{H}$中所有$h$构成的二分的集合，定义$m_{\mathcal{H}}(n)=\max\limits_{x_1,dots,x_n\in\mathcal{X}}|\mathcal{H}(x_1,\dots,x_n)|$，这就是成长函数，其衡量了对于$\mathcal{X}$中的任意n个点，$\mathcal{H}$能形成的最大二分数量。显然$\forall\mathcal{H},n,m_{\mathcal{H}}(n)\leq 2^n$
**打散(shatter)：** 若 $\mathcal{H}(x_1​,\dots,x_n​)$ 包含了 $\{x_1​,\dots,x_n​\}$ 的子集 $S$ 的所有可能的二分，则称$\mathcal{H}(x_1​,\dots,x_n​)$**打散了(shatters)** S。例如 $\mathcal{H}(x_1​,\dots,x_n​)=\{(+1,−1,−1),(−1,+1,−1),(−1,+1,+1)\}$，则我们说 H shatter 了 $\varnothing,\{x_1\},\{x_2\},\{x_3\}$，但是更大的就不行了（例如 $\{x_1,x_2\}$）

接下来引入最终的概念：**VC维**
**目的：** 为无限维状态空间的二分类问题提供概率上界。
**定义：** VC 维数(Vapnik–Chervonenkis dimension) $\mathrm{VC}(\mathcal H)$ 为最大的 $n$ 使得存在 $n$ 个点被 $\mathcal H$ 完全打散（shatter）。或者说使得 $m_{\mathcal{H}}(n)=2^n$ 的最大的 n 被称为$\mathcal{H}$的 VC 维，记作 $d_{VC}(\mathcal{H})$。
**Sauer's Lemma:** $m_{\mathcal{H}}\leq\sum\limits_{i=0}^{d_{VC}}\tbinom{n}{i}$，显然我并不会证明。但是根据这个定理我们发现$m_{\mathcal{H}}=O(n^{d_{VC}})$，这使得成长函数直接由指数增长变为多项式增长！
**VC泛化界：** 
按照常理来讲，我们直接将$m_{\mathcal{H}}$带入到Hoeffding不等式的$m$中即可得到由VC维定义的泛化界。但是中间的数学过程似乎没那么容易，因此我们略去过程直接看结果：
$$
\forall h \in \mathcal{H},P\left(GE<\sqrt{\frac8n\log\frac{4m_{\mathcal{H}}(2n)}{\delta}}\right)=P\left(GE<O(d_{VC}\frac{\log n}n)\right)>1-\delta
$$
当$n\rightarrow\infty$时，$O(d_{VC}\frac{\log n}n)\rightarrow 0$。这样我们就得到了一个比较直观的形式：确实可以保证在训练集样本数n足够大的时候GE是有概率上界的。

## 07 高斯过程
