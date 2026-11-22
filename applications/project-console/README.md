# 总控台应用研究与局部实验

2026-11-11。总控台整体规划和 DCL 局部小样分开维护：

2026-11-15 新增[工作台改稿](workbench/index.html)，可离线试用开始、完成、人工阻塞和重开，刷新恢复样例。流程评审已复现上游完成状态冲突仍放行、重开会清空完成结果等问题，待设计审阅。 [当前存储、状态图和决策表](workbench/state-guide.md) · [空间研究和证据](workbench/README.md) · [流程评审与复现](workbench/workflow-review.md)

[任务入口试点](workbench/task-entry.md)使用一次真实的重开规则核对，实测本机中断续做、提交结果和从下游查证。[离线任务总览](workbench/tasks/index.html)可直接打开 10 项任务的步骤图、前置和交付标准。

审阅从 v0.2 状态方案进入，试用从 v0.1 状态实验进入。试用「执行中受阻」查看解除条件和阶段保留，再试「可开始」和「已有完成的依赖方」比较允许动作。G/H/I 仍可用于视觉对照。[任务状态实验](state-study/index.html) · [状态方案](state-study/state-model.md) · [状态转移 UI 规范](../../standards/interface-capability/state-transitions.md) · [G/H/I](layer-study/index.html)

- [整体规划原件](../../../project-console/.sites-checkout/planning/overall-plan.md)：信息架构、对象与关系、贯通流程、视觉与动效原则、分阶段落地。
- [十次原产品研究计划](../../docs/ten-case-study-plan.md)：C01—C10 的研究问题与完成要求。
- [实验与比较约定](evaluation-protocol.md)：多批小样的差异要求与比较方法。

已按三批制作六种本地交互小样：[打开 A—F](prototypes/index.html) · [使用与复查](prototypes/README.md) · [逐批评价及取舍](evaluation-results.md) · [十例研究综合](../../docs/research-synthesis.md)。先完成整体规划，再执行 A/B、C/D、E/F；后批依据前批问题改变信息结构。原型不连接线上数据，样例为八条合成任务。当前为待审阅；没有将方案合并进产品源码或部署。
