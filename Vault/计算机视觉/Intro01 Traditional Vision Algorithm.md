## Filters
### Linear Filtering
现在我们希望对图片进行一些处理，结合我们已有知识，我们希望使用信号处理的常用手段——滤波，扩展到二维，来进行图片的处理。此处我们只研究线性滤波。
从数学的角度理解，滤波器（filter）可看作一个映射函数$\mathcal{G}$，它的输入是图片（二维离散信号），输出也是图片。若滤波器$\mathcal{G}$属于线性时不变（LTI）滤波器，则其运算规则可表示为卷积形式： $h[i,j] = (f * g)[i,j] = \sum\limits_{m=-\infty}^{+\infty}\sum\limits_{n=-\infty}^{+\infty}f[m,n]g[i-m,j-n]$ 其中$f$为输入图片（二维像素矩阵），$h$为输出图片，$g$称为该卷积型滤波器$\mathcal{G}$的卷积核（也常称滤波器核）。而非线性滤波器（如中值滤波、双边滤波）的运算规则并非卷积，因此无“卷积核”这一概念。
具体的卷积运算方法既可以通过将卷积核生成 Toeplitz 矩阵（或循环矩阵）转化为矩阵乘法实现，也可以利用卷积定理转换为频域点乘高效计算。（卷积定理的直观理解就是：在时域中卷积就等于在频域中乘积）
事实上，我们去噪使用的低通滤波器就是一个人为指定weight的filter，而卷积神经网络中的卷积核本质上就是一个可学习权重的filter。
### Nonlinear Filtering: Binarization  via Thresholding
卷积是线性的滤波器，对图片进行的是一个线性操作。为了表示任意函数，我们需要非线性的处理，最简单的就是带阈值的二值化。
## Task: Edge Detection
### Criteria for Optimal Edge Detection
定义$$Precision=\frac{TP}{TP+FP}, Recall=\frac{TP}{TP+FN}$$
来表示准确率和召回率，作为边缘检测的标准。此外还需要定义什么是True，即Good Localization(在真实边缘附近)和Single Response Constraint(每个边缘只被检测一次)。
### Smoothing by Gaussian Filter
我们意识到直接图片中可能处处存在噪声，需要先对图片进行预处理去噪。简单来说，相比于均值卷积核(Box Filter)，高斯卷积核(Gaussian Kernel)可以保留更多边缘细节，使得去噪更平滑。此外我们还可以通过调节标准差$\sigma$来调整Gaussian Filter的滤波效果，高$\sigma$意味着较好的去除噪声和更强的平滑，但边缘会模糊；低$\sigma$保留更多细节和边缘，但对噪声更加敏感。
### Reduce Redundant Responses
我们使用非极大值抑制(Non-Maximal Suppression, NMS)算法来抑制多余的边界线，使我们得到的边界线为单像素宽度。
理论上，我们需要通过双线性插值来确定每个方向上的梯度。但实际上，只需要用周围的8个点近似一下梯度就可以了🤓
### Hysteresis Thresholding for Edge Linking
使用高阈值(maxVal)开始边缘曲线，若低于低阈值(minVal)则停止，通过这个来连线。这种有两个阈值的二值化称为滞回阈值(hysteresis thresholding)。

在应用了以上算法之后，我们得到了传统边缘检测的集大成者：**Canny Edge Detector**.
## Task: Keypoint Detection
### Harris Corner
滑动窗口，水平方向和垂直方向的位移分别是$u$和$v$，定义强度差异函数$D(x, y)=[I(x+u, y+v)-I(x, y)]^2$表示像素点在这一滑动窗口下的敏感性。再定义窗口函数$w(x, y)=\begin{cases}&1, -b<x, y<b\\ &0, else\end{cases}$，用于限制计算到局部区域（类似掩码）。于是就有$E_{x_0, y_0}(u, v)=\sum\limits_{(x,y)\in N(x_0,y_0)}[I_(x+u, y+v)-I(x,y)]^2=\sum\limits_{(x,y)\in N(x_0,y_0)}D_{u,v}(x,y)=(D_{u,v}*w)_{x_0,y_0}$，这样我们就得到了$E(u,v)=[u,v]\left[\begin{matrix}I_x^2*w & I_xI_y*w \\ I_xI_y*w & I_y^2*w\end{matrix}\right]\left[\begin{matrix}u \\ v\end{matrix}\right]=[u,v]R^{-1}\left[\begin{matrix}\lambda_1 & 0 \\ 0 & \lambda_2\end{matrix}\right]R\left[\begin{matrix}u \\ v\end{matrix}\right]=\lambda_1u_R^2+\lambda_2v_R^2$，其中R是正交矩阵。从而定义**Harris角点响应函数**$R=det(M)-k(trace(M))^2$，其中k是经验值，一般在0.04~0.06之间。最终R为较大的正值说明其为角点，较大负值说明是边缘，绝对值较小说明为平坦区域。此外，可以把硬窗口w换成高斯窗口或者别的，可以获得各向同性。
> 使用Gaussian Filter时，我们说卷积核是**Rotation Invariant**的，而卷积操作是**Translation Equivariant**的。
## Task: Line Fitting
### Least Squares Method, LSM
### RANSAC
**RANSAC: RANdom SAmple Consensus(随机抽样一致算法)** 即随机取两个点确定一条直线，确定所有点中与直线距离小于阈值的inlier的比例，选取最高的直线即可。这个过程可以并行化，所以比较快。
具体来讲，我们根据抽样时全部fail的概率p确定一个抽样次数$k>\frac{\log(1-p)}{\log(1-w^n)}$，其中w为先验知识占比，即inlier占总点数的比例。
### SVD Optimization
得到三个点确定的平面之后，可以根据inlier的分布来优化平面。一个很成熟的做法是SVD分解，将所有inliers齐次化成矩阵$\mathbf{X}_h = \begin{bmatrix} x_1 & y_1 & z_1 & 1 \\ x_2 & y_2 & z_2 & 1 \\ \vdots & \vdots & \vdots & \vdots \\ x_n & y_n & z_n & 1 \end{bmatrix}$，目标函数可以写成矩阵形式：$\min_{\mathbf{p}} \|\mathbf{X}_h \mathbf{p}\|^2 \quad \text{且} \quad \|\mathbf{p}\| = 1$。对 $\mathbf{X}_h$ 做 **SVD（奇异值分解）**：$\mathbf{X}_h = \mathbf{U} \cdot \mathbf{\Sigma} \cdot \mathbf{V}^T$。
其中：
- $\mathbf{\Sigma}$ 是对角矩阵，对角线上的奇异值 $\sigma_1 \ge \sigma_2 \ge \sigma_3 \ge \sigma_4 \ge 0$ 从大到小排列；
- $\mathbf{V}$ 是正交矩阵，列是“右奇异向量”。
由于正交矩阵不改变向量长度，$\|\mathbf{X}_h \mathbf{p}\|^2 = \|\mathbf{\Sigma} \mathbf{V}^T \mathbf{p}\|^2$。
要让这个值最小，且 $\|\mathbf{p}\|=1$，只需让 $\mathbf{V}^T \mathbf{p}$ 只在**最小奇异值 $\sigma_4$ 对应的位置**为1，其余为0。
此时所求的 $\mathbf{p}$ 就是 $\mathbf{V}$ 的**最后一列**（对应最小奇异值的右奇异向量）。
### Hough Transform
”其实就是把一条直线从实际空间的表示转换到参数空间的表示. 但是如果存在垂直的直线,可能需要考虑使 用极坐标来作为参数空间。“初步的理解好像是转换到参数空间然后让所有的点投票选最优平面，具体的没看懂，占坑待填。