## Kinematics of Rigid Bodies and Articulated Objects
### Rigid Transformation
6D rigid Transformation $$p^s=R^s_{s\rightarrow b}p^b+t^s_{s\rightarrow b}$$
this formula means that in Coordinate System $\mathcal{F}_s$, the position of point s, namely $p^s$, is the position of s in $\mathcal{F}_b$, namely $p^b$, multiply Rotation $R_{s\rightarrow b}^s$ plus Translation $t_{s\rightarrow b}^s$.
### Link and Joint
- **Links** are the rigid-body connected in sequence
- **Joints** are the connectors between links
- **The degree of freedom(DoF)** of a mechanical system is the number of independent parameters that define its configuration
### Homogenous Coordinates
However, $(R_{s\rightarrow b}^s, t_{s\rightarrow b}^s)$ is not a Linear Transformation. So we have to define Homogeneous Coordinate for 3D space $\tilde{X}=\left[\begin{matrix}x\\1\end{matrix}\right]\in\mathbb R^4$, Homogeneous Transformation Matrix $T_{s\rightarrow b}^s=\left[\begin{matrix}R_{s\rightarrow b}^s & t_{s\rightarrow b}^s \\ 0 & 1 \end{matrix}\right]\in\mathbb{R}^4$, then wo have $\tilde{X}^s=T_{s\rightarrow b}^s\tilde{X}^b$, that's a great form.
### Multi-Link Rigid-Body Geometry
此处有一个例子用于演示简单多连杆刚体结构的形态变换矩阵变换，但是我太懒了没有记，只需要注意坐标$X$全都表示$[x, y, z, 1]\in\mathbb R^4$即可。
### Parameterize the pose of each joint
There's two representations of the end-effector:
- **Joint space(joint angles/joint configurations/configuration space)**: The space in which each coordinate is a vector of joint poses(angles around joint axis)
- **Cartesian space(operation space)**: The space of rigid transformations of the end-effector by $(R_{s\rightarrow e}, t_{s\rightarrow e})$, where $\mathcal F_e$ is the end-effector frame.
In addition, **reachable space** is defined by **transformation matrix**, and **dexterous space** is the space that the object could reach in reality.
**Forward Kinematics(FK)** maps the joint space coordinate $\theta\in\mathbb R^n$ to a transformation matrix $T$:$$T_{s\rightarrow e}=f(\theta)$$Calculated by composing transformations along the kinematic chain.
**Inverse Kinematics(IK)** is more useful and more challenging. Generally, Pieper's criterion is used to determine whether a closed-form inverse kinematics solution exists for a 6-DOF robotic arm which is faster($\mu s$ level delay), but unfortunately, sometimes we have to use some kind of numerical methods with Jacobian(with a $ms$ level delay). 
### $\mathbb{SE}(3)$ and $\mathbb{SO}(3)$
SE(3) is the abbreviation of Special Euclidean group in 3 dimensions, it describes all rigid transformations in 3d space. SO(3) is a special orthogonal group, it describes all 3d rotations.
### Euler/ˈɔɪ:lər/ Angle
![[Pasted image 20260317001238.png]]
Rotation could be represented as:
$$R_x(\alpha)=\left[\begin{matrix}1 & 0 & 0 \\0 & \cos\alpha & -\sin\alpha \\0 & \sin\alpha & \cos\alpha\end{matrix}\right]$$
$$R_y(\beta)=\left[\begin{matrix}\cos\beta & 0 & \sin\beta \\0 & 1 & 0 \\ -\sin\beta & 0 & \cos\beta\end{matrix}\right]$$

$$R_z(\gamma)=\left[\begin{matrix}\cos\gamma & -\sin\gamma & 0 \\\sin\gamma & \cos\gamma & 0 \\0 & 0 & 1\end{matrix}\right]$$
So $R=R_z(\gamma)R_y(\beta)R_x(\alpha)$ could represent arbitrary rotation(yaw-pitch-row)
However, there're 2 problems with it.
1. **Gimbal Lock:**
For example, when $\beta=\pi/2$, $R=R_z(\gamma)R_y(\pi/2)R_x(\alpha)=\left[\begin{matrix}0 & 0 & 1 \\ \sin(\alpha+\gamma) & \cos(\alpha+\gamma) & 0 \\ -\cos(\alpha+\gamma) & \sin(\alpha+\gamma) & 0\end{matrix}\right]$, since changing $\alpha$ and $\gamma$ has the same effects, a degree of freedom disappears!
2. **Not Unique!**
### Quaternion
So, here we introduce **Quaternion**. 
<iframe src="https://krasjet.github.io/quaternion/quaternion.pdf" width="100%" height="600px" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>
## Motion Planning
### Configuration Space
Configuration space ($\mathcal C$-space) is a subset of $\mathbb R^n$ containing all possible states of the system(state space in RL). $\mathcal C_{free}\subseteq\mathcal C$ contains all valid states, $\mathcal C_{obs}\subseteq\mathcal C$ represents obstacles.