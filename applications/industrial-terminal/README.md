# 设备运维终端

变体：酸黄 / 暖纸 / 小切角 / 无全页底纹 / 紧凑 / 短按键反馈。  
主画面：浅色设备队列与墨色诊断仪表并列，当前读数放大，阈值与最近 12 个样本同屏。  
页面类型：控制台，支持浅色和深色。

## 打开与试用

双击 [index.html](index.html) 用 Edge 或 Chromium 打开。页面离线运行，刷新重置模拟状态。工作范围为虚构的北区制造中心 A 区、12 台设备、一班次。没有线上遥测、设备控制、身份服务或持久化。时间与阈值只属于 [模拟样本](fixture.js)。

| 入口 | 用途 |
| --- | --- |
| [默认终端](index.html) | 11 月 15 日视觉改稿。桌面并排查看队列与诊断，窄屏诊断优先，首屏可跳到队列。 |
| [过期快照情境](index.html?scenario=stale) | 在 P-204 的 r17 快照填写备注并确认，模拟系统在确认时看到 r18。载入最新读数后复核，再确认。 |
| [设备队列优先](index.html?layout=queue) | 同样本、同交互，队列整段放在诊断前。用 390×844 窗口比较。 |
| [去风格对照](index.html?highlight=off&skin=plain) | 保持结构和数据，关闭黄色引导，隐藏英文眉标及品牌图形，越限区用纯色代替斜纹。 |
| [深色终端](index.html?theme=dark) | 同样本检查表面分隔、文字与状态。 |
| [验收评审与来源台账](review.md) | 按验收逐项判定，记录规则取舍、原始画面、命令、限制与真人任务。 |

[首版桌面](../../runs/industrial-terminal/desktop.png) · [改稿桌面](../../runs/industrial-terminal/visual-revision/desktop.png) · [改稿窄屏](../../runs/industrial-terminal/visual-revision/mobile.png)

## 任务与数据层级

值班员接班时要判断今天有多少设备越限、具体哪台要巡检、依据是什么，以及登记交给哪个班组。首个任务完成条件为找到越限设备、说明阈值方向与差额、登记后找得到新工单，并能解释为什么设备仍显示越限。最大的风险是使用过期读数或重复登记，误把工单当作异常已解除的证据。

1. **区域摘要**保持四个计数口径。受监设备总数、越限数、待巡检数、已登记工单数分别计算。遥测中断可筛选，读数缺失同时标明最后采样。
2. **设备队列**按样本既定次序展示相同字段。编号选中后只变更当前设备，筛选只缩小队列。当前设备离开筛选范围时在队列就地提示。
3. **设备诊断**固定设备身份、当前读数、阈值与差额。近期样本和越限区放在读数下方，斜纹随上限或下限变化；接续阅读可展开精确样本，再从仪表下方登记。有效样本根据严格上下界判定，读数等于阈值时处于限内。正常状态与遥测中断有各自说明。
4. **结果与历史**放在班次记录。登记后的操作定位到可核对的工单编号、来源设备、班组和备注。设备状态继续由遥测样本决定。

和现有控制台模板相比，主画面用实际采样序列取代分段导航圆盘，双栏工作面取代环形面板，设备队列和登记预览取代对称统计卡。样式保留命令栏、切角、真实数字和细线。Saira 本地字体复用仓库[已有字体文件](../project-console/prototypes/assets/Saira.ttf)与 [OFL 许可](../project-console/prototypes/assets/Saira-OFL.txt)，中文使用系统黑体。

## 行为与维护

设备与采样版本是业务数据。越限与能否登记从样本及已有关联计算。筛选、当前设备和对话框草案单独保存。模拟值班员可对一台仍越限、尚无关联工单的设备登记一次。预览说明来源设备、接收班组、读数版本和新增结果。取消或旧版拒绝不新增工单。载入新读数保留草案，从新版本重新确认。运行结果见 [改稿验证记录](../../runs/industrial-terminal/visual-revision/verification.json)。

原型入口、源码与行为契约均在本目录。可编辑数据为 [fixture.js](fixture.js)，决策与界面由 [app.js](app.js) 和 [style.css](style.css) 维护。状态和关联事实见 [behavior.json](behavior.json)。验证从仓库根目录运行。

```powershell
node scripts/check-industrial-terminal.mjs
python .agents/skills/dcl-design/scripts/validate_behavior.py applications/industrial-terminal/behavior.json --observed runs/industrial-terminal/visual-revision/observed.json
```

浏览器检查使用仓库已有的本机 Playwright 和 Edge，未新增依赖。可设置 `DCL_PLAYWRIGHT` 为当地 Playwright `index.mjs` 的绝对路径，`DCL_EDGE` 为可用 Chromium 可执行文件。直接试用 HTML 只需要浏览器。当前状态为本地试用原型，完整验收状态与仍需观察的项目见 [评审](review.md)。
