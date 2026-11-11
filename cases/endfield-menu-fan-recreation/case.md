# DCL-RF01 · Endfield Menu 玩家复刻

2026-11-11 · 第三方实现参考 · 文档与源码初审

研究对象是 ccdr4gon 用 HTML、CSS 和 JavaScript 制作的《明日方舟：终末地》主菜单复刻。版本固定在 [8d3f3ae](https://github.com/ccdr4gon/endfield_menu/tree/8d3f3ae592c9573da888599fb4e1b9804f0e2e36)。本例收录在同一风格实例下，补充首轮 C01—C10 的实现参考。核对了作者说明、相关源码和预览图链接的可达性。[来源清单](sources.json)

## Key Screens · 关键画面

- 主菜单由中央圆盘、两侧入口、顶部读数与背景构成。源码将卡片、磁贴、新闻和顶栏放在具名深度层，中央地图在复刻中留空。可对照作者的预览图和场景层定义复核构图。[作者预览](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/docs/preview.jpg) · [场景层](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/shared-scene.js#L22-L26)
- 关闭后的页面显示重新打开提示。原型把整个 1920 × 1080 舞台按窗口等比缩放。布局参考集中在桌面总览，窄屏阅读和交互仍需单独验证。[页面结构](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/index.html#L129-L145) · [舞台适配](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L30-L40)

## Experience Notes · 体验分析

- **主对象、入口和读数可有不同视觉权重。** 中央圆盘聚合主题，左右两组承担入口，顶部保留读数。总控台可检验同一原则：用一个区域呈现当前任务与下一步，把依赖和全局摘要分别放在次级区域，再检查用户能否先识别处理对象。
- **背景和层深应服从识别。** 可以用固定面色、明暗差、边界与间距实现分区。视差、截图取色与装饰图标属于该复刻的表现手段。总控台有密集列表时，应对照测试长标题、窄屏和键盘焦点的可读性。[视觉层次对照](../surface-hierarchy-comparison/case.md)

## Motion Specification · 动效说明

作者描述的入场顺序为圆盘显现、倾转，随后两侧入口滑入和读数亮起。源码以约 900 ms 清理入场标记。退出由背景动画结束事件推进到关闭，另有 750 ms 超时兜底。系统请求减少动效时，关闭直接完成。以上为复刻文档及源码参数，实播时序待验证。[作者说明](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/README.md) · [时序常量](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L7-L10) · [关闭路径](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L51-L87)

## Interaction Flow · 交互流程

- 入口打开 → 按 Esc、关闭或电源按钮 → 开始退出 → 关闭 → 按 Esc 或提示重开。退出过程中重开会清理退出监听和计时器，再启动入场。
- 其余带 `data-action` 的菜单按钮发出 `ef-action` 事件供集成方接收。可用本例研究界面开合、中途反向输入和无动效时的状态收敛。总控台的确认、提交、失败和撤销仍按自身的任务规则验证。[事件处理](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L57-L103) · [总控台状态方案](../../applications/project-console/state-study/state-model.md)

## 使用范围

证据来自同一复刻仓库。原作游戏行为、浏览器实际运行、键盘焦点恢复和真人使用效果尚未验证。作者声明仓库采用 GPL-3.0-or-later，并将从游戏描摹的图标、采样的背景色场和卡片等高线排除在其许可之外。本地保留分析和固定版本链接，预览图及代码由上游维护。[上游许可说明](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/README.md#L84-L88)
