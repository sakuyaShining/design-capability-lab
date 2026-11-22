# 项目总控台 · 工作台改稿

2026-11-22 / 本地可试用 / P1 已修复，P2 待审阅。

变体为冰蓝强调、冷灰纸面、标准切角、局部低反差底纹、紧凑密度和短交互反馈。  
主画面由保留任务范围的底面、半透队列及前景任务详情组成，项目概览位于下方。  
页面类型为控制台，提供浅色与深色。

## 打开和试用

双击 [index.html](index.html) 用 Edge 或 Chromium 打开。应用是离线交互样张，状态操作写入当前页的样例内存。刷新回到默认任务。顶部的“本周”是既有 8 条合成任务构成的样例范围。

页头「续做试点」可直接打开已完成的源码核对及其步骤图。启动本机服务后可进入可保存的交互版。 [试点入口、启动方式和证据](task-entry.md)

## 任务 README 与步骤图

[离线任务总览](tasks/index.html)收录 8 项工作台样例和 2 项试点。也可在工作台选中任务，再点「任务 README」打开对应图示，原页面仍保留。每页展示该任务的步骤依赖与并行分支、可跳转的跨任务前置和交付标准。样例图是工作顺序建议。PC-01、PC-02 页面另有真实提交结论的只读快照。

各任务的 `tasks/<任务编号>/README.md` 是维护原件，包含 Mermaid 步骤图。修改后在 DCL 根目录执行 `node scripts/build-task-readmes.mjs`，重建各任务离线页及目录。生成时会核对任务覆盖、跨任务依赖和步骤图中的引用。 `node runs/project-workbench/task-readmes/check.mjs` 可用离线 Edge 检查任务页、工作台直达、试点及窄屏。 [T-12 图示](tasks/T-12/index.html) · [PC-01 结果](tasks/PC-01/index.html) · [验证记录](../../../runs/project-workbench/task-readmes/verification.json)

在工作台选中 T-12，点任务标题旁的「流程图 ↓」即可跳到当前页的内嵌 Archify 图。「回到任务 ↑」回到详情。任务说明页也直接显示同一张图。离线可点击节点查看与它相连的路径，完整的缩放、导出和查看工具在「独立打开」里，窄屏可在说明页展开简图。流程图表达建议的执行顺序，实时前置和阶段显示在工作台任务详情。 [工作台](index.html) · [T-12 任务说明](tasks/T-12/index.html) · [离线验证](../../../runs/project-workbench/task-readmes/verification.json)

试稿使用 Archify 3.2.0，工具只作为可重建的本机缓存。若任务 README 的依赖变化，先同步候选 JSON，再从 DCL 根目录用 Archify 的 `finalize workflow <候选 JSON> <输出 HTML> --quality showcase --json` 重生成。 [独立图](tasks/T-12/archify.html) · [候选 JSON](tasks/T-12/archify.workflow.json) · [Archify 验证](../../../runs/project-workbench/task-readmes/archify-t-12/archify.finalize-summary.json) · [版本来源](https://github.com/tt-a1i/archify/tree/a7ed6fd6657da90414831d1d42cf95987188750c/archify)

任务页接入后于 11 月 22 日重跑整套工作台检查（11 组）；同日修复 P1 的完成资格与结果留存后重跑至 14 组，10 个屏宽×主题组合通过，报告记录的源码哈希与当前实现一致。[接入后复核](../../../runs/project-workbench/task-readme-integration/verification.json) · [修复后复核](../../../runs/project-workbench/p1-fixes/verification.json)

## 离线样例操作

1. 点右上“可推进”，队列会找出当前可推进的任务。默认算出 1 项，可查看 T-10。独立选一项任务会从该任务开始浏览。
2. 从默认 T-15 的前置查看 **T-12「确定竞赛主选与备选方向」**。它是 T-15 的直接前置，自己还等 T-10、T-11。点「查看可推进的 T-10」，确认开始后填写实际结果并记录完成。
3. 返回 T-12，查看 T-11。T-11 的旧记录只有人工阻塞，解除时须选择阻塞前的阶段。两项前置都完成后，T-12 会显示「可以开始」，此时由你确认开始。
4. 将队列筛到“集创赛”，从 T-15 查看跨项目的 T-14。当前项会注明在筛选范围外，返回后保留原筛选。项目概览的“查看任务”可直接按项目筛选队列。

[同结构浅面无纹对照](index.html?look=flat) · [深色](index.html?theme=dark) · [前置真正完成的样例](index.html?scenario=clear) · [完成记录与前置冲突](index.html?scenario=conflict) · [解除阻塞后仍有前置](index.html?scenario=blocked) · [重开受依赖方限制](index.html?scenario=downstream) · [缺失引用](index.html?scenario=missing) · [循环引用](index.html?scenario=cycle)

## 状态转移与使用

从 [数据结构、状态图和按钮决策表](state-guide.md) 可以核对当前实现的存储位置、T-12 内存对象、五种业务操作的守卫及完整操作路径。

[流程与状态转移复盘](workflow-review.md)记录 P1 的完成资格冲突与结果留存已修复，以及仍待处理的等待引导、依赖分型和影响提示缺口（P2），附修复前后的证据与验收条件。

T-12 是样例任务编号，当前任务、依赖方向与阶段使用单独的文字和位置表达。T-12 的名称和预期产出只在本工作台样例中明确化，规则和依赖关系继续沿用已有模型。下一步由当前实际条件决定，只有一项直接前置可推进时，提供直达建议，多项时保留列表让用户选择。

| 操作 | 条件和结果 |
| --- | --- |
| 查看前置 / 返回 | 沿真实依赖进入详情或回到原任务。只改变查看位置，筛选、进度和任务结果保留。 |
| 开始任务 | 已承诺、待开始、直接前置均满足且无人工阻塞。确认后进入进行中。 |
| 记录完成 | 进行中且仍具备推进条件，填写实际结果或产物位置。确认后进入已完成，结果写入任务记录，依赖方重算可推进性并保持原阶段。 |
| 登记 / 解除人工阻塞 | 登记需记录原因，保留当前阶段。旧记录阶段未知时，解除需补记原阶段，可选填解除依据；原原因保留在任务记录。解除后仍要按前置检查是否可推进。 |
| 重新打开 | 已完成且没有已完成的任务直接依赖它。确认后回到待开始，此前结果和可选重开原因留在任务记录，依赖方重新等待。 |

前置的完成记录会递归校验；上游已完成但前置未完成时，下游列出冲突编号与根因并拒绝推进。预览列出对象及后果，取消恢复触发点。字段未通过校验时停在原表单，补齐后可再次提交。共享 [任务状态模型](../state-study/model.js) 提供实际守卫，交互沿用 [状态转移 UI 规范](../../../standards/interface-capability/state-transitions.md)。本轮验证范围为内存样例，产品 v0.2 的服务端事务、复核版本、审计与补偿撤销仍待集成。[完整状态提案](../state-study/state-model.md)

14 组浏览器检查、10 个屏宽与主题组合、两条实测契约轨迹及 8 项现有单元测试通过。390×844 下第一条前置仍位于首屏。 [T-12 等待](../../../runs/project-workbench/state-clarity/direction.png) · [T-12 可以开始](../../../runs/project-workbench/state-clarity/direction-ready.png) · [完成校验](../../../runs/project-workbench/state-clarity/finish-validation.png) · [解除后仍等待](../../../runs/project-workbench/state-clarity/released-waiting.png) · [验证记录](../../../runs/project-workbench/p1-fixes/verification.json) · [实测轨迹](../../../runs/project-workbench/p1-fixes/observed.json)

## 《终末地》空间表达复核

用户反馈队列修订仍偏浅显，要求参考鹰角的空间表现。本次直接复看三张官方图和设施列表教学采样帧。下面的观察限于所列画面，工作台的动效为此次实现参数。

| 观察对象 | 画面如何形成空间 | 工作台的转译 |
| --- | --- | --- |
| C01 / 官方分层地图 | 中心地图轮廓明亮，周边暗但未消失。沿边控件与中心对象有明确分工。画面本身无法确定其明暗对应的具体游戏状态。 | 保留同一张低对比底面，任务范围与起点一直可见，详情更亮更清晰。 [地图原图](../../../cases/endfield-map-navigation/evidence/official-layered-map-20251101.jpg) · [官方通讯](https://endfield.gryphline.com/zh-tw/news/1340) |
| C08 / 官方配方提示 | 场景从半透操作面后仍可辨认。配方、输入输出和错误提示在不同位置获得不同的实体感。 | 队列共享底面纹理，当前任务和真实前置放入一张实底检视面，前置数字嵌在该表面。 [配方原图](../../../cases/endfield-production-diagnosis/evidence/smart-recipe.jpg) · [官方通讯](https://endfield.gryphline.com/zh-tw/news/1340) |
| C10 / 官方俯瞰预览 | 重叠设备周围的对象仍可辨认，局部候选盖在原位置上。白框和压暗可确认为预览图的表现，游戏实操是否使用同样遮罩尚未知。 | 检视面在桌面上叠过队列的留白 16px，左侧按钮可操作。窄屏改为上下排列，保留底面与起点。 [俯瞰原图](../../../cases/endfield-overview-selection/evidence/official-overlap-selection.png) · [官方通讯](https://endfield.gryphline.com/ja-jp/news/7017) |
| C10 / 教学片段 | 约 1.173 秒仍可见场景，1.760 秒与 2.347 秒中同一场景留在设施列表后面。片段支持场景连续，原始输入与完整过渡时长未知。 | 切换或下钻时仅前景的当前任务内容短距离换入，返回反向换入。左侧队列保持实际节点和位置，减少动态效果时关闭位移。 [发布片段采样及来源](../../../cases/endfield-overview-selection/case.md#1-key-screens) |

本轮让 R01 的分层和 R04 的语境保留对应到同一个交互。叠压只发生在边缘，范围、队列和起点保持可读。底面网格承担材质表达，属于装饰。浅面对照中保留相同信息和交互，去掉网格、叠压及错位边。手机将前景放在队列上方，390×844 时首个前置按钮下缘从首版的 642px 下移到 686px，仍在首屏，队列需要滚动或使用跳转。

9 组浏览器检查、10 个屏宽×主题组合和 8 项既有单元测试通过。浏览器核对了叠压量、队列原 DOM 节点及位置、跨项目范围、路径返回和减少动效。设计采用现有规则，视觉偏好和长期操作舒适度仍待真人试用。 [新版桌面](../../../runs/project-workbench/spatial-revision/desktop.png) · [查看人工阻塞](../../../runs/project-workbench/spatial-revision/blocked.png) · [新版手机](../../../runs/project-workbench/spatial-revision/mobile.png) · [新版深色](../../../runs/project-workbench/spatial-revision/dark.png) · [无叠压对照](../../../runs/project-workbench/spatial-revision/flat.png) · [验证记录](../../../runs/project-workbench/spatial-revision/verification.json)

## 上一轮任务队列修订

用户反馈普通任务行同样实、缺少空间感。应用 R01 与 R02，让队列直接展开在页面底色上，分隔线从标题列开始。当前行用实底、编号色块和轻微错位的细轮廓体现选中。已完成项移到下方的回看区，同组内继续沿用样例顺序，标题与阶段保留可读字色。两组均可直接点击和用键盘选择。依赖计量仍用斜纹表达待满足项，队列用细轮廓表现当前项。

[修订前桌面](../../../runs/project-workbench/desktop.png) · [修订后队列](../../../runs/project-workbench/queue-revision/queue.png) · [修订后桌面](../../../runs/project-workbench/queue-revision/desktop.png) · [手机队列](../../../runs/project-workbench/queue-revision/queue-mobile.png) · [深色队列](../../../runs/project-workbench/queue-revision/queue-dark.png)

修订版通过 8 组浏览器检查和 10 个屏宽×主题组合，包含已完成组的筛选、键盘选中时实底跟随、跨项目返回与窄屏状态长文字。当前层次感仍待用户复看。 [修订验证](../../../runs/project-workbench/queue-revision/verification.json)

## 首版设计取舍

| 沿用的方法 | 在工作台如何落地 |
| --- | --- |
| R01、R02 用明暗和尺度建立视觉职责 | 墨色工作面突出任务名、预期产出和待满足项，本周计数留在标题带。桌面并列队列和原因，项目概览接在原因下方。窄屏先读当前任务和两条未满足前置，队列可从首屏直达。 |
| R03、R04 保持因果与返回语境 | 路径从已选任务的实际 `deps` 生成。缺失记录和循环回边显示为说明。下钻返回恢复筛选、来源控件焦点、已满足分组的展开状态和滚动位置。 |
| R05、R07 让纹理和数字表达数据 | 一个格对应一项样例前置，实芯表示已满足，斜纹表示待满足。执行阶段、人工阻塞、直接前置各自可读。没有前置的任务用文字直接说明。 |
| R08、R09 用反例与可达性复核 | 同布局的浅面无纹对照保留全部业务文字。360px 长标题、空筛选、循环、缺失、全满足和跨项目分支均做实测。 |

工业终端的视觉复核提供按职责组织表面大小、局部纹理和信息层级的方法。已有 I 版提供同一任务下的对照，继续让未满足项优先、已满足项可回看。这次把工作台的主视觉交给样例任务标题和前置数据，用队列和项目入口覆盖日常找任务。英文标注与顶部品牌图形承担风格识别。手机优先当前事项，更多队列内容需要继续滚动。桌面和手机的安排仍待真人评审。 [工业终端视觉复核](../../industrial-terminal/review.md#11-月-15-日视觉复核) · [I 版桌面证据](../../../runs/visual-inspection/I-desktop.png)

## 来源和复查

- 需求口径来自产品 [整体规划 v0.1](../../../../project-console/.sites-checkout/planning/overall-plan.md) 与 [旧视觉反馈](../human-feedback.md)。项目概览用产品示例种子中的优先级和状态，采用 5 条精简演示元数据。FPGA 为弃赛后整理，算子赛仍为暂定方向。[项目示例种子](../../../../project-console/.sites-checkout/app/model.ts)
- 交互与状态沿用 [DCL 样例](../prototypes/data.js) 和 [任务模型](../state-study/model.js) 的阶段、派生条件、缺失和循环检测。任务设为已承诺的演示样本，默认手动选定 T-15 作比较起点。画面按 [dcl-design 0.2.0](../../../.agents/skills/dcl-design/SKILL.md)、[规范 0.3](../../../standards/interface-capability/rules.json) 与 [endfield-ui](C:/Users/Sakuya/.codex/skills/endfield-ui/SKILL.md) 实现，复用 [Saira 与 OFL](../prototypes/assets/Saira-OFL.txt)。图形由 CSS 和任务数据生成。
- 唯一维护源码为本目录的 [HTML](index.html)、[CSS](style.css)、[JS](app.js) 和 [行为契约](behavior.json)。既有交互实验和产品源码各自在原入口。真实任务写入、全站集成、真人试用、屏幕阅读器和大规模数据表现仍待验证。

从 DCL 仓库根目录运行 `node scripts/check-project-workbench.mjs`。可选参数依次为输出目录、revision 名和运行日期，省略时写入 `runs/project-workbench/state-clarity`。测试复用本机 Edge 与 Playwright，可通过 `DCL_EDGE` 和 `DCL_PLAYWRIGHT` 指定浏览器和 Playwright `index.mjs` 的绝对路径。

用 `python .agents/skills/dcl-design/scripts/validate_behavior.py applications/project-console/workbench/behavior.json --observed runs/project-workbench/task-readme-integration/observed.json` 复核浏览器轨迹。

首版 7 组浏览器检查与 10 个屏宽×主题组合通过。390×844 下第一条前置按钮下缘为 642px，返回实测恢复原滚动位置。旧 A—F 结构中 B/C/F 的 5 组路径回归，以及 8 项既有 Python 测试通过。报告的五个 SHA256 标记被验证源码与样本版本。 [首版手机](../../../runs/project-workbench/mobile.png) · [首版人工阻塞](../../../runs/project-workbench/blocked.png) · [首版深色](../../../runs/project-workbench/dark.png) · [首版平面对照](../../../runs/project-workbench/flat.png) · [首版验证记录](../../../runs/project-workbench/verification.json) · [旧路径回归](../../../runs/project-workbench/path-regression.json)
