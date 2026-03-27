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
#### $\mathbb{SE}(3)$ and $\mathbb{SO}(3)$
SE(3) is the abbreviation of Special Euclidean group in 3 dimensions, it describes all rigid transformations in 3d space. SO(3) is a special orthogonal group, it describes all 3d rotations.
### Euler/ˈɔɪ:lər/ Angle
![[Pasted image 20260317001238.png]]
Rotation could be represented as:
$$R_x(\alpha)=\left[\begin{matrix}1 & 0 & 0 \\0 & \cos\alpha & -\sin\alpha \\0 & \sin\alpha & \cos\alpha\end{matrix}\right]$$
$$R_y(\beta)=\left[\begin{matrix}\cos\beta & 0 & \sin\beta \\0 & 1 & 0 \\ -\sin\beta & 0 & \cos\beta\end{matrix}\right]$$

$$R_z(\gamma)=\left[\begin{matrix}\cos\gamma & -\sin\gamma & 0 \\\sin\gamma & \cos\gamma & 0 \\0 & 0 & 1\end{matrix}\right]$$
So $R=R_z(\gamma)R_y(\beta)R_x(\alpha)$ could represent arbitrary rotation(yaw-pitch-row)
However, there're 2 problems with it.
1. **Gimbal Lock（万向节死锁）:**
For example, when $\beta=\pi/2$, $R=R_z(\gamma)R_y(\pi/2)R_x(\alpha)=\left[\begin{matrix}0 & 0 & 1 \\ \sin(\alpha+\gamma) & \cos(\alpha+\gamma) & 0 \\ -\cos(\alpha+\gamma) & \sin(\alpha+\gamma) & 0\end{matrix}\right]$, since changing $\alpha$ and $\gamma$ has the same effects, a degree of freedom disappears!
2. **Not Unique!**
### Quaternion
So, here we introduce **Quaternion**. 
<iframe src="https://krasjet.github.io/quaternion/quaternion.pdf" width="100%" height="600px" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>

Among the 4 types of rotation description method(Rotation Matrix, Euler Angle, Angle-Axis Parameterization of Rotation(轴角), Quaternion), Quaternion could easily calculating reverses and synthesis, and cover all space in SO(3).
#### Distance of Quaternions
On unit sphere $\mathcal S^3$, the angle between two quaternions $<p,q>=arccos(p\cdot q)$, this is easy to prove. And the distance between $p$ and $q$ is $dist(p, q)=2\min\{<p,q><p,-q>\}$. 
#### Slerp: Spherical Linear Interpolation
Why not linear interpolation? Because it need to be normalized, and does not have a constant rate of rotation. So we use Slerp: $q(t)=\frac{\sin((1-t)\theta)}{\sin\theta}q_1+\frac{\sin(t\theta)}{\sin\theta}q_2, \theta=arccos(q_1\cdot q_2)$
#### Uniform Sampling in $\mathbb{SO}(3)$
Sample a 4D vector from 4-dimension standard normal distribution $N(0,I_{4\times 4})$ and then normalize it, and get the **uniform quaternions**. We could prove this is same to sample from $\mathbb S(3)$. 
## Motion Planning
**Work space** is the real 3D physical space including robots, obstacles, objects etc. But we have to build a virtual space to describe the shape and joint constraint of the robot.
### Joint Configuration Space
Joint Configuration space ($\mathcal C$-space) is a subset of $\mathbb R^n$ containing all possible states of the system(state space in RL). $\mathcal C_{free}\subseteq\mathcal C$ contains all valid states, $\mathcal C_{obs}\subseteq\mathcal C$ represents obstacles. We could use joint configuration space to detect collision(碰撞) and do some other interesting things.
Comparing with **End-effector pose**: $\{R_{start}, T_{start}\}\rightarrow\{R_{goal}, T_{goal}\}$, **joint configuration space**: $q_{start}\rightarrow q_{goal}$ is less intuitive, but much better in collision detecting.
**A motion planning problem is a search problem in a high-dimensional constrained space**.
### Collision Check
Whether $q$ is in $\mathcal C_{free}$? Run collision check! 
However, precise collision check is so slow, we have to balance accuracy and speed. 
#### Convex Decomposition
One feasible method is to approximate every object as convex ones. Because convex-convex collision checking is usually very fast in cpu.
- Convex-Hull(凸包): get a single convex mesh, most efficient but not accurate.
- Exact Convex Decomposition: NP-hard, not practical. 
- Approximate Convex Decomposition(ACD, 近似凸分解): Determine a partition of the mesh triangles with a minimal number of clusters, while ensuring that each cluster has a concavity lower than a user defined threshold.
So two basic insight is **Grid-based Search** and **Sample-based Algorithm**, the latter is the mainstream method now in industry.
### Sample-based Algorithm
**Probabilistic Roadmap Method(PRM)** is an algorithm contains 2 stages: Map construction phase(sample and connect) and query phase(Dijkstra). 
**Rapidly-exploring Random Tree(RRT)** is an algorithm that balanced **Exploration vs Exploitation(探索与利用)**. 
To find the nearest neighbor in the tree, we may use KD-Tree. 
For more smooth path, we may use **Shortcutting**. 
## Control System
没听懂，占坑待填。
