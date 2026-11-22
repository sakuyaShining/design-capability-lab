# 工作台作为任务入口 · 本机试点

2026-11-15 · 一次真实源码核对已走完 · 待人类试用。PC-01「核对 Web 与 Agent 的任务重开规则」已完成，PC-02「评估是否统一 Web 与 Agent 的重开规则」已能查看结论，仍处于待开始。试点属于 DCL 工作台，产品 checkout 用于读取源码和隔离调用其处理器。

## 进入任务

双击 [PC-01 离线入口](tasks/PC-01/index.html)即可阅读步骤图和已提交结论，或进入 [PC-02 离线入口](tasks/PC-02/index.html) 查看它如何使用同一份结果。从文件打开工作台，再点页头的「续做试点」也会进入 PC-01 的离线页。离线页是已完成试点的阅读快照。

若要进入保存和提交的交互版，在 DCL 根目录运行 `node scripts/serve-task-entry.mjs`，访问 [PC-01 交互入口](http://127.0.0.1:5187/applications/project-console/workbench/task-entry.html?task=PC-01)。服务只监听本机回环地址，终止后再运行同一命令即可恢复访问。 [本机服务脚本](../../../scripts/serve-task-entry.mjs) · [工作台](index.html)

已完成的试点可从 PC-01 打开源码、查看结论，进入 [PC-02](http://127.0.0.1:5187/applications/project-console/workbench/task-entry.html?task=PC-02) 再沿链接返回同一份结论。待办、草稿和交付结果属于已完成的这次试点。实际提交的结论以磁盘记录为原件，同一个结果在两个任务中显示。 [任务记录原件](../../../runs/project-workbench/task-entry/record.json)

## 实际走完的流程

1. 从工作台进入 PC-01，打开产品仓库的 `app/page.tsx`，任务仍为待开始。此时 PC-02 显示等待核对结论。
2. 开始核对，保存首次读码的发现与下一步。关闭浏览器并停止本机服务，草稿保留在 DCL 运行目录。
3. 新启动服务和浏览器，从完全相同的任务地址打开。页面恢复「进行中」和原进展，继续打开 Web 写入和 Agent 源码，运行隔离对照。
4. 先试缺少依据的提交，表单拒绝并保留结论，已提交结果仍为零。补齐源码引用后完成 PC-01。PC-02 读取成果标识 `PC-01-result`，可以打开引用源码并返回 PC-01，仍保持自己的待开始阶段。

[中断前保存](../../../runs/project-workbench/task-entry/01-saved.png) · [重开并继续](../../../runs/project-workbench/task-entry/02-resumed.png) · [下游追溯](../../../runs/project-workbench/task-entry/03-downstream.png) · [浏览器记录](../../../runs/project-workbench/task-entry/browser-evidence.json)

## 这项任务实际查出的结果

产品 checkout 版本 `8ad63a751e34f5834de9f1e73f3ed43ed30205a5`。有一个已完成的下游依赖前置时，Web 的 PUT 返回 200，保存「前置待开始、下游已完成」。Agent `upsert_task` 拒绝同一变更，写入次数为零。把下游改为进行中，两条路径都允许重开前置，保留下游进行中。对照直接调用本地源码的两个处理器，以内存替身记录数据库写入。引用源码的内容哈希和 Git 版本随结果一起保留。 [隔离对照输出](../../../runs/project-workbench/task-entry/guard-probe.json) · [隔离对照脚本](../../../runs/project-workbench/task-entry/probe-reopen.mjs)

## 用途、边界和复现

本次闭环验证了固定入口、显式保存后续做、提交证据关联和下游回查。下一步最值得由用户实测的是，隔天打开同一任务时，保存的进展能否让自己免于重新读上下文。当前进展需要点击保存，试点限于一台机器上的这项源码核对。多人协作、跨设备恢复、修改已提交结论以及其他任务类别未验证。产品写入规则的修订仍是独立事项。

采用 DCL Design 0.2.0 的阶段与导航分离、结果关联校验和浏览器取证。试点契约有八个采样点，使用 Edge 157.0.4341.60，桌面走完整流程，并检查 390×844 的结果页。原工作台的 11 组浏览器检查、10 个布局及仓库 8 项单元测试通过。 [契约](task-entry.behavior.json) · [观察轨迹](../../../runs/project-workbench/task-entry/observed.json) · [移动端](../../../runs/project-workbench/task-entry/04-mobile.png)

从 DCL 根目录运行如下命令可在新目录重走，不改已完成试点记录。需要本机产品 checkout 与其已有依赖。可用 `DCL_EDGE`、`DCL_PLAYWRIGHT` 指定测试浏览器和 Playwright。每个检查命令会独立启动和关闭服务、浏览器，复现时端口须空闲。

```powershell
$env:DCL_TASK_ENTRY_RUN = Join-Path (Resolve-Path runs/project-workbench) ("task-entry-replay-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$env:DCL_TASK_ENTRY_PORT = '5188'
node runs/project-workbench/task-entry/check.mjs begin
node runs/project-workbench/task-entry/check.mjs resume
node runs/project-workbench/task-entry/check.mjs inspect
python .agents/skills/dcl-design/scripts/validate_behavior.py applications/project-console/workbench/task-entry.behavior.json --observed (Join-Path $env:DCL_TASK_ENTRY_RUN observed.json)
Remove-Item Env:DCL_TASK_ENTRY_RUN,Env:DCL_TASK_ENTRY_PORT
```
