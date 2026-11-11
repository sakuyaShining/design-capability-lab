# Design Capability Lab

DCL 是可版本化、可迁移、可评估的 Agent 设计与前端能力包。目标是在新会话中从产品需求和目标仓库出发，完成产品理解、行为建模、交互与视觉设计、可操作前端和质量验证。

本仓库是 DCL v0.7 的独立发布预览，内含 **dcl-design 0.1.0**，源版本为 `99aed1211779e1f2c86a95b477832c9c3ae3817e`。终末地是首个风格研究实例，总控台是首个应用实例。示例数据为虚构的社区展览任务。

| 入口 | 用途 |
| --- | --- |
| [Skill](.agents/skills/dcl-design/SKILL.md) | 调用入口、按需参考与 Python 行为契约校验器 |
| [设计规范](standards/interface-capability/README.md) | 规则卡、任务简报、色彩变量与验证方法 |
| [状态实验](examples/task-state/index.html) · [状态方案](examples/task-state/state-model.md) | v0.1 可操作原型和 v0.2 候选规则 |
| [验收计划](evaluations/acceptance.md) · [研究摘要](research/overview.md) | 独立迁移试题、人工评审、公开来源与证据边界 |

## 使用

从本仓库开启 Codex 会话，发送 `$dcl-design` 和产品需求。跨项目试用时，将完整的 `.agents/skills/dcl-design/` 目录放到目标仓库的 `.agents/skills/` 下。外部 Skill 先例目前是按需参考。

状态实验可直接在浏览器打开，刷新会重置数据。v0.2 的并发提交、重复提交处理和补偿撤销为待验证设计。独立迁移和真人评审尚待执行。

## 检查

```sh
python .agents/skills/dcl-design/scripts/validate_behavior.py .agents/skills/dcl-design/references/interruptible-panel.json
python scripts/build-spec-assets.py --check
```

浏览器回归需要 Node.js 和 Playwright。可用 `npm install --no-save playwright` 安装，再运行 `npx playwright install chromium` 和 `node scripts/check-state-study.mjs`。结果写入 `runs/state-study/`。
