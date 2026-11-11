# 本地提交与回退

2026-11-11。用户要求缺少连续实录的行为设计为可回滚提交。本页记录文件版本边界；产品数据事务是独立的规划，见[整体规划](../../project-console/.sites-checkout/planning/overall-plan.md)。没有把 Git 回退等同于数据库或外部操作撤销。

本轮 DCL 原仓库没有任何提交，因此首个提交是现存配置、参考与本轮案例资料的可找回基线，不能用 Git 恢复不存在的更早历史。此前文件原件未删除、迁移或覆盖为批注图；失败抽帧证据保留并标注。

## 提交边界

| 仓库／范围 | 唯一提交主题 | 内容与依赖 |
| --- | --- | --- |
| DCL / 研究 | `research: establish ten-case documentary baseline` | 研究计划、参考索引、十例资料与来源、抽帧工具及文件规则；完整操作链仍 partial |
| 总控台 / 规划 | `planning: define console architecture and reversible changes` | planning/overall-plan.md、源码 README 入口与清单哈希更新；基于既有 design-library，不改产品 UI、API、数据库或设计库媒体 |
| DCL / 小样 | `prototype: compare six dependency navigation structures` | 三批六种源码、字体许可、实验约定、逐批评价及截图／自动检查；依赖研究中的对象与原则 |
| DCL / 交接 | `docs: register delivery verification and rollback boundaries` | 元数据、入口、综合、最终核查与本页，连接前述交付 |

已建立：DCL 研究 `201ec50c2a2b078456b2be5f053524e78cb9601b`；DCL 小样 `3d4e48707a0453d2d13684c37688ebd06843ea3d`；产品规划 `8ad63a751e34f5834de9f1e73f3ed43ed30205a5`。交接提交 ID 用 `git log -1 --format=%H -- docs/change-record.md` 查看，避免在同一个提交内记录其自身 ID。未推送远端。DCL 的 master 与产品的 design-library 独立，不切换或合并两者。

## 安全接续与回退

先在对应真实仓库运行 `git status --short`，确认用户未提交修改；需要预览回退时先用 `git show <ID>` 审阅准确范围。用 `git revert <ID>` 创建反向提交，保留历史。DCL 首个研究基线有后续依赖，通常逐项修订研究；如果整轮回退应从最新依赖往前处理并修复入口，不随意撤去仍被引用的证据。

可先用临时分支或 `git show <ID>:<路径>` 比较，不强制清空工作区，不使用 reset --hard、clean 或删除资料目录。已归档素材和失败日志也可能含独有证据。外部总览／工作台及产品包装 README 是 D:/Dev 的人工导航，不在这两个 Git 根目录内，回退交付后需同步修订它们的链接与状态；本文明确这个边界，不宣称外部入口已受项目 Git 管理。

## v0.4 增量边界

2026-11-11 用户要求扩展研究、沉淀规范、复盘并改善单调视觉。本轮独立提交：`f4224d0` 修正真实依赖路径与专门回归；`8840922` 跨产品／视觉体系对照、9条规则及复盘；`9345d42` 冻结G/H表达实现与初轮检查。随后只新增 extra-cases.js 的合成情境数据与验证／交接，不改四个已冻结实现文件；最终哈希复核见[本轮检查](../runs/review-02/layers-final/verification.json)。后续提交通过 `git log --oneline` 找回，不在提交内记录自身ID。

旧六种美术与截图保留，导航语义错误已修正；新G/H单独目录维护。回退视觉实验不应撤销已经证明必要的真实边修复；回退规范时须同步入口及新实验的token引用。产品仓库本轮未改代码、数据库或规划原件，所有增量在独立DCL仓库；外部总览／工作台入口仍是手工导航，须同步维护。

## v0.5 增量边界

2026-11-11 · 三组工作界面案例与规范 R02 的证据独立提交。I 的界面、共享导航接入、动态项目范围和新增颜色配置属于实现提交。评价与核查记录从项目入口接续。回退时先处理依赖 I 的入口与评价，再处理实现与证据。G/H 的旧截图与冻结记录可用于对照原版。[I 检查](../runs/visual-inspection/verification.json) · [I 评价](../applications/project-console/layer-study/evaluation.md#i-任务排查改进稿)

## v0.6 状态实验

本轮状态模型、样例、复测证据与入口在 DCL 中交付。实验引用首轮合成任务数据和已保存的字体。回退该提交可恢复此前入口，产出总览和工作台属于外部导航，需要同步调整。[状态方案](../applications/project-console/state-study/state-model.md) · [验证](../runs/state-study/verification.json)

## 历史验证边界

原型的导航／返回和只读条件已检查，文件来源哈希和入口检查见[最终核查](../runs/final-audit.json)。回退能力来自已建立的本地提交边界；本轮不实际撤销有效成果，也未验证真实产品写操作或数据库补偿事务。后续新增写行为须实现草案取消、revision 冲突、原子提交和有冲突检查的补偿撤销，再单独验收。
