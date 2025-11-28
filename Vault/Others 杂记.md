机器学习
# 01 — 线性回归（Linear Regression）

## 1.1 问题设定与建模动机

目标：给定样本集 $\{(x_i,y_i)\}_{i=1}^n$，其中 $x_i\in\mathbb{R}^d$（可含常数项），$y_i\in\mathbb{R}$。我们希望建立模型 $f(x;\theta)$ 使得预测 $\hat y$ 与真实 $y$ 接近。

线性回归假设模型是线性的：  
$$
y = x^\top \beta + \varepsilon,
$$  
其中 $\beta\in\mathbb{R}^d$（包含截距项时可在 $x$ 加 1），$\varepsilon$ 为噪声。常见噪声假设：独立同分布的高斯噪声 $\varepsilon\sim\mathcal N(0,\sigma^2)$。

来源：最小二乘（least squares）由高斯与勒让德在天文学中提出，用于拟合观测值；统计学上与最大似然估计（MLE）连接（噪声为高斯时）。

## 1.2 最小二乘法（OLS）及法方程推导

目标函数（平方损失）：  
$$
J(\beta) = \sum_{i=1}^n (y_i - x_i^\top\beta)^2 = |y-X\beta|_2^2,
$$  
其中 $X\in\mathbb{R}^{n\times d}$ 行为 $x_i^\top$，$y\in\mathbb{R}^n$。

对 $\beta$ 求导并设为零（正规方程）：  
$$
\frac{\partial J}{\partial \beta} = -2 X^\top(y-X\beta) = 0 \implies X^\top X \beta = X^\top y.
$$  
若 $X^\top X$ 非奇异（满秩，$\operatorname{rank}= d$），解为：  
$$
\hat\beta = (X^\top X)^{-1} X^\top y.
$$

证明该解为最小值： $J$ 是关于 $\beta$ 的二次凹（精确地说是凸）函数，Hessian 为 $2X^\top X$，半正定，若正定则为严格凸解唯一。

## 1.3 最小二乘与最大似然

假设噪声 $\varepsilon_i \overset{\text{iid}}{\sim} \mathcal{N}(0,\sigma^2)$，则  
$$
p(y|X,\beta) = \prod_{i=1}^n \frac{1}{\sqrt{2\pi\sigma^2}} \exp\Big(-\frac{(y_i-x_i^\top\beta)^2}{2\sigma^2}\Big).
$$  
对数似然：  
$$
\ell(\beta) = -\frac{n}{2}\log(2\pi\sigma^2) - \frac{1}{2\sigma^2}|y-X\beta|_2^2.
$$  
最大化 $\ell(\beta)$ 等价于最小化平方误差，因此 OLS 为噪声 Gaussian 下的 MLE。

## 1.4 统计性质（在经典线性模型假设下）

经典假设（Gauss-Markov）：

1. 线性： $y = X\beta + \varepsilon$
    
2. 外生性： $\mathbb{E}[\varepsilon|X]=0$
    
3. 同方差与无自相关： $\operatorname{Var}(\varepsilon|X)=\sigma^2 I$
    
4. $X$ 非随机或条件于 $X$ 考虑（或独立于 $\varepsilon$）
    

在这些假设下：

- 无偏性： $\mathbb{E}[\hat\beta|X]=\beta$。
    
- 方差： $\operatorname{Var}(\hat\beta|X)=\sigma^2 (X^\top X)^{-1}$。
    
- Gauss–Markov 定理：在所有线性无偏估计器中，OLS 具有最小方差（最佳线性无偏估计，BLUE）。
    

推导：由 $\hat\beta=(X^\top X)^{-1}X^\top y = \beta + (X^\top X)^{-1}X^\top\varepsilon$。取期望与方差即可得到上面结论。

MLE 的渐近性质（若噪声满足正态或一定正则条件）：$\hat\beta$ 渐近正态，协方差为信息矩阵逆等。

## 1.5 数值考虑：矩阵求逆与稳定算法

直接求逆 $(X^\top X)^{-1}$ 在 $X^\top X$ 条件数大时数值不稳定。常用方法：

- QR 分解： $X=QR$，其中 $Q$ 为正交矩阵，$R$ 上三角，则 $\hat\beta = R^{-1}Q^\top y$（数值更稳）。
    
- SVD 分解： $X = U\Sigma V^\top$，解为 $\hat\beta = V\Sigma^{-1}U^\top y$。可以处理奇异或近奇异情况（截断小奇异值 -> 截断 SVD / 正则化）。
    
- 迭代法：梯度下降、共轭梯度（当 $d$ 很大，$n$ 很大时更适合稀疏矩阵）。
    

## 1.6 正则化（偏差-方差权衡）

当 $X^\top X$ 近似奇异或过拟合时，引入正则化。

### 岭回归（Ridge / Tikhonov 正则化）

目标：  
$$
\min_\beta |y-X\beta|_2^2 + \lambda |\beta|_2^2, \quad \lambda\ge0
$$  
正规方程：  
$$
(X^\top X + \lambda I)\beta = X^\top y \implies \hat\beta_{\text{ridge}} = (X^\top X + \lambda I)^{-1} X^\top y.
$$  
岭回归可以看作贝叶斯先验 $\beta\sim \mathcal N(0,\tau^2 I)$ 下的 MAP 估计（$\lambda = \sigma^2/\tau^2$）。

### LASSO（(L_1) 正则化）

目标：  
$$
\min_\beta |y-X\beta|_2^2 + \lambda |\beta|_1.
$$  
非光滑，产生稀疏解。没有解析解，常用坐标下降、LARS、交替最小二乘等数值方法。LASSO 对变量选择有理论与实践吸引力，但其解的统计性质更复杂（例如需要满足正则条件如 Irrepresentable Condition）。

### 弹性网（Elastic Net）

结合 $L_1$ 与 $L_2$：$\alpha |\beta|_1 + (1-\alpha)|\beta|_2^2$。

## 1.7 预测与置信区间

给定新输入 $x_*$，预测值 $\hat y_* = x_*^\top \hat\beta$。预测的不确定性：

- 参数不确定性导致的方差： $\operatorname{Var}(\hat y_*|X) = x_*^\top \operatorname{Var}(\hat\beta) x_* = \sigma^2 x_*^\top (X^\top X)^{-1} x_*$。
    
- 若包含噪声，预测分布的方差为 $\sigma^2 + \sigma^2 x_*^\top (X^\top X)^{-1} x_*$。
    

基于正态性，可以构建置信区间与预测区间。

## 1.8 损失与评估指标

常见指标：均方误差 MSE、均方根误差 RMSE、平均绝对误差 MAE、$R^2$（决定系数）：  
$$
R^2 = 1 - \frac{\sum (y_i-\hat y_i)^2}{\sum (y_i-\bar y)^2}.
$$  
注意 $R^2$ 有过拟合偏向（随特征数量增加可能增大），常用调整 $R^2$。

## 1.9 与投影的几何解释

OLS 解 $\hat y = X\hat\beta$ 是 $y$ 在由列空间 $\mathcal{C}(X)$ 上的正交投影。残差向量 $r = y - X\hat\beta$ 与列空间正交，即 $X^\top r = 0$。

---

# 02 — 逻辑回归（Logistic Regression）

## 2.1 问题设定与动机

目标：二分类问题 $y\in\{0,1\}$，给定 $x\in\mathbb{R}^d$，要预测 $P(y=1|x)$。

线性模型直接输出 $x^\top\beta$ 但其值范围为 $(-\infty,\infty)$，不能直接用作概率。逻辑回归通过 Sigmoid（logistic）映射将实数映射到 $(0,1)$。

模型：  
$$
P(y=1|x) = \sigma(x^\top\beta) = \frac{1}{1+\exp(-x^\top\beta)}.
$$  
也写为对数几率（log-odds）为线性函数：  
$$
\log\frac{P(y=1|x)}{P(y=0|x)} = x^\top\beta.
$$

来源：统计学中的广义线性模型（GLM）家族，logistic 是对二项分布的 canonical link。

## 2.2 最大似然估计与损失函数

似然（条件独立样本）：  
$$
p(y|X,\beta) = \prod_{i=1}^n \sigma(x_i^\top\beta)^{y_i} [1-\sigma(x_i^\top\beta)]^{1-y_i}.
$$  
对数似然：  
$$
\ell(\beta) = \sum_{i=1}^n \big( y_i \log\sigma(x_i^\top\beta) + (1-y_i)\log(1-\sigma(x_i^\top\beta))\big).
$$  
负对数似然（交叉熵损失）：  
$$
J(\beta) = -\ell(\beta) = \sum_{i=1}^n \big( -y_i x_i^\top\beta + \log(1+\exp(x_i^\top\beta)) \big).
$$  
（这里使用了 $\log\sigma(t) = -\log(1+e^{-t})$ 等恒等变换。）

## 2.3 梯度与 Hessian（用于优化）

梯度（对 $\beta$）：  
$$
\nabla_\beta J(\beta) = -\sum_{i=1}^n x_i (y_i - \sigma(x_i^\top\beta)) = -X^\top (y - \sigma(X\beta)),
$$  
其中 $\sigma(X\beta)$ 表示逐元素的 sigmoid。

Hessian（二阶导）：  
$$
H(\beta) = X^\top W X,
$$  
其中 $W$ 为对角矩阵，$W_{ii} = \sigma(x_i^\top\beta) (1-\sigma(x_i^\top\beta))$。注意 $0<W_{ii}\le 1/4$。

这些表达式自然导出牛顿-拉弗森法（Newton-Raphson）以及 IRLS（Iteratively Reweighted Least Squares）的形式。

## 2.4 Newton/IRLS 推导

牛顿更新：  
$$
\beta^{(t+1)} = \beta^{(t)} - H(\beta^{(t)})^{-1} \nabla J(\beta^{(t)}).
$$  
代入梯度与 Hessian，变形得到：  
$$
\beta^{(t+1)} = (X^\top W X)^{-1} X^\top W z,
$$  
其中 $z = X\beta^{(t)} - W^{-1} ( \sigma(X\beta^{(t)}) - y)$ 称为“工作响应变量”。这个算法称为 IRLS，是广义线性模型常用的拟合方法（在样本数与维度均不极端大时非常有效）。

## 2.5 数值方法

因为负对数似然是凸函数（logistic 的损失是凸），因此可以用多种凸优化方法：

- 牛顿 / IRLS（收敛快，但每步需解线性系统，代价 $O(d^3)$ 或 $O(nd^2)$）。
    
- 一阶方法：批量梯度下降（BGD）、随机梯度下降（SGD）、迷你批 SGD、动量、Adam 等。
    
- L-BFGS（准牛顿，储存近似逆 Hessian，常用于中等维度问题）。
    

## 2.6 正则化（防止过拟合）

对参数加入正则项：

- (L_2) 正则化（Ridge 风格）：最小化 (J(\beta) + \frac{\lambda}{2}|\beta|_2^2)。这等价于贝叶斯先验 (\beta\sim\mathcal N(0,\tau^2 I)) 的 MAP。
    
- (L_1) 正则化（LASSO 风格）：可做特征选择，但求解更复杂（坐标下降常用）。  
    在实现中，正则化通常直接加到损失或在 Hessian/梯度中加入 (\lambda I) 修正。
    

## 2.7 概率解释与阈值化

得到 (P(y=1|x))，可按阈值（通常 0.5）分类或依据不同应用选择不同阈值以权衡精度/召回/其他指标。也可基于概率做风险最小化（给定不同类别损失）。

## 2.8 广义线性模型（GLM）背景

逻辑回归是 GLM 的一个例子：响应变量 (Y) 服从指数族分布（如二项分布），通过 link function（对数几率）将其均值 (\mu) 与线性预测 (X\beta) 连接。GLM 的拟合通常用 IRLS。

## 2.9 性能度量

二分类常见指标：准确率、精确率（Precision）、召回率（Recall）、F1、ROC 曲线与 AUC、对数损失（log-loss）。若类别不平衡，优先用 recall/precision/F1 或 PR 曲线。

## 2.10 可识别性与分离问题

若数据可线性分离，则最大似然解不存在（对数似然趋于 0，参数模长趋于无穷）。在实践中用正则化（尤其 (L_2)）或早停来避免这一问题。

---

# 03 — 偏差-方差分解（Bias–Variance Decomposition）

偏差-方差分解是理解泛化误差与模型复杂度权衡（欠拟合/过拟合）的重要工具。

## 3.1 问题与目标

考虑回归问题 $Y=f(X)+\varepsilon$，$\mathbb{E}[\varepsilon]=0$，$\operatorname{Var}(\varepsilon)=\sigma^2$。有训练数据集 $\mathcal D$（随机），基于 $\mathcal D$ 学习得到模型 $\hat f(x;\mathcal D)$。我们关注对固定 $x$ 的期望化均方误差：  
$$
\mathbb{E}_{\mathcal D,\varepsilon}\big[(Y - \hat f(x;\mathcal D))^2\big].
$$  
偏差-方差分解把该误差分解为偏差、方差和噪声三部分。

## 3.2 基本推导

固定 $x$，设真实 $y = f(x) + \varepsilon$，且 $\hat f(x)$ 是基于随机数据 $\mathcal D$ 的预测（随机变量）。考虑：  
$$
\mathbb{E}_{\mathcal D,\varepsilon}\big[(Y - \hat f(x))^2\big]  
= \mathbb{E}_{\mathcal D}\big[ \mathbb{E}_\varepsilon[(f(x)+\varepsilon - \hat f(x))^2 \mid \mathcal D] \big].  
$$  
对内部条件期望（$\varepsilon$ 与 $\mathcal D$ 独立，$\mathbb{E}[\varepsilon]=0$，$\operatorname{Var}(\varepsilon)=\sigma^2$）：  
$$
\mathbb{E}_\varepsilon[(f(x)+\varepsilon - \hat f(x))^2] = (f(x)-\hat f(x))^2 + \sigma^2.
$$  
把外部期望对 $\mathcal D$ 取，得到：  
$$
\mathbb{E}_{\mathcal D,\varepsilon}[(Y - \hat f(x))^2] = \mathbb{E}_{\mathcal D}[(\hat f(x)-f(x))^2] + \sigma^2.
$$  
再用平方误差的标准分解（把 $\mathbb{E}_{\mathcal D}[(\hat f - f)^2]$ 分为方差与偏差平方）：  
$$
\mathbb{E}_{\mathcal D}[(\hat f - f)^2] = \underbrace{(\mathbb{E}_{\mathcal D}[\hat f(x)] - f(x))^2}_{\text{bias}^2} + \underbrace{\mathbb{E}_{\mathcal D}[(\hat f(x)-\mathbb{E}_{\mathcal D}[\hat f(x)])^2]}_{\text{variance}}.
$$  
因此得到经典分解：  
$$
\boxed{\mathbb{E}_{\mathcal D,\varepsilon}[(Y - \hat f(x))^2] = \text{Bias}^2[\hat f(x)] + \text{Var}[\hat f(x)] + \sigma^2.}
$$

其中：

- $\text{Bias}[\hat f(x)] = \mathbb{E}_{\mathcal D}[\hat f(x)] - f(x)$；
    
- $\text{Var}[\hat f(x)] = \mathbb{E}_{\mathcal D}[(\hat f(x)-\mathbb{E}_{\mathcal D}[\hat f(x)])^2]$；
    
- $\sigma^2$ 为不可约误差（irreducible error，由噪声引起）。
    

## 3.3 直观解释

- 简单模型（低复杂度）通常偏差大（偏离真实 (f)），但方差小（对训练集变化不敏感）→ 欠拟合。
    
- 复杂模型（高复杂度）偏差小但方差大 → 过拟合。
    
- 总误差是两者与噪声的和。最优点在于使偏差与方差的和最小。
    

## 3.4 在线性回归中的具体计算（固定 (X) 分析）

考虑线性回归 OLS，数据形式 $y = X\beta + \varepsilon$。对于给定 $x_*$：  
$$
\hat f(x_*) = x_*^\top \hat\beta = x_*^\top (X^\top X)^{-1} X^\top y = S(x_*)^\top y,
$$  
这里 $S(x_*)^\top = x_*^\top (X^\top X)^{-1} X^\top$ 为一个线性投影。若把学习算法看成线性平滑（即 $\hat f = S y$，其中 $S$ 依赖于训练 $X$ 但条件于 $X$ 看为常数），则可以计算偏差与方差。

在外生噪声与模型假设正确时（真实函数在可表达空间中，即线性是正确模型），偏差为 0（无偏估计），方差为：  
$$
\operatorname{Var}(\hat f(x_*)) = \sigma^2 x_*^\top (X^\top X)^{-1} x_*.
$$

如果真实模型不在线性假设内部，则存在偏差项。

## 3.5 模型选择与交叉验证

偏差-方差分解提示用交叉验证（cross-validation）来估计泛化误差并进行模型选择（例如正则化强度 (\lambda)、多项式次数等），因为 CV 在有限样本上直接评估预测误差而不需要明确分解偏差与方差。

## 3.6 偏差-方差在分类问题中（延伸）

分类上（例如 0/1 损失）没有类似简单的解析分解，但可通过对概率估计器（例如 logistic 的 (\hat p(x))）的均方误差来进行偏差-方差分析，或通过 surrogate loss（可微、凸）进行近似分析。

## 3.7 正则化视角：减少方差，增加偏差

正则化（Ridge、LASSO）目的常被解释为通过引入偏差来减少方差，从而在有限样本下减少总误差。岭回归的偏差与方差可以用 SVD 做精确表达（见下）。

### 例：岭回归的偏差与方差表达（SVD 分解）

设 $X = U\Sigma V^\top$，其中 $\Sigma = \operatorname{diag}(\sigma_1,\dots,\sigma_r)$（奇异值），岭解可写：  
$$
\hat\beta_{\text{ridge}} = V (\Sigma^2 + \lambda I)^{-1} \Sigma U^\top y.
$$  
可据此展开偏差与方差的分量化权衡（在奇异空间方向上不同程度地缩减）。

# 04 — 支持向量机（Support Vector Machine，SVM）

## 4.1 来历与直觉

SVM 最初由 Vapnik 与同事在统计学习理论背景下提出，目标是二分类，通过在特征空间寻找能最大化类间间隔（margin）的线性分类器，从而提高泛化能力。可以看作结构风险最小化（SRM）思想在二分类线性分离情形的具体实现。

## 4.2 硬间隔线性 SVM（线性可分）

设训练样本 $\{(x_i,y_i)\}_{i=1}^n$，$y_i\in\{-1,+1\}$，目标寻找超平面 $\{x: w^\top x + b = 0\}$。对于线性可分数据，要求所有点正确分类且到超平面的“几何间隔”不小于某正数。

几何间隔定义（点 $x$ 相对于 $(w,b)$）：  
$$
\gamma_i = \frac{y_i (w^\top x_i + b)}{|w|}.
$$  
最小几何间隔为 $\gamma = \min_i \gamma_i$。我们想最大化 $\gamma$。等价地固定缩放使得功能间隔 $\hat\gamma = \min_i y_i (w^\top x_i + b) = 1$（常用规范化），则最大化 $\gamma = 1/|w|$ 等价于最小化 $\tfrac{1}{2}|w|^2$（常数因子便于导数）。因此硬间隔 SVM 的优化问题为：  
$$
\begin{aligned}  
&\min_{w,b}\ \frac{1}{2}|w|^2\\  
&\text{s.t. }\ y_i (w^\top x_i + b) \ge 1,\quad i=1,\dots,n.
\end{aligned}  
$$  
这是一个凸二次规划（QP），唯一解存在（若数据线性可分）。

### 对偶与拉格朗日

构造拉格朗日函数（用拉格朗日乘子 $\alpha_i\ge0$）：  
$$
\mathcal L(w,b,\alpha) = \frac{1}{2}|w|^2 - \sum_{i=1}^n \alpha_i [y_i(w^\top x_i + b) - 1].
$$  
对 $(w,b)$ 求极小，对 $\alpha$ 求极大（鞍点）。设梯度为零：

- $\partial \mathcal L / \partial w = 0 \Rightarrow w = \sum_{i=1}^n \alpha_i y_i x_i$。
    
- $\partial \mathcal L / \partial b = 0 \Rightarrow \sum_{i=1}^n \alpha_i y_i = 0$。
    

将 $w$ 代回得到对偶问题（只关于 $\alpha$）：  
$$
\begin{aligned}  
&\max_{\alpha}\ \sum_{i=1}^n \alpha_i - \frac{1}{2}\sum_{i,j} \alpha_i \alpha_j y_i y_j x_i^\top x_j\\  
&\text{s.t. }\ \alpha_i \ge 0,\ \sum_{i=1}^n \alpha_i y_i = 0.
\end{aligned}  
$$  
这是标准的二次规划（凸优化，目标为凹函数最大化），解得 $\alpha^\star$。然后 $w^\star = \sum_i \alpha_i^\star y_i x_i$。支持向量是对应 $\alpha_i^\star > 0$ 的训练点（KKT 条件显示其他点的约束不紧）。

截距 $b$ 可通过满足等式的支持向量得到：对任一支持向量 $x_s$（严格支持向量满足 $y_s(w^\top x_s + b)=1$），可解 $b = y_s - w^\top x_s$。通常取多个支持向量平均提升稳定性。

### KKT 条件

KKT 条件给出原问题与对偶最优之间必要充分条件（此处凸问题）：

1. 原可行性： $y_i(w^\top x_i + b) -1 \ge 0$。
    
2. 对偶可行性： $\alpha_i \ge 0$。
    
3. 互补松弛： $\alpha_i [y_i(w^\top x_i + b) -1] = 0$（若 $\alpha_i>0$ 则相应约束为紧约束）。
    
4. 梯度为零： $w = \sum_i \alpha_i y_i x_i$，$\sum_i \alpha_i y_i = 0$。
    

从互补松弛看出只有支持向量（处于间隔边界的点）有 (\alpha_i>0)。

## 4.3 软间隔 SVM（处理不可分与噪声）

对真实数据常不完全线性可分，引入松弛变量 $\xi_i\ge0$ 允许违反间隔，并在目标中惩罚。常用形式（C-参数）：  
$$
\begin{aligned}  
&\min_{w,b,\xi}\ \frac{1}{2}|w|^2 + C\sum_{i=1}^n \xi_i\\  
&\text{s.t. }\ y_i(w^\top x_i + b) \ge 1 - \xi_i,\quad \xi_i \ge 0.
\end{aligned}  
$$  
其中 $C>0$ 是惩罚系数，控制间隔与误差的权衡（等价于正则化强度的倒数）。另一常见写法是用松弛损失（hinge loss）：  
$$
\min_{w,b}\ \frac{1}{2}|w|^2 + C\sum_{i=1}^n \max(0,1 - y_i(w^\top x_i + b)).
$$  
Hinge loss $\ell_{\text{hinge}}(t) = \max(0,1-t)$ 是凸函数，在 SVM 中作为经验风险项。

### 对偶形式（软间隔）

拉格朗日与对偶推导类似，得到对偶问题（约束变为 $0\le \alpha_i \le C$）：  
$$
\begin{aligned}  
&\max_{\alpha}\ \sum_i \alpha_i - \frac{1}{2}\sum_{i,j}\alpha_i\alpha_j y_i y_j x_i^\top x_j\\  
&\text{s.t. }\ 0\le \alpha_i \le C,\ \sum_i \alpha_i y_i = 0.
\end{aligned}  
$$  
注意上界 $C$ 限制了 $\alpha$，对应 KKT 的互补条件表明分类错误或位于间隔内的点会有 $\alpha_i = C$。

## 4.4 核技巧（非线性 SVM）

若数据在原始输入空间线性不可分，可以通过映射 $\phi: \mathcal X \to \mathcal H$（高维或无限维特征空间）使其线性可分，然后在 $\mathcal H$ 上构造线性 SVM。直接计算 $\phi(x)$ 可能开销大，但对偶问题只需要内积 $\phi(x_i)^\top \phi(x_j)$。若存在核函数 $k(x,x') = \langle\phi(x),\phi(x')\rangle$，即可避免显式映射。

把 $x_i^\top x_j$ 替换为 $k(x_i,x_j)$（以及预测时 $w^\top \phi(x) = \sum_i \alpha_i y_i k(x_i,x)$），得到核 SVM。常用核：线性核、多项式核、高斯（RBF）核 $k(x,x')=\exp(-|x-x'|^2/(2\sigma^2))$、sigmoid 核等。Mercer 定理给出核矩阵必须半正定作为合法核的必要条件。

核方法能把 SVM 扩展到强大的非线性分类器。决策函数形式：  
$$
f(x) = \sum_{i=1}^n \alpha_i y_i k(x_i, x) + b.
$$

## 4.5 SVM 的泛化解释与 SRM

SVM 的间隔最大化可以与结构风险最小化联系起来：间隔越大，对应分类器在假设空间（例如线性函数族）下的复杂度（如VC维）越低，从而可能得到更好的泛化。Vapnik 的理论给出基于间隔和训练样本数的泛化界（略后学习理论部分详细）。

## 4.6 算法实现要点

- 常用求解器：QP 求解器、序列最小优化（SMO）、坐标下降、梯度下降于原始问题（对大规模问题可用近似或随机化方法）。
    
- SMO（Platt）：把全 QP 分解为一系列仅涉及两个 (\alpha) 的子问题，利用解析解高效更新；适合中等规模 SVM。
    
- 对大样本（$n$ 很大）和高维数据，核 SVM 的训练与预测开销（需要核矩阵或支持向量集合）可能成为瓶颈，于是使用线性 SVM（如 Pegasos，LibLinear）、随机优化或核近似（随机特征映射）来扩展。
    
- 参数选择：核参数（如 RBF 的 (\sigma)）和 (C) 常用交叉验证（CV）选择。
    
- 缩放/规范化特征通常重要：核（尤其 RBF）对特征尺度敏感。
    

## 4.7 常见变体与扩展

- 多分类：一对多（one-vs-rest）、一对一（one-vs-one）、直接多类 SVM（Crammer-Singer）。
    
- 不平衡类别：调整 (C) 的类权重，或使用代价敏感 SVM。
    
- 结合概率输出：SVM 原始输出不是概率，常用 Platt scaling（后处理用 sigmoid 拟合输出）或交叉验证拟合概率校准。
    
- SVM 回归（SVR）：用 (\varepsilon)-insensitive 损失构造的回归算法。
    
- 在线/随机 SVM：Pegasos（基于随机梯度下降解决带正则化的 hinge 损失）。
    

---

# 05 — 表示定理（Representer Theorem）

## 5.1 背景与结论（直观）

在再生核希尔伯特空间（RKHS）中，很多带正则化的经验风险最小化问题（比如核方法）有一个重要性质：最优解可以表示为训练样本核函数的线性组合。表示定理（Kimeldorf & Wahba 等）正式说明了这一点，使得无限维优化问题实际上可在 $n$ 维空间内求解（系数个数为样本数 $n$）。

常见形式：若要最小化  
$$
\min_{f\in\mathcal H} \sum_{i=1}^n L(y_i, f(x_i)) + \lambda \, \Omega(|f|_{\mathcal H}),  
$$  
其中 $\mathcal H$ 为 RKHS，$L$ 为任意损失函数（对 $f$ 仅依赖于 $f(x_i)$），$\Omega$ 是严格单调增函数（例如 $\Omega(t)=t^2$），则最优解 $f^\star$ 存在且可写为  
$$
f^\star(\cdot) = \sum_{i=1}^n \alpha_i k(x_i,\cdot).
$$

## 5.2 RKHS 与再生性质（定义回顾）

RKHS $\mathcal H$ 是带内积的函数空间，使得评价功能连续并存在核函数 $k:\mathcal X\times\mathcal X\to\mathbb R$，满足：

1. 对每个 $x$，$k(x,\cdot)\in\mathcal H$。
    
2. 再生性（reproducing property）：对任意 $f\in\mathcal H$，$f(x) = \langle f, k(x,\cdot)\rangle_{\mathcal H}$。
    

核 $k$ 是对称半正定函数（Mercer kernel）。

范数 $|f|_{\mathcal H}$ 表示函数复杂度，常见正则项使用 $|f|_{\mathcal H}^2$。

## 5.3 表示定理的证明（常见证明）

我们证明在上述优化问题中存在最优解且最优解位于由核函数在训练点生成的闭子空间上。

设优化问题：  
$$
\min_{f\in\mathcal H} J(f) := \sum_{i=1}^n L(y_i, f(x_i)) + \lambda \, \Omega(|f|_{\mathcal H}).  
$$  
令 $\mathcal H_0 = \operatorname{span}\{k(x_i,\cdot): i=1,\dots,n\}$（有限维子空间），其正交补为 $\mathcal H_0^\perp$。任意 $f\in\mathcal H$ 可唯一分解为 $f = f_0 + f_\perp$，其中 $f_0\in\mathcal H_0, f_\perp\in\mathcal H_0^\perp$。

再生性保证对每训练点 $x_i$，  
$$
f(x_i) = \langle f, k(x_i,\cdot)\rangle = \langle f_0, k(x_i,\cdot)\rangle + \langle f_\perp, k(x_i,\cdot)\rangle.
$$  
但 $k(x_i,\cdot)\in\mathcal H_0$，因此 $\langle f_\perp, k(x_i,\cdot)\rangle = 0$。所以对所有训练点，$f(x_i) = f_0(x_i)$。即 $f_\perp$ 对经验损失项无影响。

而正则项通常依赖于 $|f|_{\mathcal H}$。 由于正交分解并且（若 $\Omega$ 为单调函数如 $\Omega(t)=t^2$），  
$$
|f|_{\mathcal H}^2 = |f_0|_{\mathcal H}^2 + |f_\perp|_{\mathcal H}^2 \ge |f_0|_{\mathcal H}^2,
$$  
并且若 $\Omega$ 单调，$\Omega(|f|)\ge \Omega(|f_0|)$。因此对任意 $f$，用 $f_0$ 代替会得到不更大的目标值（相同经验损失、更小或相等正则化）。所以必有最优解可选在 $\mathcal H_0$ 内部。由线性代数，任何 $f_0\in\mathcal H_0$ 可写为线性组合 $f_0(\cdot)=\sum_{i=1}^n \alpha_i k(x_i,\cdot)$。证毕。

（若 $\Omega$ 是任意严格增函数而非平方也成立；更一般条件见文献。）

## 5.4 应用与意义

- 表示定理是核方法（核岭回归、核 SVM、Gaussian process 等）基石：将无限维优化简化为求解 $n$ 个系数 $\alpha$ 的问题（或求解核矩阵相关的线性/二次问题）。
    
- 在算法实现上，构造核矩阵 $K_{ij}=k(x_i,x_j)$，然后例如核岭回归的解为 $\alpha = (K + \lambda I)^{-1} y$，预测为 $f(x)=k_x^\top \alpha$，其中 $k_x = [k(x_1,x),\dots,k(x_n,x)]^\top$。
    
- 但当 $n$ 很大时，表示定理也带来计算与存储负担（$O(n^2)$ 存储 $K$），需用低秩近似或稀疏方法（稀疏核近似、Nyström 方法、随机特征映射）来扩展。
    

---

# 06 — 学习理论（Learning Theory）

这一节集中说明机器学习中泛化能力的形式化理论：PAC 学习、VC 维数、泛化界（Hoeffding、VC 估计）、Rademacher 复杂度、结构风险最小化、样本复杂度下界等。将给出主要定理、推导要点与直觉。

## 6.1 设定与目标

统计学习设定：有未知分布 $\mathcal D$ 在 $\mathcal X\times\mathcal Y$ 上，训练集 $S=\{(x_i,y_i)\}_{i=1}^n$ i.i.d. 从 $\mathcal D$ 采样。学习器选取假设 $h$ 从假设空间 $\mathcal H$（例如分类器集合）以最小化期望风险（真风险）：  
$$
L_{\mathcal D}(h) = \mathbb{E}_{(x,y)\sim\mathcal D}[\ell(h(x),y)].  
$$  
但我们只能计算经验风险（训练误差）：  
$$
L_S(h) = \frac{1}{n}\sum_{i=1}^n \ell(h(x_i),y_i).  
$$  
目标是建立 $L_S(h)$ 到 $L_{\mathcal D}(h)$ 的一致收敛界（uniform convergence），从而保证泛化。

## 6.2 集中不等式（Hoeffding 等）

首先，独立同分布情形下，对固定假设 $h$，用 Hoeffding 不等式可得对 0/1 损失或有界损失的偏差界。

令随机变量 $Z_i = \ell(h(x_i),y_i)$ 且 $Z_i\in[a,b]$。则 Hoeffding 不等式给出：  
$$
\Pr\Big( \big|L_S(h) - L_{\mathcal D}(h)\big| \ge \epsilon \Big) \le 2\exp\Big(-\frac{2n\epsilon^2}{(b-a)^2}\Big).  
$$  
这是固定 $h$ 的集中界。要对所有 $h\in\mathcal H$ 同时成立需要做并集界或更精细的复杂度控制。

## 6.3 VC 维数与二分类的泛化界

VC 维数（Vapnik–Chervonenkis dimension）是衡量二分类假设空间 $\mathcal H$ 复杂度的标量度量，定义为：$\mathrm{VC}(\mathcal H)$ 为最大的 $n$ 使得存在 $n$ 个点被 $\mathcal H$ 完全打散（shatter）。

基本统一界（Vapnik）给出：对于 0/1 损失的情形，若 $\mathrm{VC}(\mathcal H)=d$，则对任意 $\delta\in(0,1)$，以概率至少 $1-\delta$，对所有 $h\in\mathcal H$：  
$$
L_{\mathcal D}(h) \le L_S(h) + O\Big(\sqrt{\frac{d\log(n/d) + \log(1/\delta)}{n}}\Big).  
$$  
更具体的陈述（Vapnik–Chervonenkis 不等式 / Sauer 引理配合 Hoeffding）给：  
$$
L_{\mathcal D}(h) \le L_S(h) + \sqrt{\frac{8}{n}\Big( d\log\frac{2en}{d} + \log\frac{4}{\delta} \Big)}.  
$$  
这个界说明样本数 $n$ 需要与模型复杂度 $d$ 成正比以保证泛化。

### 推导大纲（概念性）

- 用 Sauer 引理界定假设空间在 $n$ 点上的最大划分数（growth function）$S_{\mathcal H}(n) \le \sum_{i=0}^d \binom{n}{i} \le (en/d)^d$。
    
- 对于每一种划分使用 Hoeffding 给集中界，再对至多 (S_{\mathcal H}(n)) 种划分做并集界（乘以该数量的概率），取对数并解出误差项。
    

## 6.4 PAC 学习与样本复杂度

PAC（Probably Approximately Correct）学习框架定义了可学习性的概念：一个概念类 $\mathcal H$ 在 0/1 损失下是 PAC 可学的，当存在算法和多项式函数使得对于任意分布 $\mathcal D$，任意 $\epsilon,\delta\in(0,1)$，样本数 $n(\epsilon,\delta)$ 多项式规模足够大能保证学习出一个 $h$ 使得 $L_{\mathcal D}(h)\le \epsilon$ 且以概率至少 $1-\delta$。VC 维数有限当且仅当完全可学（在分离或噪声情形下需细化）。

样本复杂度下界与上界都可用 VC 维数表达：大致 $n = \Theta\big(\tfrac{d + \log(1/\delta)}{\epsilon^2}\big)$（0/1 损失）或 $1/\epsilon$ 的因子在某些情形不同。

## 6.5 Rademacher 复杂度（更细致的数据依赖度量）

Rademacher 复杂度是数据依赖的函数类复杂度度量，常给出更紧的泛化界并适用于实值函数与任意损失（通过 contraction lemma）。

定义：给定样本 $S=(x_1,\dots,x_n)$，类 $\mathcal F$ 的经验 Rademacher 复杂度为  
$$
\hat{\mathfrak R}_S(\mathcal F) = \mathbb{E}_\sigma\Big[ \sup_{f\in\mathcal F} \frac{1}{n}\sum_{i=1}^n \sigma_i f(x_i) \Big],  
$$  
其中 $\sigma_i$ 为独立 Rademacher 随机符号（各取 $\pm1$ 等概率）。期望 Rademacher 复杂度为对样本的期望 $\mathfrak R_n(\mathcal F) = \mathbb{E}_S[\hat{\mathfrak R}_S(\mathcal F)]$。

### 泛化界（Rademacher）

对于有界损失 $\ell\in[0,1]$ 并定义损失类 $\mathcal L = \{ (x,y) \mapsto \ell(f(x),y) : f\in\mathcal F\}$，以概率至少 $1-\delta$，对所有 $f\in\mathcal F$：  
$$
L_{\mathcal D}(f) \le L_S(f) + 2\hat{\mathfrak R}_S(\mathcal L) + 3\sqrt{\frac{\log(2/\delta)}{2n}}.  
$$  
若损失是 $L$-Lipschitz 关于 $f(x)$，可以用 contraction lemma 将 $\hat{\mathfrak R}_S(\mathcal L)$ 与 $\hat{\mathfrak R}_S(\mathcal F)$ 关联，得到：  
$$
L_{\mathcal D}(f) \le L_S(f) + 2L\hat{\mathfrak R}_S(\mathcal F) + 3\sqrt{\frac{\log(2/\delta)}{2n}}.  
$$  
Rademacher 复杂度能更细地反映数据分布与样本性质（例如在低噪声或稀疏情形下界更紧）。

### 举例：线性函数类的 Rademacher 上界

考虑 $\mathcal F = \{x\mapsto w^\top x: |w|\le B\}$，并假设 $|x_i|\le R$。则  
$$
\hat{\mathfrak R}_S(\mathcal F) \le \frac{BR}{\sqrt{n}}.  
$$  
推导利用 Cauchy-Schwarz 与对称性：$\sup_{|w|\le B} \frac{1}{n}\sum \sigma_i w^\top x_i = \frac{B}{n}|\sum \sigma_i x_i|$ 并对 $\sigma$ 取期望得到 $\le B\sqrt{\sum |x_i|^2}/n \le BR/\sqrt{n}$。

这解释了线性模型泛化与 (1/\sqrt{n}) 速率与范数约束（正则化）如何发挥作用。

## 6.6 结构风险最小化（SRM）

SRM 思想：按复杂度对假设空间分层 $\mathcal H_1 \subset \mathcal H_2 \subset \dots$，对每一层求经验风险最优，并通过复杂度惩罚选择使训练误差与复杂度的和最小，从而达到良好泛化。VC 理论和 Rademacher 提供了可用于构造惩罚项的理论基础。

## 6.7 泛化下界（不可学的限制）

学习不是总能高效完成，存在信息论性质的下界：对于某些复杂假设类，样本复杂度必须至少按某一速度增长（依赖于 VC 维数等）才能达到给定精度与置信。具体下界通常通过构造一组难以区分的分布与参数集合并用 Fano 或 Le Cam 不等式证明。

## 6.8 一致收敛与可学习性

关键结论之一：假设空间 $\mathcal H$ 对于某损失函数呈现一致收敛（uniform convergence）——即 $\sup_{h\in\mathcal H} |L_S(h)-L_{\mathcal D}(h)| \to 0$ 随 $n\to\infty$ 以概率收敛 —— 则经验风险最小化（ERM）可学（泛化性能保证）。VC 有限是二分类一致收敛的充分必要条件。

## 6.9 基于核与正则化的泛化（RKHS 视角）

对于在 RKHS 中做正则化学习（例如核岭回归、核 SVM），有基于核特征范数的泛化界，通常形式为：  
$$
L_{\mathcal D}(f) \le L_S(f) + O\Big(|f|_{\mathcal H} \, \sqrt{\tfrac{\mathrm{Tr}(K)}{n}}\Big) + \text{small term},  
$$  
或更常见使用 Rademacher 复杂度 / 稳定性方法得出与 $|f|_{\mathcal H}$ 和样本数 $n$ 相关的界。简言之，RKHS 的范数作为复杂度控制，与核矩阵特征值有关（effective dimension）。

## 6.10 一些重要工具与不等式（陈列）

- Hoeffding 不等式（有界独立随机变量集中）：用于固定假设的界。
    
- McDiarmid 不等式（敏感性界）：用于函数对单个样本改变不敏感时的集中界。
    
- Talagrand 不等式与 Bernstein 不等式：提供更精细的界，在方差可控时给更好的速率。
    
- Symmetrization 与 Rademacher 技巧：将泛化差距转化为 Rademacher 复杂度。
    
- Covering numbers / Metric entropy：另一类度量函数类复杂度的工具，可用于导出 VC 风格的界。
    

## 6.11 示例：从 VC 到 SVM 的间隔界（粗略）

Vapnik 给出的一个间隔界：对于线性分类器在单位球内（假设 $|x|\le R$），若最大化得到间隔 $\gamma$，则 VC 维数约束满足 $d_{VC} \le \min\{R^2/\gamma^2,\, \text{dim}\}$。因此分类器的泛化误差上界会包含项 $\sqrt{(R^2/\gamma^2)\log n / n}$。这解释了间隔与泛化的联系：增大间隔（或减小 $|w|$）可以降低泛化误差界。

## 6.12 现代观点与深度学习（简要指引）

- 传统学习理论（VC、Rademacher）非常适用于线性/核方法与简单模型，但对深度学习等过参数化模型的解释仍在活跃研究中：过参数化网络在训练误差为零时仍能泛化良好（与古典复杂度度量的矛盾），现代研究引入规范化隐式偏好（例如 SGD 的隐式正则化）、路径长度、神经网络的线性化 (NTK) 与稳定性/算法相关的复杂度度量等来解释。
    
- 若需深入可继续扩展：stability-based bounds、margin distributions、sharpness/flatness、PAC-Bayesian bounds 等。

# 07 — 高斯过程（Gaussian Processes, GP）

## 7.1 动机：从线性回归到无限维核方法

回归问题中，我们常假设  
$$
f(x) = w^\top \phi(x),  
$$  
并对 $w$ 放置高斯先验 $w\sim\mathcal N(0,\Sigma_p)$。  
若取 $\phi(x)$ 维度趋向无限（例如对应某种核函数），则对应的函数空间为 **高斯过程**：  
$$
f(x) \sim \mathcal{GP}(m(x), k(x,x')),
$$  
其中

- $m(x) = \mathbb{E}[f(x)]$
    
- $k(x,x') = \operatorname{cov}(f(x), f(x'))$。
    

**高斯过程是对函数的分布**：任取有限点 $(x_1,\dots,x_n)$，对应的函数值向量  
$$
(f(x_1),\dots,f(x_n)) \sim \mathcal{N}(m, K),  
$$  
其中 $K_{ij} = k(x_i,x_j)$。

---

## 7.2 后验推导（核心公式）

观测模型：  
$$
y_i = f(x_i) + \varepsilon_i, \qquad \varepsilon_i \sim \mathcal N(0,\sigma^2).  
$$

令训练集输入为 $X$，测试点为 $x_*$。  
定义  
$$
f_* = f(x_*).  
$$

联合分布（由 GP 定义）为：  
$$
\begin{pmatrix} y \\ f_* \end{pmatrix}  
\sim \mathcal N\left(  
\begin{pmatrix} m(X) \\ m(x_*) \end{pmatrix},  
\begin{pmatrix}  
K(X,X)+\sigma^2 I & K(X,x_*) \\  
K(x_*,X) & K(x_*,x_*)  
\end{pmatrix}  
\right).  
$$

根据多元正态的条件分布公式，有后验预测分布：  
$$
f_*|X,y,x_* \sim \mathcal N(\mu_*, \sigma_*^2),  
$$  
其中  
$$
\mu_* = m(x_*) +  
K(x_*,X)[K(X,X)+\sigma^2I]^{-1}(y-m(X)),  
$$  
$$
\sigma_*^2 = K(x_*,x_*) - K(x_*,X)[K(X,X)+\sigma^2I]^{-1}K(X,x_*).  
$$

若只预测观测 $y_*$，则还需加上 $\sigma^2$。

---

## 7.3 常见核函数

核函数决定了 GP 所表达的函数先验的“光滑性”与复杂度。

### (1) RBF / SE (Squared Exponential) 核

$$
k(x,x') = \sigma_f^2\exp\left(-\frac{|x-x'|^2}{2\ell^2}\right)  
$$  
具有无限可微、极度平滑的先验。

### (2) Matérn 核

$$
k_\nu(r)=\sigma_f^2\frac{2^{1-\nu}}{\Gamma(\nu)}\left(\sqrt{2\nu}\frac r\ell\right)^\nu K_\nu\left(\sqrt{2\nu}\frac r\ell\right)  
$$  
用于控制光滑性（$\nu$ 越大越光滑）。

### (3) 线性核、周期核、有理二次核等。

---

## 7.4 对数似然与超参数学习

似然函数（边际似然）：  
$$
p(y|X,\theta)=\mathcal N(0,K_\theta+\sigma^2I).  
$$  
对数似然：  
$$
\log p(y|X)=-\frac12y^\top(K+\sigma^2I)^{-1}y-\frac12\log|K+\sigma^2 I|-\frac n2\log2\pi.  
$$  
可通过梯度下降、L-BFGS 优化 $\theta=(\ell,\sigma_f,\sigma)$。

---

## 7.5 复杂度问题

GP 的主要瓶颈：

- 训练需要 $O(n^3)$（矩阵求逆）
    
- 存储需要 $O(n^2)$
    

因此现代 GP 常用稀疏近似（sparse GP, inducing points）、核逼近等方法。

---

# 08 — 树模型（Decision Trees）

## 8.1 动机

基于特征空间分区的模型，易解释、不需要数据归一化，可处理非线性与交互特征。

---

## 8.2 CART（Classification and Regression Trees）

### 划分准则

对于回归：选分裂点 $s$，使得  
$$
\min_{s} \left( \sum_{x_i\in L(s)} (y_i-\bar y_L)^2 + \sum_{x_i\in R(s)} (y_i-\bar y_R)^2 \right).  
$$

对于分类：使用

- Gini 指数：  
    $$
    G(t)=\sum_{k} p_{tk}(1-p_{tk})  
    $$
    
- 或 entropy：  
    $$
    H(t)= -\sum_{k} p_{tk}\log p_{tk}.  
    $$
    

选择能最大化 impurity decrease 的分裂特征与阈值。

---

## 8.3 剪枝（Pruning）

避免过拟合：  
代价复杂度剪枝  
$$
C_\alpha(T)=C(T)+\alpha|T|,  
$$  
其中 $|T|$ 为叶子数量。  
从大树开始剪枝，选最优子树。

---

## 8.4 树模型的性质

- 不稳定（方差高）
    
- 非参数
    
- 对不规则结构很强
    
- 可解释（路径 = 决策规则）
    

---

# 09 — 集成学习（Ensemble Learning）

## 9.1 动机

通过组合多个弱模型，减少方差/偏差，提升泛化能力。

主要类别：

1. Bagging（减少方差）
    
2. Boosting（减少偏差）
    
3. Stacking（组合学习器）
    

---

## 9.2 Bagging（Bootstrap Aggregating）

核心思想：对训练集进行自助采样（bootstrap），训练多个独立模型（决策树常用），最后取平均或投票。

### 随机森林（Random Forest）

Bagging + 随机特征子集选择。

每次分裂选取 $m \le d$ 个特征候选。可显著减少树间相关性，从而减少方差。

---

## 9.3 Boosting：从加法模型 + 前向分步学习推导

### 9.3.1 加法模型

我们构造预测函数  
$$
F_M(x)=\sum_{m=1}^M \gamma_m h_m(x),  
$$  
其中 $h_m$ 是弱学习器。

### 9.3.2 前向分步学习

最小化  
$$
\min_{\gamma_m,h_m} L(y, F_{m-1}(x)+\gamma_m h_m(x)).  
$$

### 9.3.3 AdaBoost 推导（指数损失）

取指数损失  
$$
L(y,F)=\exp(-yF),\quad y\in\{-1,1\}.  
$$

可推得样本权重更新：  
$$
w_i^{(m+1)} = w_i^{(m)}\exp(-\alpha_m y_i h_m(x_i)),  
$$  
其中  
$$
\alpha_m = \frac12 \log\frac{1-\epsilon_m}{\epsilon_m}.  
$$

Boosting 的本质：逐步逼近 additive model 的最优方向。

---

## 9.4 Gradient Boosting（梯度提升）

### 9.4.1 核心思想

Boosting = 在函数空间进行梯度下降  
目标：  
$$
\min_F \sum_{i=1}^n L(y_i,F(x_i)).  
$$

每步拟合负梯度：  
$$
r_{im} = -\left[ \frac{\partial L(y_i,F(x_i))}{\partial F(x_i)} \right]_{F=F_{m-1}}.  
$$

用树 (h_m(x)) 拟合这些残差。  
学习率 (\nu) 控制步长。

---

## 9.5 XGBoost / LightGBM / CatBoost

现代 Boosting 模型加入

- 二阶泰勒展开
    
- 正则项（树复杂度）
    
- 高效分裂搜索
    
- 直方特征
    
- GOSS、Leaf-wise 生长等改进
    

---

# 10 — 无监督学习（Unsupervised Learning）

## 10.1 聚类（Clustering）

### 10.1.1 K-means

目标：  
$$
\min_{C_1,\dots,C_K} \sum_{k=1}^K\sum_{x_i\in C_k} |x_i-\mu_k|^2.  
$$  
迭代：分配→更新中心。

等价于最小化平方误差 → 与高斯模型关系密切（见 GMM）。

---

### 10.1.2 高斯混合模型（GMM）

假设  
$$
p(x)=\sum_{k=1}^K \pi_k \mathcal{N}(x|\mu_k,\Sigma_k).  
$$

使用 EM 算法：  
E 步：计算责任度  
$$
\gamma_{ik}=\frac{\pi_k \mathcal{N}(x_i|\mu_k,\Sigma_k)}{\sum_j \pi_j \mathcal{N}(x_i|\mu_j,\Sigma_j)}.  
$$  
M 步：更新 $\pi_k,\mu_k,\Sigma_k$。

---

## 10.2 降维（Dimension Reduction）

### 10.2.1 PCA

通过最大化方差等价于求协方差矩阵 $S$ 最大特征值方向。  
推导：  
$$
\max_{|w|=1} w^\top S w.  
$$

### 10.2.2 Probabilistic PCA

假设 latent variable $z\sim \mathcal N(0,I)$，  
$$
x = W z + \mu + \varepsilon,\quad \varepsilon\sim\mathcal N(0,\sigma^2I).  
$$

EM 得到解析解，连接 PCA 与 factor analysis。

---

## 10.3 Manifold Learning

- Isomap（基于 geodesic 距离）
    
- LLE（保持局部线性重构）
    
- t-SNE、UMAP（厚重使用于可视化）
    

---

# 11 — 生成式模型（Generative Models）

## 11.1 基础：显式 vs 隐式模型

- **显式密度模型**：能写出 $p(x)$，如
    
    - 可积：VAE、流模型（Normalizing Flows）
        
    - 不可积但有能量：EBM
        
- **隐式模型**：能采样但不能直接评估密度，如 GAN。
    

---

# 11.2 变分自编码器（VAE）

## 11.2.1 潜变量模型

假设潜变量 $z\sim p(z)$，生成分布 $p_\theta(x|z)$。  
目标最大化边缘似然：  
$$
\log p_\theta(x) = \log\int p_\theta(x|z)p(z)dz.  
$$  
积分不可解 → 引入近似分布 $q_\phi(z|x)$。

---

## 11.2.2 ELBO 推导（核心）

使用 Jensen：  
$$
\log p_\theta(x)=\log\int q_\phi(z|x)\frac{p_\theta(x|z)p(z)}{q_\phi(z|x)}dz  
$$  
$$
\ge  
\mathbb{E}_{q_\phi(z|x)}[\log p_\theta(x|z)] -  
\operatorname{KL}(q_\phi(z|x) \,\|\, p(z)).  
$$

这称 ELBO。

---

## 11.2.3 重参数化技巧

为了对 $q_\phi(z|x)$ 采样并反向传播：  
若  
$$
q_\phi(z|x)=\mathcal N(\mu_\phi(x),\sigma_\phi^2(x)I),  
$$  
则  
$$
z = \mu_\phi(x) + \sigma_\phi(x)\odot\varepsilon,\quad \varepsilon\sim\mathcal N(0,I).  
$$

---

# 11.3 GAN（Generative Adversarial Network）

## 11.3.1 原始 GAN

对抗损失：  
$$
\min_G\max_D \mathbb{E}_{x\sim p_{\text{data}}}[\log D(x)] +  
\mathbb{E}_{z\sim p(z)}[\log(1-D(G(z)))].  
$$

推导可得：  
在最优判别器 $D^*$ 下，  
$$
V(G) = -\log 4 + 2 \operatorname{JS}(p_{\text{data}}\,\|\,p_G).  
$$

---

## 11.3.2 WGAN

用 Wasserstein 距离替换 JS：  
$$
W(p,q)=\sup_{|f|_L\le 1} \mathbb{E}_{x\sim p}[f(x)]-\mathbb{E}_{x\sim q}[f(x)].  
$$

基于 Kantorovich-Rubinstein 对偶，引入 1-Lipschitz critic（用 weight clipping 或 gradient penalty）。

---

# 11.4 Flow-based Models（流模型）

显式可积分模型，构造可逆变换  
$$
x = f_\theta(z), \quad z\sim p(z).  
$$  
密度由 Jacobian 给出：  
$$
\log p(x) = \log p(z) - \log|\det J_f(z)|.  
$$

典型如 RealNVP、Glow。

---

# 11.5 Diffusion Models（扩散模型）

## 11.5.1 正向扩散

将真实数据逐步加噪：  
$$
q(x_t|x_{t-1})=\mathcal N(\sqrt{1-\beta_t} x_{t-1}, \beta_t I).  
$$

可直接得出便捷公式：  
$$
q(x_t|x_0)=\mathcal N(\sqrt{\bar\alpha_t} x_0, (1-\bar\alpha_t)I).  
$$

---

## 11.5.2 反向扩散（生成）

用神经网络 $\epsilon_\theta(x_t,t)$ 预测噪声，从而近似  
$$
p_\theta(x_{t-1}|x_t).  
$$

训练目标：  
$$
L(\theta)=\mathbb{E}_{t,x_0,\epsilon}|\epsilon - \epsilon_\theta(x_t,t)|^2.  
$$

数学上连接 **得分匹配（score matching）**、**SDE**、**Fokker–Planck 方程**、**Schrödinger bridge** 等深层理论。

