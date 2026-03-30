## DETR论文精读
### 核心文件
#### main.py
- 程序入口
##### def main()
先parse参数，在main函数中打印git版本SHA。设置随机数种子（确保能稳定复现）、DETR模型、损失函数、后处理模块（如将输出格式转化维COCO）、设备、模型参数、优化器、训练集和验证集及其BatchSampler和DataLoader、输出目录。
开始训练：记录时间、（打乱数据）、进行一轮训练、更新学习率调度器、评估并保存结果。
#### engine.py
- 单次训练和评估
##### def train_one_epoch()
在训练循环中，先将图片和标签搬到gpu上，然后输入model，计算不同criterion并加权求和得到总损失，再利用总损失进行反向传播（先清零再更新梯度，再加入梯度裁剪防止梯度爆炸，最后更新模型参数）。这里可以增加一个安全机制，就是如果损失变为NaN或无穷大则直接退出训练。最后记录当前训练情况并返回。
##### def evaluate()
使用@torch.no_grad()修饰器，不计算梯度。其他逻辑与训练相同。
#### models/detr.py
主模型和损失函数
##### class DETR
DETR是核心类，其中的参数有：
- backbone: 卷积骨干网络（默认是ResNet50）
- transformer: 字面意思
- class_embed: 一个线性分类器，作为transformer的输出分类头
- bbox_embed: 一个3层MLP，简单的把做好的分类映射为4维框坐标
- query_embed: 一个embedding层，作为transformer的查询向量，是本工作的核心
- input_proj: 1* 1卷积，负责降维
- aux_loss: 一个布尔参数
##### def DETR.forward()
- 先将普通张量转为嵌套张量方便mask
- 然后通过backbone拿到features和pos
- 分解最后一层特征为特征图和掩码（最后一层包含低分辨率高语义的特征，当时只分解最后一层导致在小目标上检测结果下降，后续改进方法有的会对多个层进行分解）
- 将特征图降维并输入transformer，得到的transformer的输出中包含物体的特征（输入数据包含的是图的特征）
- 对每个查询做输出分类，并MLP映射为框的坐标，返回
##### class SetCriterion
SetCriterion用于计算损失
- matcher是匹配器，执行匈牙利匹配
- weight_dict是权重字典，用于存储各项损失所占权重
##### def SetCriterion.loss_labels()
根据匹配结果交叉熵计算标签损失
##### def SetCriterion.loss_cadinality()
仅用于日志，不参与训练
##### def SetCriterion.loss_boxes()
用GloU损失计算匹配结果的真实框和预测框之间的误差
##### def SetCriterion.loss_maskes()
计算掩码重叠度带来的损失，仅分割任务启用
##### def SetCriterion.forward()
- 先匈牙利匹配得到模型输出框
- 调用函数计算各项损失
- 归一化，并返回
##### class PostProcess
后处理，将框的格式转为COCO的评估格式
##### class MLP
用于边界回归的简单感知机，学习一个映射
##### def build()
根据超参构建模型和损失函数的实例并返回
#### models/backbone.py
这里面的几个类都是相当于CNN的接口，好像通过某种方式使得
- 可以微调，也就是论文中的仅调整低分辨率高语义的层
- 微调时冻结norm的某些统计量实现某种功能（没看懂）
- 在device上不会有多余的拷贝和转移
具体没看懂，感觉相当于CNN和整体的架构之间的一个接头
#### models/position_encoding.py \& models/transformer.py
经典ViT架构，好像没什么改动(?)
#### models/matcher.py
匈牙利匹配
#### models/segmentation.py
将任务从目标检测扩展为语义分割