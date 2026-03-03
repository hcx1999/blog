杂记
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

