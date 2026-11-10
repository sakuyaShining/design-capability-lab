# 六种任务依赖小样

2026-11-11 · 待审阅的本地交互原型。直接用浏览器打开 [index.html](index.html)，顶部 A—F 切换方案；“切换深浅”查看主题。其他侧栏项只表示产品规划位置。

共同任务：找到 T15 方案的两个未完成前置，进入“方向”，再查看“校内确认”的人工阻塞原因，最后返回原任务；观察筛选与搜索是否保持。可试隐藏已完成前置、跨项目和“异常样例”的缺失引用。

| 批次 | 方案 | 核心结构 |
| --- | --- | --- |
| 1 | A / B | 清单＋就地详情 / 两级关系图 |
| 2 | C / D | 逐层栏 / 原因档案 |
| 3 | E / F | 逐步排查队列 / 任务×前置矩阵 |

[逐批评价及取舍](../evaluation-results.md) · [整体规划原件](../../../../project-console/.sites-checkout/planning/overall-plan.md) · [研究综合](../../../docs/research-synthesis.md)。

## 运行与验证

页面为静态 HTML/CSS/JS，无安装、构建或 API。若需 HTTP 预览，在 PowerShell 运行：

```powershell
Set-Location D:/Dev/projects/design-capability-lab/applications/project-console/prototypes
D:/Dev/envs/maintenance/python.exe -m http.server 5197 --bind 127.0.0.1
```

服务运行时访问 http://127.0.0.1:5197/ ，Ctrl+C 停止。直接打开文件可正常使用全部六种方案，查询参数只选初始版本。

[最终自动检查](../../../runs/prototypes-final/verification.json) · [屏宽／主题与键盘检查](../../../runs/prototypes-final/responsive-keyboard.json)。复查脚本在项目 scripts/，需要本机已有 Playwright 和 Edge，使用脚本中明确的本机绝对路径；移机需调整依赖路径，原型本身无此依赖。截图是生成的验证证据，素材原件在各 case/evidence/，源码是本目录。

## 数据、来源与限制

data.js 是单独编写的八条合成任务，用于已完成／人工阻塞／多前置／共享前置／跨项目／长标题等条件；不是用户真实项目进度。未连接线上，不写 localStorage，不调用后端。刷新恢复初始状态；导航不是数据库提交。真实数据变更的取消／确认／撤销见整体规划，尚未实现。

Saira.ttf 与 Saira-OFL.txt 来自总控台现有 public/fonts/（design-library 基线 459a751），按随附 OFL 许可使用；中文沿用系统字体。其余布局、样式与逻辑为本轮源码；未使用游戏美术资产制作原型。游戏素材仅留在案例研究目录。

桌面、390px 手机截图与 375/768/1024/1440px 深浅主题检查已完成；B 手机弱化关系线，C/D 页面较长，F 表格需内部横向滚动。尚无真人测试、屏幕阅读器评估、大数据量／循环依赖处理或真实写入事务。属于方案比较，未进入生产 UI。
