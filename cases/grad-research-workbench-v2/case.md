# DCL-RF02 · 科研工作台：终末地风格与计划转待办

2026-11-12 · 用户与同学协作的 Electron 应用 · 说明与源码初审

研究固定在上游提交 [`c33794a`](https://github.com/Jetaime-yang/grad-research-workbench-v2/tree/c33794a2fc9ed318b30c2a885ea314b0acd28094)。本例观察桌面工作台怎样表达当前模块、对象关系与可用操作，并以「每日计划项转待办」检查跨模块状态。上游为私有协作仓库，需有仓库权限才能打开引用。DCL 本地保存分析和版本指针，原件由协作仓库维护。[来源清单](sources.json)

## Key Screens · 关键界面

| 界面 | 在固定版本中核对到的内容 |
| --- | --- |
| 工作台导航 | 激活导航项有强调底、侧边标记、字重和位移。相邻弱化项也通过透明度和深度形成主次。依据为 CSS，实际可辨性待实测。[导航样式](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/css/theme.css#L291-L325) |
| 每日计划时间轴 | 项目已关联待办时显示「已转任务」，行内动作从转换切为「查看任务」。确认转换前可取消。[时间轴行](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/js/daily-plan.js#L60-L85) |
| 待办模块 | 点击「查看任务」的事件处理切换到待办模块。该事件没有把具体任务 ID 传给导航入口，是否在打开后能快速定位任务需实际试用。[事件绑定](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/js/daily-plan.js#L338-L348) |

## Experience Notes · 体验分析

- **状态标记与下一步。** 「已转任务」说明关系已建立，行内动作随之变化。可用它研究用户是否能通过既有计划项找回创建的待办。迁移到总控台时，可用相同检验衡量从阻塞原因跳到具体前置对象、再沿原语境返回。
- **强调色承担多个职责。** 激活导航、关联标签与装饰会使用黄色。后续评审可在相同页面比较，用户先注意到导航当前位置、计划项关联，还是装饰。源码有独立字重、位置和边界可供比较。现有纹理和图形仅作此项目的视觉来源背景。[作者风格说明](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/README.md#L121-L137) · [DCL 视觉层次对照](../surface-hierarchy-comparison/case.md)

## Motion Specification · 动效说明

样式包含导航退出、页面进入、分组面板依次展开，以及针对减少动效的覆盖规则。它们提供了观察「切换模块时怎样交代层级和来向」的入口。源码能确认动画声明及部分覆盖，快速切换时最终显示、焦点落点和减少动效下的实际反馈尚待运行测试。[导航退出](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/css/theme.css#L322-L335) · [页面入场](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/css/theme.css#L507-L520) · [减少动效](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/css/theme.css#L1487-L1501)

## Interaction Flow · 交互流程

1. 在每日计划时间轴选中未关联的计划项，点击转待办。代码先检查该项尚无 `taskId`，再请求确认。取消时直接退出。
2. 确认后先创建待办，再写回计划项的 `taskId`。随后提示已转任务并重新渲染。渲染时读取已关联待办的完成状态并同步到计划项。
3. 已关联行提供「查看任务」。现有处理跳转到待办模块，精确定位和返回位置可作为下一轮比较项。

两个顺序写入之间的失败是一个待验证场景。若任务已创建而关联写回失败，需要核对是否留下未关联任务、重试是否会重复创建，以及用户能否继续恢复。这是从源码推导的测试假设。另可对照「已关联任务仍能手动切换计划勾选」的入口与读取时同步逻辑，验证完成状态来源和反馈是否一致。[转换逻辑](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/js/daily-plan.js#L136-L159) · [完成同步](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/js/daily-plan.js#L43-L58) · [计划勾选](https://github.com/Jetaime-yang/grad-research-workbench-v2/blob/c33794a2fc9ed318b30c2a885ea314b0acd28094/renderer/js/daily-plan.js#L111-L121)

## 迁移与复查范围

候选验证以虚构计划项覆盖正常转换、取消、重复触发、关联写回失败、从计划打开具体待办、完成后返回计划。可将「来源对象、目标对象、关联结果与恢复入口」作为跨模块操作的评审项。本轮查阅了固定版本的说明与源码，运行、视觉效果、动效与真人体验待验证。
