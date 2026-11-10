# G/H：层次与表达实验

2026-11-11 · 待审阅。浏览器直接打开 [index.html](index.html)，无需安装或启动服务；切换 G/H、深浅主题、样例和背景纹理。其他导航项为规划定位，不是可操作页面。

- **G 工作台**：暗色导航、内凹任务列表与突出的当前工作面；文字、比例图和状态各承担不同职责。
- **H 研判页**：暖纸色、衬线标题、原因档案与原任务摘要；通过阅读节奏和分区建立层次。

源代码没有使用游戏图像或照搬某个新参考的页面。两者不是新增两份独立结构研究，而是利用不同组合检验层次与表达；与 A—F 的结构探索分别统计。[规范包](../../../standards/interface-capability/README.md) · [本轮评价](evaluation.md) · [用户原话与处理](../human-feedback.md)。

## 怎样试

默认方案的直接前置有3项，其中2项未完成。选“方向”→“校内确认”查看人工阻塞，再回到原任务；修改范围或搜索后重复。样例还包括全部满足、人工阻塞、缺失引用、循环、多分支与长标题，以及实现冻结后新增的“资料发布核对”。所有数据均为合成样例，不代表用户已承诺的任务。额外情境数据在 extra-cases.js，新增内容不需改布局／导航。

关闭纹理只移除背景纹理，信息和交互保持；不能由此自动判定哪种观感更好。预期产物摘要不是实际文件预览，没有后端事务或持久化写入。

如需 HTTP，项目根目录运行：

```powershell
Set-Location D:/Dev/projects/design-capability-lab
D:/Dev/envs/maintenance/python.exe -m http.server 5198 --bind 127.0.0.1
```

服务运行时访问 http://127.0.0.1:5198/applications/project-console/layer-study/ ，Ctrl+C 停止。服务必须从 DCL 根目录启动以便访问共享规范／字体；直接文件打开不受此限制。

## 原件、复查与限制

本目录是源码；颜色唯一原件是 standards/interface-capability/tokens.json，tokens.css 是生成实现。字体继续引用旧原型的 Saira 与许可，不复制另一份。新研究原图留在 cases/，未嵌入产品原型。

[最终检查](../../../runs/review-02/layers-final/verification.json)与[实现冻结记录](../../../runs/review-02/implementation-freeze.json)保存源码哈希、原场景和新情境结果。复查脚本 scripts/check-layer-study.mjs 复用既有 Playwright／Edge 本机路径；原型本身不依赖它们。截图在同一 runs 目录，比较图在[这里](../../../runs/review-02/comparison.png)。

手机页面仍偏长，H 的原任务摘要和成果说明在原因清单后方；项目范围下拉暂固定为集创赛／SoC，新发布核对情境请在“全部项目”查看。长列表需要收敛，暂未做大量数据性能或屏幕阅读器测试。视觉评价尚待用户审阅；源码不变的新情境通过不证明不会过拟合。
