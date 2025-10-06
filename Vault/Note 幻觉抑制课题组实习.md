幻觉抑制课题组实习
# 线下
## Day1
开会。
1. 课题拆解：
	- Agent发展概况：RAG范式、workflow范式、Agent范式
	- Agent框架：李殿龙、姚顺宇、COALA
	- 幻觉本质：有损压缩，模型本质是对关联模式的编码而非对事实的编码
	- 优化方法：结构化prompt、长短期记忆、暴露置信度、复盘式自检
	![[attachments/Pasted image 20250814112022.png]]
2. Agent行动模块与ACI(Agent-Computer Interface)
	- 案例分析：SWE-Agent、MindFlow、Auto-GPT、ChatDev
	- 行动模块：动作简单性、动作效率性
3. 竞品分析报告
	- 确实挺不错的，有旁听组会的味道了，区别是能听懂（
## Day2、3、4
熟悉环境、跑代码、旅游
## Day5
参观一线工作环境，为进厂上班做好准备(x
真正生产线上LLM由于其不稳定性并没有得到很好的应用。真正参与生产的还是传统的机器学习和统计学算法。
## Day6
讲了一些Agent框架
1. MindFlow+：
2. ReAct框架：
3. Decision Transformer：

读完了一些论文，包括Agent框架、强化学习、测试集、模型微调等。
## Day7
1. 应用框架
	- 讲解了传统机器学习（老框架）在产业中的应用，包括语句编码、相似度排序等。
	- 目前准备融入LLM方法（新框架）的可能，比如上下文改写、用大模型训练小模型等。
2. Agent长期记忆
## Day8
1. 程序性知识SOP（Standard Operation Procedure）
	- 与RAG相对比，什么地方更好，什么地方可以借鉴。
> 在作报告时，介绍相关项目+观点（或者说讲自己或别人的故事）会比讲类型、应用、前景等一堆很浅的概念更好，一方面更有吸引力，另一方面听者更能问出问题来。

2. 领域模型和领域Agent
	- 微调框架：MOE、知识蒸馏、PPL、llama
	- 微调技术：LoRA、DoRA、QLoRA
		LoRA通过低秩矩阵分解实现微调，参数效率高（仅更新0.1%-1%参数）；显存占用低，适合单卡微调；通用性强，广泛支持各类模型。
		将LoRA的适配矩阵进一步分解为幅度和方向两部分独立优化。可以解耦权重学习，提升微调精度。在同等参数量下表现优于LoRA。
		4-bit量化冻结原模型，极致显存压缩支持更大模型的微调。
	![[attachments/Pasted image 20250815110132.png]]
## Day9、10、11、12
定下了课题：Agent长短期记忆。随机看论文。到处溜达。

# 线上
## MindFlow项目文件阅读
### src 文件夹

#### 1. **[utils.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 基础工具模块

**作用**：提供项目的基础工具函数和路径配置

- [root_path](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html), [src_path](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：定义项目根路径和源码路径
- [load_prompt_from_yaml()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：从 YAML 文件加载提示词模板
- [object_to_dict()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：递归将对象转换为字典，避免循环引用

#### 2. **[agent_types.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 数据结构定义模块

**作用**：定义项目中所有核心数据结构的 Pydantic 模型

- [RunConfig](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：运行配置类，包含模型、环境、策略、温度、MCP端口等参数
- [Action](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、`Task`、`SolveResult`：定义 Agent 执行过程中的动作、任务和结果
- [EnvResponse](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[RewardResult](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：定义环境响应和奖励机制相关的数据结构

#### 3. **[online_llm_call.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 大模型 API 调用模块

**作用**：统一管理多个大模型服务的 API 调用

- **支持的模型**：Azure OpenAI (GPT-3.5/4)、Qwen、Doubao、DeepSeek V3
- **核心类**：[OnlineLLMApi](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 封装了各个模型的客户端和调用方法
- **统一接口**：[llm_generate_response()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 提供统一的模型调用入口
- **配置管理**：包含各模型的 API Key、端点 ID、基础 URL 等配置信息

#### 4. **[utils_encrypt_only.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 单例测试与加密通信模块

**作用**：提供加密的手动测试接口，用于与后端服务通信

- **加密/解密**：使用 AES 加密算法处理敏感数据传输
- **测试接口**：[get_answer()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 函数模拟真实的客服对话场景
- **数据格式化**：构造标准的请求格式（包含上下文、商品信息、订单信息等）
- **应用场景**：单轮/多轮对话测试、多模态图像处理测试

#### 5. **agent_multi_tool_call_mcp_midea.py** - 美的定制版 MCP Agent (核心)

**作用**：基于 OpenAI Agents SDK 和 MCP 协议的主动式工具调用 Agent

- **核心流程**：实现 ReAct 模式的"思考→工具调用→回答"两阶段处理
- **MCP 集成**：通过 [MCPManager](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 连接工具服务，支持动态工具调用
- **Prompt 管理**：从 YAML 文件加载思考和回答的提示词模板
- **异步处理**：[agent_active_tool_call()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 异步方法处理完整的对话流程
- **消息转换**：将不同格式的消息转换为 OpenAI Agents SDK 可接受的格式

#### 6. **[agent_multi_tool_call_mcp.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 通用版 MCP Agent

**作用**：与美的版类似，但使用通用的提示词模板

- **简化版本**：相比美的版，只有回答阶段，没有思考阶段
- **通用配置**：使用 `agent_general_prompt_template.yaml` 而非美的专用模板
- **核心功能**：同样基于 OpenAI Agents SDK 和 MCP 协议

#### 7. **[agent_multi_tool_call_active.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 基于 Tau-bench 的主动式 Agent

**作用**：使用自定义的 [AgenticToolCallingAgent](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 实现主动式工具调用

- **并发工具调用**：预先并发执行商品、订单、物流三个工具获取信息
- **背景信息融合**：将工具调用结果作为背景信息注入到对话中
- **性能优化**：通过 [ThreadPoolExecutor](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 实现工具的并发执行
- **时间统计**：详细记录各个工具的执行时间

#### 8. **[agent_multi_tool_call_negative.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 被动式工具调用 Agent

**作用**：基于传统 API 调用方式的被动式工具调用实现

- **预处理模式**：在对话开始前就获取所有可能需要的信息
- **模板驱动**：使用 Jinja2 模板进行响应生成
- **简化流程**：不进行动态工具选择，而是一次性获取所有工具信息
- **FastAPI 集成**：包含 Web API 接口定义

#### **9. agents_list/** - Agent 实现类

- [agentic_tool_calling_agent.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：实现基于工具调用的智能 Agent 类
- [base_agent.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：定义 Agent 的基础接口

#### **10. envs_list/** - 环境管理模块

- [__init__.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：环境工厂函数 [get_env()](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)，根据环境名创建对应环境实例
- [general_real/](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：通用真实环境实现，包含工具定义、MCP 管理器、系统提示词等

#### **11. tools_list/** - 工具定义模块

- [mcp_manager.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)：MCP 服务器连接管理器，封装 SSE 连接
- [product_info_tool.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[order_info_tool.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、`logistics_info_tool.py` 等：各种具体工具的实现
- `tool_base.py`：工具基础接口定义
- `tool_def.py`：工具定义和注册

### 项目架构总结

这个 [src](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 文件夹实现了一个**分层架构的多模态电商客服 Agent 系统**：

1. **底层**：[utils.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[agent_types.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 提供基础设施
2. **LLM 层**：[online_llm_call.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 统一大模型访问
3. **工具层**：[tools_list/](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 提供各种电商相关工具
4. **环境层**：[envs_list/](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 管理执行环境和工具组合
5. **Agent 层**：多个 `agent_multi_tool_call_*.py` 提供不同策略的 Agent 实现
6. **测试层**：[utils_encrypt_only.py](vscode-file://vscode-app/c:/Users/16534/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 提供加密测试接口

整个系统支持**主动式**和**被动式**两种工具调用模式，以及**MCP 协议**和**传统 API** 两种工具集成方式，为电商客服场景提供了灵活可扩展的 AI Agent 解决方案。