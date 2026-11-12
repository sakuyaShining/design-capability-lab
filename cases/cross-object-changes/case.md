# DCL-X04 · 转移、合并和导出怎样交代对象变化

2026-11-12 · 三组公开产品文档对照。研究问题是：操作完成后，用户如何知道原对象在哪、新对象是什么、哪些关系保留、出了问题如何恢复？本轮由科研工作台「计划转待办」的源码观察引出。[来源清单](sources.json) · [本地应用起点](../grad-research-workbench-v2/case.md)

## Key Screens · 关键界面

| 产品与操作 | 操作位置 | 可核对的选择 |
| --- | --- | --- |
| GitHub · 转移 Issue | Issue 侧栏的转移入口和目标仓库选择 | 选择新归属。文档明确源和目标的写权限要求、仓库归属范围及私有 Issue 的目标限制。[官方说明](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository) |
| Zotero · 合并重复记录 | 重复条目集合、条目区和右侧合并面板 | 候选会被同时选中。字段有分歧时，用户可选主记录和单独字段版本。[官方说明](https://www.zotero.org/support/duplicate_detection#merging_duplicates) |
| Lightroom Classic · 导出文件 | Export 对话框的目的地、导出位置与同名处理设置 | 可决定目录、是否加入当前目录库，以及同名时询问、重命名、覆盖或跳过。[官方说明](https://helpx.adobe.com/lightroom-classic/desktop/export-photos/export-files-disk-or-cd.html) |

以上界面位置和控件来自作者文档。实际首屏、键盘顺序、操作耗时和视觉引导待实测。

## Experience Notes · 体验分析

| 关键差异 | 文档记录的结果 | DCL 迁移判断 |
| --- | --- | --- |
| 转移改变归属，旧入口可追踪 | GitHub 将旧 URL 重定向到新位置。评论和负责人保留，标签与里程碑取决于目标匹配。无目标读权限时提供提示。 | 明示目的地和有条件保留的关系。若旧入口仍可用，保证它指向新对象或能解释访问失败。不能从产品文档推断确认界面已逐项列出影响。 |
| 合并需要决定保留哪个对象和字段 | Zotero 允许指定主记录及冲突字段的取值，合并保留集合与标签，文档说明文字处理插件能识别合并。 | 当冲突内容影响结果时，展示差异和选择。保留关系的要求随业务变化，不能把清除重复项等同于简单删除。 |
| 导出产生目标产物，目标已有内容可能冲突 | Lightroom 将文件输出到所选位置，可选加入目录库。发现同名目标时按选定策略处理。 | 将输出位置、同名策略和是否另建关系显式化。允许跳过或改名的产品不应被强行统一成「每次只能生成一份」。 |

## Motion Specification · 动效说明

本轮材料提供操作入口和结果描述。动效时长、执行中反馈、返回焦点和转场中断未验证。可迁移的要求是让成功、部分完成或无法确认的状态可辨，并让结果入口保持可用。样式与动效选择以目标产品验证为准。

## Interaction Flow · 交互流程

- **GitHub**：打开 Issue → 发起转移 → 选择仓库 → 确认 → 通过旧地址到达新位置，或收到权限提示。文档记录转移结果和边界，未核验撤销。[操作步骤](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository)
- **Zotero**：进入重复条目集合 → 选候选 → 指定主记录或解决字段分歧 → 合并 → 保留集合、标签和引用连续性。此处引用的是作者的行为说明。[合并说明](https://www.zotero.org/support/duplicate_detection#merging_duplicates)
- **Lightroom Classic**：选择源照片 → 配置目的地和冲突策略 → 导出 → 按策略生成、改名、覆盖或跳过。加入当前目录库是独立选项。[导出设置](https://helpx.adobe.com/lightroom-classic/desktop/export-photos/export-files-disk-or-cd.html)

## 与科研工作台的对照

科研工作台的计划转换保留源记录，同时创建新待办并写回关联。它更接近「创建并关联」的结果。已核对的源码显示这是两次顺序写入，结果页入口只打开待办模块。由此可提出可测试的要求：一次操作确认后是否产生预期数量的目标、源对象是否关联到正确目标、能否直达结果；中途失败或回执丢失后能否查询或恢复。这些是 DCL 的候选设计问题。[科研工作台案例](../grad-research-workbench-v2/case.md)

对「同一意图安全重试」的工程参考来自 Stripe 的幂等请求文档。其不同 API 版本对失败与重试的行为有差异。DCL 借用的是为同一意图保留操作标识并可核对结果的思路，恢复契约仍由目标产品决定。[工程参考](https://docs.stripe.com/api/idempotent_requests)

## 规则与能力落点

[DCL-R10](../../standards/interface-capability/rules.json)把跨对象结果纳入设计与测试。Skill 的[跨对象操作指南](../../.agents/skills/dcl-design/references/object-changes.md)要求在需要时核对来源、目的地、关系和恢复；[行为契约](../../.agents/skills/dcl-design/references/behavior.md)增加可选的逐步事实比对。三组对照来自产品文档，尚无原产品端到端或真人验证。
