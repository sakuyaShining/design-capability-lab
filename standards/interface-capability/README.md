# 界面能力规范资产 0.2

[规则卡](rules.json)覆盖任务语境、关系导航和视觉层次。发布版保留规则 ID、状态、适用条件、检查方法和公开来源。候选规则仍需用具体产品检验。[研究摘要](../../research/overview.md)

先用[任务简报](brief-template.md)确定工作对象、状态和失败条件，再选适用规则。用[验证约定](validation.md)检查关系、反例、可读性与视觉职责。[状态转移 UI 指南](state-transitions.md)

[设计变量](tokens.json)和[生成 CSS](tokens.css)包含三套实验配置。用 `python scripts/build-spec-assets.py --check` 核对规则字段、选定色对及生成结果。
