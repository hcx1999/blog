## Grasping
- **Grasping** is the process of restraining an object’s motion in a desired way by applying forces and torques at a set of contacts. 
- **Grasp Synthesis** is a high-dimensional search or optimization problem to find gripper poses or joint configurations. 
**Grasp Pose** defines the position, orientation and the articulation(关节连接) of a hand. For **4-DoF grasp**, there's a 3D position and 1D hand orientation aligned with the direction of gravity, a.k.a. **top-down grasping**. As for **6-Dof grasp**, it's defined by a 3D position and 3D orientation. 
### 6D Object Pose
3D-Translation and 3D-Rotation.
#### Instance-level 6D Object Pose Estimation
Pose is defined for each instance according to their CAD model. To know the pose of a instance, we need to know the internal reference of the camera, the size of the instance to avoid ambiguity(歧义), and symmetry(对称性). 
- Input: RGB/RGBD()
#### PoseCNN
#### Iterative Closest Point(ICP)
ICP is a method for point cloud registration. It takes two point clouds as input and computes an R & T matrix that transforms one point cloud to align with the other as closely as possible.
#### Category-level 6D Object Pose Estimation
