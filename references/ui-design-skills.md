# UI、交互与视觉导引 Skill 候选

核对日期为 2026-11-11。用于补足 DCL 从任务到界面的设计与评审能力。状态为上游资料已读、候选待选，I 小样已完成一次交互评审试用。

本机已核对 `endfield-ui`、Sites 和 ImageGen。它们分别适用于工业风格表达、本地原型交付和图像素材。OpenAI 精选目录脚本本次返回 HTTP 403。下表根据各作者仓库公开的 `SKILL.md` 或工具文档核对，安装与运行状态需要另行验证。[本机 endfield-ui](C:/Users/Sakuya/.codex/skills/endfield-ui/SKILL.md) · [OpenAI Skills Catalog](https://github.com/openai/skills)

| 顺序 | 候选 | 能补的能力 | 接入 DCL 的用法与边界 |
| --- | --- | --- | --- |
| 1 | [Product Design and UX](https://github.com/magnus919/agent-skills/tree/main/product-design-and-ux) | 信息架构、主流程与异常分支、退出与恢复、可观察的完成条件 | 社区维护的 Agent Skills 格式。先用任务与状态模型核对 I 的筛选、下钻和回到原任务。按任务读取其模板和参考，不照搬整套流程。 |
| 2 | [Anthropic Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 根据业务题材决定版式、字级、节奏和视觉重心 | 用同一任务比较有图与关图、桌面与小屏、正常与受阻的主次。它提供视觉方向和自评方法，任务状态仍由交互模型约束。 |
| 3 | [Vercel Web Design Guidelines](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md) | 表单、空状态、键盘焦点、动态反馈、长内容与响应式检查 | 用于交付前查实现。Skill 引导读取上游实时规则，DCL 记录本次实际采用的条款和日期。[上游规则](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) |
| 可选 | [Impeccable](https://impeccable.style/docs/) | 面向现有界面的构图批评和细节检查 | 先评估公开的 critique 与 audit 方法。其安装器可加项目钩子，完整模式还涉及本地引擎，采用前应核对范围。 |
| 可选 | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 查找配色、字体与设计体系候选 | 适合发散备选。其生成系统依赖自己的数据与脚本，候选须回到实际任务、语言和现有设计资产验证。 |

建议的项目顺序是先明确用户要完成的工作和恢复路径，再设计视觉引导，最后查状态、键盘和反馈。视觉目标沿用用户的「克制但有层次」，当前任务、待处理项和下一步动作构成评审对象。优先用 NN/G 的可用性启发式判断反馈与恢复，再用 W3C 的交互模式校准控件行为。[NN/G 可用性启发式](https://www.nngroup.com/articles/ten-usability-heuristics/) · [NN/G 视觉层次](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) · [W3C APG 模式](https://www.w3.org/WAI/ARIA/apg/patterns/)

## 在 I 上的试用

目标是从当前任务筛选并切换到另一项可排查的任务。参照 Product Design and UX 的任务状态模型，检查过滤结果为空后的说明与下一步。再参照 Vercel 指南检查文本反馈、键盘动作和动态提示。[状态模型参考](https://raw.githubusercontent.com/magnus919/agent-skills/main/product-design-and-ux/references/task-flows-and-state-models.md) · [Vercel 检查条目](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)

基线 `6edd4d1` 的 390×844 复现中，输入无匹配字符串，提示只出现在下拉框的禁用选项里，筛选面板内没有恢复按钮。现增加匹配数量、可见空状态和「清除项目与搜索筛选」。键盘清除后恢复任务选项并将焦点放回搜索框，当前依赖路径与「隐藏已满足前置」保留。检查覆盖合成样例与离线入口，视觉偏好和辅助技术实测待验证。[无匹配截图](../runs/visual-inspection/skill-review/I-no-matches-mobile.png) · [验证](../runs/visual-inspection/skill-review/verification.json) · [原型入口](../applications/project-console/layer-study/index.html)
