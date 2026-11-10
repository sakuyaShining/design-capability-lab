# Design Capability Lab

DCL-001 · v0.3 · 应用设计研究 · 更新 2026-11-11

为 Agent 提供 UI 与美术风格设计能力：从成熟产品研究机制与条件，在新问题中生成不同方案并比较。首个风格实例是鹰角／终末地，首个使用情景是独立的项目总控台。

**本轮产出：十份资料研究、总控台整体规划、三批六种可交互小样、逐批比较。** 十例原产品完整工作过程仍为 partial（完整交互验收 0/10）；小样已通过本地合成数据检查，待真人审阅。资料研究与 Agent 检查不等同于实机／人类测试。

## 从哪里打开

| 入口 | 用途与状态 |
| --- | --- |
| [十例研究综合与索引](docs/research-synthesis.md) | C01—C10 报告、每例证据缺口、七条带条件与反例的候选原则及迁移关系 |
| [总控台整体规划原件](../project-console/.sites-checkout/planning/overall-plan.md) | 工作／项目／资料／记录的信息架构、对象关系、六个流程、可回滚操作规划；属于产品项目，待审阅 |
| [打开六种交互小样](applications/project-console/prototypes/index.html) | A 分栏、B 关系图、C 逐层栏、D 阻塞档案、E 排查队列、F 依赖矩阵；浏览器直接打开后顶部切换 |
| [小样使用与来源](applications/project-console/prototypes/README.md) | 离线使用、可选本机服务、合成数据、依赖和字体许可 |
| [逐批评价与取舍](applications/project-console/evaluation-results.md) | A/B→C/D→E/F 的问题、结构差异、淘汰理由和下一步候选；Agent 评价 |
| [六种结构对照图](runs/prototypes-final/comparison.png) | 最终桌面截图裁切生成，便于并排查看，不代替交互原型 |
| [比较约定](applications/project-console/evaluation-protocol.md) | 共同任务、差异标准和评价维度 |
| [最终主流程检查](runs/prototypes-final/verification.json) · [屏宽／主题／键盘检查](runs/prototypes-final/responsive-keyboard.json) | 六种主流程、48 组屏宽／主题组合及目标键盘操作；合成数据，无真人指标 |
| [最终文件核查](runs/final-audit.json) | 来源媒体哈希、文件链接、四成分与脚本语法核查 |
| [提交与回退记录](docs/change-record.md) | 本地 Git 分项范围、依赖及恢复方法；无远端备份 |
| [project.yaml](project.yaml) | 唯一结构化元数据，范围版本 0.3，不代表游戏 build |

## 原件、源码、证据的组织

固定根目录 **D:/Dev/projects/design-capability-lab/**。与总控台 D:/Dev/projects/project-console/ 同级，各自独立 Git；总控台实际 Git 根是 .sites-checkout/，其 design-library 分支不属于 DCL。

- cases/<稳定案例名>/：各例 case.md、sources.json、evidence/。原始公开媒体与派生帧分开记录；作者图像批注不当作游戏 UI。案例目录不按聊天复制。
- docs/：[十次研究原计划与当前进度](docs/ten-case-study-plan.md)、研究综合、提交记录、[原项目组织核查](docs/project-console-organization.md)。
- applications/project-console/：实验约定、评价与原型源码。总控台产品规划唯一原件继续在产品仓库 planning/，本项目链接过去。
- runs/：各批及最终浏览器截图／验证结果。源媒体在 cases/；截图与对照图属于生成证据，保留逐批记录。
- scripts/：视频抽帧与浏览器检查工具，复用本机已有运行库，无新增大型 SDK。
- [references/](references/README.md)：另一会话中 ignoredone 两条用户资料与旧研究的定位。旧原件仍在总控台 review/，不复制维护第二套。

原型无构建依赖，index.html 直接打开；无线上数据读写。Saira 字体保留 OFL 许可，来源为总控台既有字体；游戏媒体只用于案例研究，未嵌入新原型。

## 当前判断与尚未完成

研究仍围绕一个取证产品、一个风格实例和一个迁移任务“任务阻塞与依赖导航”；整体规划是该产品的架构提案，未扩展为全站实现。范围不含通用设计系统、大型案例库、Agent 框架、微调或生产级 UI。

Agent 暂建议 A 的日常入口结合 D 的原因解释，B/F 作为辅助关系核查，C 用于深层追踪，E 留作引导式实验。尚未实现组合方案，也没有默认采纳所有版本。手机长页面、图的移动表达、矩阵滚动、大规模与循环关系、真人可用性及屏幕阅读器仍待验证。

没有额外用户录屏；不因此虚构返回／取消／时长。十例均有四成分资料分析，完整操作证据尚未满足原标准。没有将补采缺口当成用户承诺任务。

用户要求可回滚：研究、局部实验和产品规划分别用本地 Git 记录；真实产品写操作的草案、revision、原子提交与补偿撤销见整体规划，尚未接通实现。后续先审阅六种结构及代价，再决定是否制作组合样例；不自动改动线上总控台。

## 迁移与接续

2026-11-10 用户已手动完成迁移；唯一维护的原件及 .git 均在 D 盘。曾核查迁移前后 21 文件、41,392 字节一致，不是逐文件哈希验收。C 盘旧聊天目录为空，本轮未搬迁总控台旧研究资产。

应用项目目录曾仍登记 C 盘旧位置，当前会话 cwd 也指向旧目录；侧栏绑定未在本轮修改。后续文件操作显式使用上述 D 盘根目录。

接续先读本页与元数据，再读研究综合／逐批评价；交付和限制不只留在聊天。外部固定入口：[产出总览](D:/Dev/产出总览.md) · [开发工作台](D:/Dev/WORKBENCH.md)。本地 Git 不等于远端备份；未上传或部署。
