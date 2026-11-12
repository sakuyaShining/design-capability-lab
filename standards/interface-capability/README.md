# 界面能力规范资产 0.3

状态变化、动作守卫与可重复视觉表达见 [基于状态转移的 UI 设计规范](state-transitions.md)。

2026-11-12 · 项目内可复用的候选资产，覆盖任务语境、导航、视觉层次和跨对象结果。

## Agent 怎样使用

1. 先写清工作目标、对象、数据关系、真实写操作与失败条件。没有读任务前不要先选风格。
2. 查 [rules.json](rules.json)，只选适用条目。每条含问题、适用／不适用、决策、语义约束、可变项、误用、来源、检查与限制。
3. 先确定真实关系与返回约束，再生成至少两种有理由的表达。记录哪些形式没有沿用；不能只把参考产品换字重画。
4. 颜色角色使用三组原创实验配置 G/H/I。编辑 JSON 后生成 CSS。[颜色角色原件](tokens.json) · [生成实现](tokens.css)
5. 用 [validation.md](validation.md) 检查真实数据关系、反例、视觉职责与限制；保留失败。复用时在交付中写所用规则 ID／版本、取舍、与来源的距离及剩余缺口。

最小任务输入见 [brief-template.md](brief-template.md)。现有应用见 [G/H 层次实验](../../applications/project-console/layer-study/index.html)；依据是[跨产品机制对照](../../cases/cross-product-navigation/case.md)、[三体系层次对照](../../cases/surface-hierarchy-comparison/case.md)及[旧产出复盘](../../docs/review-02.md)。原终末地资料仍从[研究综合](../../docs/research-synthesis.md)查找。

0.2 更新 R02。用当前任务和直接前置确定首屏焦点，等权条目对齐，已满足项压缩为回看记录，下钻后检查主标题和计数是否更新。[工作界面案例](../../cases/focused-workspaces/case.md) · [I 实验评价](../../applications/project-console/layer-study/evaluation.md#i-任务排查改进稿)

0.3 新增 R10。跨对象变更需明确来源、目的地、保留关系及恢复入口。适用时让目标测试采集结果对象、关联和计数，检查失败后是否可恢复。[三组案例对照](../../cases/cross-object-changes/case.md) · [Skill 的操作指南](../../.agents/skills/dcl-design/references/object-changes.md)

## 状态与版本

`project_convention` 是本项目要求遵守的语义／审查约定；`candidate` 是待审阅的设计假设。官方文档支持、源码推理、目标原型检查、人类反馈分别登记；多个来源一致不升级为因果实验结论。某规则被反例打破时缩小适用范围、替换或弃用，保留旧版本和引用。

规范／token是本项目维护资产，研究截图和演示视频仍为第三方来源材料，不因本地收录便获得可随产品分发的许可。复用代码与规则时链接证据，不把官方画面当作可复用美术素材。原始媒体保留追溯，派生帧与诊断材料分开登记。

运行 `D:/Dev/envs/maintenance/python.exe scripts/build-spec-assets.py --check` 检查字段、引用、指定配色对比和生成 CSS 一致性。生成 CSS 时省略 `--check`。需要留档时使用 `--report runs/visual-inspection/spec-asset-check.json` 或指定本次运行目录。[指定配色检查](../../runs/visual-inspection/spec-asset-check.json)
