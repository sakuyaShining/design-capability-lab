# G/H/I 层次与表达实验

2026-11-11 · 浏览器直接打开 [index.html](index.html)，默认进入 I「任务排查」。顶部可切换 G/H、深浅主题、样例和氛围图。打开「切换任务与筛选」可按当前数据中的项目选择另一任务。

- **G 工作台**：暗色导航、内凹任务列表与突出的当前工作面；文字、比例图和状态各承担不同职责。
- **H 研判页**：暖纸色、衬线标题、原因档案与原任务摘要；通过阅读节奏和分区建立层次。
- **I 任务排查**让当前任务、未满足数量和对应入口占据首屏。已满足项用紧凑记录呈现。下钻后可沿路径回看原任务。人工阻塞以具体原因作为主要内容。

源代码没有使用游戏图像或照搬某个新参考的页面。两者不是新增两份独立结构研究，而是利用不同组合检验层次与表达；与 A—F 的结构探索分别统计。[规范包](../../../standards/interface-capability/README.md) · [本轮评价](evaluation.md) · [用户原话与处理](../human-feedback.md)。

## 怎样试

默认方案的直接前置有3项，其中2项未完成。选“方向”→“校内确认”查看人工阻塞，再回到原任务；修改范围或搜索后重复。样例还包括全部满足、人工阻塞、缺失引用、循环、多分支与长标题，以及实现冻结后新增的“资料发布核对”。所有数据均为合成样例，不代表用户已承诺的任务。额外情境数据在 extra-cases.js，新增内容不需改布局／导航。

I 的「氛围图」可在电子项目样例中切换插图。该图为 ImageGen 生成的题材插图，预期产出为合成文本。[图片、提示词与来源记录](../../../runs/visual-inspection/asset.json)

如需 HTTP，项目根目录运行：

```powershell
Set-Location D:/Dev/projects/design-capability-lab
D:/Dev/envs/maintenance/python.exe -m http.server 5198 --bind 127.0.0.1
```

服务运行时访问 http://127.0.0.1:5198/applications/project-console/layer-study/ ，Ctrl+C 停止。服务必须从 DCL 根目录启动以便访问共享规范／字体；直接文件打开不受此限制。

## 原件、复查与限制

本目录维护源码和氛围图。共享颜色角色原件为 standards/interface-capability/tokens.json，tokens.css 为生成实现。字体引用旧原型的 Saira 与许可。研究原图在 cases/。复查 I 运行 `node scripts/check-inspection.mjs`，沿用本机已有 Edge 与 Playwright。原型可独立在浏览器打开。

上一轮 G/H 的源码哈希和样例检查对应提交 `a9c9a04`。当时的截图与比较图继续用于复盘。[G/H 历史检查](../../../runs/review-02/layers-final/verification.json) · [实现冻结记录](../../../runs/review-02/implementation-freeze.json) · [G/H 比较图](../../../runs/review-02/comparison.png)

当前版检查了 I 的首屏、项目筛选、下钻返回及六种额外情境。G/H 历史检查对应冻结版，当前版的比较用同一个入口测量。密集任务仍需滚动，真人视觉偏好、屏幕阅读器和大量数据性能待验证。[I 检查记录](../../../runs/visual-inspection/verification.json) · [I 设计评价](evaluation.md#i-任务排查改进稿)
