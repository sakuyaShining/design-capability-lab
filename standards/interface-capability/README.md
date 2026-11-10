# 界面能力规范资产 0.1

2026-11-11 · 项目内可复用的候选资产，覆盖任务语境、导航和视觉层次。不是通用设计系统，也不把某个产品的画面变成固定模板。

## Agent 怎样使用

1. 先写清工作目标、对象、数据关系、真实写操作与失败条件。没有读任务前不要先选风格。
2. 查 [rules.json](rules.json)，只选适用条目。每条含问题、适用／不适用、决策、语义约束、可变项、误用、来源、检查与限制。
3. 先确定真实关系与返回约束，再生成至少两种有理由的表达。记录哪些形式没有沿用；不能只把参考产品换字重画。
4. [tokens.json](tokens.json) 为颜色角色唯一源码；[tokens.css](tokens.css) 是脚本生成的可引用实现。G/H 是两组原创实验配置，不是 Carbon／Material／终末地 token，也没有被规定为后续唯一风格。
5. 用 [validation.md](validation.md) 检查真实数据关系、反例、视觉职责与限制；保留失败。复用时在交付中写所用规则 ID／版本、取舍、与来源的距离及剩余缺口。

最小任务输入见 [brief-template.md](brief-template.md)。现有应用见 [G/H 层次实验](../../applications/project-console/layer-study/index.html)；依据是[跨产品机制对照](../../cases/cross-product-navigation/case.md)、[三体系层次对照](../../cases/surface-hierarchy-comparison/case.md)及[旧产出复盘](../../docs/review-02.md)。原终末地资料仍从[研究综合](../../docs/research-synthesis.md)查找。

## 状态与版本

`project_convention` 是本项目要求遵守的语义／审查约定；`candidate` 是待审阅的视觉假设。官方文档支持、源码推理、目标原型检查、人类反馈分别登记；多个来源一致不升级为因果实验结论。某规则被反例打破时缩小适用范围、替换或弃用，保留旧版本和引用。

运行 `D:/Dev/envs/maintenance/python.exe scripts/build-spec-assets.py --check` 检查字段、引用、配色对比与生成 CSS 一致性；不带 `--check` 生成 CSS。无需安装新依赖。检查不等于完整无障碍或可用性认证。
