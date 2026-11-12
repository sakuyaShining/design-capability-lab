# Design Capability Lab

DCL-001 · v0.7 · 应用设计研究 · 更新 2026-11-12

## Primary Objective

建立一个可版本化、可迁移、可评估的 Agent 设计与前端生产能力包。它应当能够在缺少历史对话上下文的情况下，针对新的软件需求，独立完成从产品理解、行为建模、交互设计、视觉设计到前端实现与质量验证的完整工作。

首个风格实例是鹰角／终末地，首个应用场景是独立的项目总控台。案例和实验用于提炼、修订可迁移的设计知识。

**当前交付为 `dcl-design` Skill 0.1.0 预览版。** 它包含简短调用入口、按需参考、JSON 行为契约与可执行校验器。独立新会话、不同产品、可操作交互、自动与人工评估、跨项目复用及版本改进的证据要求见 [验收约定](evaluations/acceptance.md)。独立迁移和人工评审尚未完成。总控台状态实验仍待审阅，终末地首轮十例的完整工作过程仍为 partial。

### 如何调用

在以本仓库为工作目录的 Codex 会话中调用 `$dcl-design` 并提供产品需求。跨项目试用可把整个 `.agents/skills/dcl-design/` 目录按同样相对位置复制到目标仓库，随运行记录标明 Skill 版本和 DCL 提交。该目录内含运行所需参考文件。行为契约检查用 Python 3 标准库，浏览器检查使用目标项目工具。当前工作区若仍绑定 C 盘旧聊天目录，应从 D 盘仓库或目标仓库发起新会话。[Codex Skill 路径说明](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)

## GitHub 发布预览

2026-11-12 已推送 [GitHub 仓库](https://github.com/sakuyaShining/design-capability-lab) 的 `main`。仓库同日设为公开。首发为 26 个文件的独立提交 [`e3f0bdd`](https://github.com/sakuyaShining/design-capability-lab/commit/e3f0bdd309f613c7e297da04671d27ee0e72a1c0)，来源为本地 `99aed12`。内容包括 Skill 0.1.0、发布版规范、验收、研究摘要与虚构社区展览任务的状态实验。

[本地发布副本](dist/github-preview/README.md) 位于 `dist/github-preview/`，Git 历史独立。此仓库维护原件，发布副本按清单更新。首发校验了四个状态契约场景、九张规则卡、48 组指定色对和浏览器回归，远端文件清单与提交已核对。[本地浏览器记录](dist/github-preview/runs/state-study/verification.json) · [发布版验收约定](dist/github-preview/evaluations/acceptance.md)

## 从哪里打开

| 入口 | 用途与状态 |
| --- | --- |
| [调用入口](.agents/skills/dcl-design/SKILL.md) · [验收与首次迁移任务](evaluations/acceptance.md) | 0.1.0 预览版，可携带的设计参考、状态契约检查、浏览器证据与人工评审约定。 |
| [打开任务状态实验](applications/project-console/state-study/index.html) · [总控台状态方案](applications/project-console/state-study/state-model.md) | v0.2 候选规则含转移表、统一提交、冲突和撤销判据，待审阅。直接打开 v0.1 小样试用本地状态，修改只存在页面内存。 |
| [状态转移 UI 规范](standards/interface-capability/state-transitions.md) · [流程验证](runs/state-study/verification.json) | 三份 Skill 的方法用于任务守卫、视觉引导和交互检查。固定布局与语义色，九类情境及五档屏宽已检查。 |
| [规范资产0.2](standards/interface-capability/README.md) | 9 条规则卡。R02 补充首屏、等权条目、已满足记录和下钻焦点的检查方法 |
| [UI 与交互 Skill 候选](references/ui-design-skills.md) | 交互设计、视觉引导及实现评审的上游候选，含 I 小样的筛选恢复试用 |
| [第二轮复盘](docs/review-02.md) · [用户反馈原话](applications/project-console/human-feedback.md) | 8项发现，含跨分支伪造依赖路径的修正；保留有效工作，暂停无充分证据的优选 |
| [跨产品机制对照](cases/cross-product-navigation/case.md) · [视觉层次对照](cases/surface-hierarchy-comparison/case.md) | GitHub、Blender、GOV.UK三类流程；Carbon、Atlassian、Material三体系及W3C要求；支持与冲突分别记录 |
| [打开 G/H/I 实验](applications/project-console/layer-study/index.html) · [I 设计评价](applications/project-console/layer-study/evaluation.md#i-任务排查改进稿) | 浏览器直接打开，默认 I，可切换 G/H、情境、深浅和插图 |
| [工作对象与详情案例](cases/focused-workspaces/case.md) · [I 检查](runs/visual-inspection/verification.json) | Ableton Live 12、Grafana Explore、Lightroom Classic 三组对照，含四张官方界面图与迁移判据。检查覆盖手机首屏、下钻、全部满足和异常情境 |
| [G/H 视觉复盘](applications/project-console/layer-study/evaluation.md#gh-视觉复盘) | 用户再次指出偏素。记录首屏焦点、条目层次与下钻状态的复测，以及后续小样判据 |
| [新旧视觉对照](runs/review-02/comparison.png) · [最终实验检查](runs/review-02/layers-final/verification.json) · [本轮文件核查](runs/review-02/final-audit.json) | 合成数据、16组屏宽／主题、冻结实现哈希、媒体与引用核查；没有真人审美评分 |
| [Endfield Menu 玩家复刻](cases/endfield-menu-fan-recreation/case.md) | DCL-RF01，用户提供的第三方实现参考。固定上游版本，已初审菜单分层、开合与减少动效路径，待运行验证。 |
| [完整案例索引](cases/README.md) · [首轮研究综合](docs/research-synthesis.md) | 14 份 DCL 报告及来源清单、总控台早期研究与公开版入口。首轮综合记录 C01—C10 的证据缺口和候选原则。 |
| [总控台整体规划原件](../project-console/.sites-checkout/planning/overall-plan.md) | 工作／项目／资料／记录的信息架构、对象关系、六个流程、可回滚操作规划；属于产品项目，待审阅 |
| [打开六种交互小样](applications/project-console/prototypes/index.html) | A 分栏、B 关系图、C 逐层栏、D 阻塞档案、E 排查队列、F 依赖矩阵；浏览器直接打开后顶部切换 |
| [小样使用与来源](applications/project-console/prototypes/README.md) | 离线使用、可选本机服务、合成数据、依赖和字体许可 |
| [逐批评价与取舍](applications/project-console/evaluation-results.md) | A/B→C/D→E/F 的问题、结构差异、淘汰理由和下一步候选；Agent 评价 |
| [六种结构对照图](runs/prototypes-final/comparison.png) | 最终桌面截图裁切生成，便于并排查看，不代替交互原型 |
| [比较约定](applications/project-console/evaluation-protocol.md) | 共同任务、差异标准和评价维度 |
| [最终主流程检查](runs/prototypes-final/verification.json) · [屏宽／主题／键盘检查](runs/prototypes-final/responsive-keyboard.json) | 六种主流程、48 组屏宽／主题组合及目标键盘操作；合成数据，无真人指标 |
| [首轮文件核查](runs/final-audit.json) | 历史快照：51条媒体记录、46个唯一SHA256，不是51个独立观察；本轮核查从上方进入 |
| [提交与回退记录](docs/change-record.md) | 本地 Git 分项范围、依赖及恢复方法；无远端备份 |
| [project.yaml](project.yaml) | DCL 项目元数据，版本 0.7 |

## 原件、源码、证据的组织

固定根目录 **D:/Dev/projects/design-capability-lab/**。与总控台 D:/Dev/projects/project-console/ 同级，各自独立 Git；总控台实际 Git 根是 .sites-checkout/，其 design-library 分支不属于 DCL。

- .agents/skills/dcl-design/：能力包唯一维护原件。目标项目中的试用副本按版本记录。
- evaluations/：能力包验收、迁移任务及证据要求。
- [cases/](cases/README.md)：从完整索引进入各例 case.md、sources.json 和可用证据。原始公开媒体与派生帧分开记录；作者图像批注不当作游戏 UI。案例目录不按聊天复制。
- docs/：[十次研究原计划与当前进度](docs/ten-case-study-plan.md)、研究综合、提交记录、[原项目组织核查](docs/project-console-organization.md)。
- applications/project-console/：实验约定、评价与原型源码。总控台产品规划唯一原件继续在产品仓库 planning/，本项目链接过去。
- runs/：各批及最终浏览器截图／验证结果。源媒体在 cases/；截图与对照图属于生成证据，保留逐批记录。
- scripts/：视频抽帧与浏览器检查工具，复用本机已有运行库，无新增大型 SDK。
- standards/interface-capability/：项目规范原件、角色token源码与生成CSS。每次复用注明规则ID和版本，不在全局Skill中另复制维护。
- [references/](references/README.md)：另一会话中 ignoredone 两条用户资料与旧研究的定位。旧原件仍在总控台 review/，不复制维护第二套。

原型无构建依赖，index.html 直接打开；无线上数据读写。Saira 字体保留 OFL 许可，来源为总控台既有字体；游戏媒体只用于案例研究，未嵌入新原型。

## 当前判断与尚未完成

首轮以终末地十例作为同一来源家族。后续累计六组跨产品流程对照、三套视觉体系对照，围绕「任务阻塞与依赖导航」提炼候选规则。

旧 A+D 建议仍为待比较的结构假设。I 的默认手机首屏可查看两项待处理前置，长标题与密集任务仍有滚动成本。视觉效果、屏幕阅读器、大规模性能与真实事务待验证。

没有额外用户录屏；不因此虚构返回／取消／时长。十例均有四成分资料分析，完整操作证据尚未满足原标准。没有将补采缺口当成用户承诺任务。

研究、规范、局部实验与交接均有本地 Git 记录。G/H 冻结检查对应上一轮历史实现，I 与共享导航的本轮检查见实验评价。接续时可先对照默认任务和人工阻塞的焦点变化，再检查 R02 的适用条件。[提交与回退记录](docs/change-record.md)

## 迁移与接续

2026-11-10 用户已手动完成迁移；唯一维护的原件及 .git 均在 D 盘。曾核查迁移前后 21 文件、41,392 字节一致，不是逐文件哈希验收。C 盘旧聊天目录为空，本轮未搬迁总控台旧研究资产。

应用项目目录曾仍登记 C 盘旧位置，当前会话 cwd 也指向旧目录；侧栏绑定未在本轮修改。后续文件操作显式使用上述 D 盘根目录。

接续先读本页与元数据，再读研究综合／逐批评价；交付和限制不只留在聊天。外部固定入口：[产出总览](D:/Dev/产出总览.md) · [开发工作台](D:/Dev/WORKBENCH.md)。原件 Git 继续本地维护。GitHub 保存单独的发布预览，详见上方记录。
