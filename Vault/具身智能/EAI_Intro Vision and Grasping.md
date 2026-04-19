## Grasping
- **Grasping** is the process of restraining an object’s motion in a desired way by applying forces and torques at a set of contacts. 
- **Grasp Synthesis** is a high-dimensional search or optimization problem to find gripper poses or joint configurations. 
- **Grasp Pose** defines the position, orientation and the articulation(关节连接) of a hand. (For **4-DoF grasp**, there's a 3D position and 1D hand orientation aligned with the direction of gravity, a.k.a. **top-down grasping**. As for **6-Dof grasp**, it's defined by a 3D position and 3D orientation. )
There're 2 paths for Open-Loop Grasping: 
1. For known objects with labeled grasps:
	- 6D object pose estimation.
	- Further get grasping pose from object pose.
	- Motion planning to achieve grasping pose.
2. For unknown and general objects:
	- Directly estimate grasping pose.
	- Motion planning to achieve grasping pose.
### Instance-level 6D Object Pose Estimation
Pose is defined for each instance according to their CAD model. To know the pose of a instance, we need to know the internal reference of the camera, the size of the instance to avoid ambiguity(歧义), and symmetry(对称性). Input RGB/RGBD(D means depth) data, and use **PoseCNN** to get the pose.
#### Iterative Closest Point(ICP)
ICP is a method for point cloud registration. It takes two point clouds as input and computes an **R&T matrix** that transforms one point cloud to align with the other as closely as possible.
$$\hat{R}, \hat{T} = \text{argmin}\Vert Q−(RP+T)\Vert^2_F\quad, R\in\mathbb{SO}(3), T\in \mathbb R^3, Q\in \mathbb R^{3\times n}, P\in R^{3\times n}$$
这里有一堆数学推导，占坑待填。
#### Rotation Regression
Rotation Regression is a method to estimate Rotation with input image using Neural Network, it's called regression because it's a task to estimate a continuous variable(连续变量). 
Since other methods has different forms of numerical instability for deep learning, we use rotation matrix again😂. 
First we consider 6D rotation matrix in $\mathbb{SO}(3)$, it's restricted by Gram-Schmidt Orthogonalization. It's not friendly for neural network, because it's hard to design loss function for a matrix with factitious orthogonalization, and numerical instability. 
(说实话我还是不太理解为什么直接6D不适合神经网络，好像就是因为施密特正交化在神经网络中引入了非线性的操作导致无法收敛。)
9D rotation matrix is better, we use SVD and other math tricks to ensure stability in numerical analysis and neural network. 
#### Pose Fitting
Task: Given a RGBD(3D-3D) or RGB(2D-3D) image, for each pixel of the object, predict the 3D coordinate of this pixel on the object CAD model(object coordinates), to build the correspondence. 
##### Orthogonal Procrustes Problem
Orthogonal Procrustes Problem(正交Procrustes问题，是一种对齐问题) is used to solve/fit R. It has a very beautiful close-form solution. 
……此处省略一大堆数学推导……
But it's sensitive to outliers, we could use RANSAC to optimize it. 
### Category-level 6D Object Pose Estimation
ICP is highly independent on prior knowledge, which makes it hard to generalize. So here we introduce **Normalized Object Coordinate Space(NOCS)**. Through normalizing the rotation, translation and scale of a object, we could better rebuild the 7-DoF object pose. 
#### Normalized Object Coordinate Space(NOCS)
#### Mix Reality Data
### Grasp
