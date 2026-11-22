# 工业终端 DCL 验收评审

## 11 月 15 日视觉复核

用户反馈首版「还行，但是有点过于单调了」。同样本对照中，首版概况与诊断都采用相同节奏的等宽数字列，设备队列和诊断承载面也接近。本轮把概况压缩并与诊断对齐，改用墨色仪表承载当前读数，阈值和差额降一级，浅底队列保持逐行可比。1440×900 下 12 台设备均可见。[首版](../../runs/industrial-terminal/desktop.png) · [改稿](../../runs/industrial-terminal/visual-revision/desktop.png)

- **R01 / R02。** 表面和数字大小分工更明确，当前读数约为阈值字号的 2 倍。动作移到图表之后，符合本任务先核对数据再登记的阅读顺序。390×844 下主按钮下缘从首版的 576 px 移到 722 px，仍在首屏；保留队列跳转和焦点转移。现场值班员是否偏好这一顺序待试用。[窄屏](../../runs/industrial-terminal/visual-revision/mobile.png) · [队列优先](../../runs/industrial-terminal/visual-revision/queue-mobile.png)
- **R07 / 终末地纹理。** 把斜纹限定在实际越界侧。P-204 画在下限以下，M-117 画在上限以上。阈值虚线与灰阶、越限文字共同表达，展开后可用键盘逐表核对 12 个原值。等值反例、无遥测和整数读数的半格刻度均纳入复测。[上限示例](../../runs/industrial-terminal/visual-revision/upper-limit.png) · [去风格对照](../../runs/industrial-terminal/visual-revision/plain.png)
- **装饰与语义。** 英文眉标和品牌标识仍主要为风格识别；去掉斜纹时，以整块灰阶保留越限区。酸黄用于提醒、当前和行动。同样本的深色主题中，读数靠字号与结构继续区分。[深色](../../runs/industrial-terminal/visual-revision/dark.png)

改稿的 8 组浏览器检查、10 个屏宽与主题组合、3 条实测行为契约轨迹及 8 项既有单元测试通过。首版截图和其验证文件留在原处，改稿命令见[使用说明](README.md)。真人导视、视觉偏好及独立迁移仍待完成。[改稿验证](../../runs/industrial-terminal/visual-revision/verification.json) · [实测轨迹](../../runs/industrial-terminal/visual-revision/observed.json)

## 首版评审（11 月 14 日）

2026-11-14 / 本地试用 / 执行与复核为同一 Codex 会话，模型为运行时声明的 GPT-6（具体变体未暴露）。评审阶段以冻结页面、同数据对照、实际操作与客观证据复核。保留对设计过程的已知背景，评审身份为 Agent 自评。

## 按 acceptance.md 判定

依据 [DCL 验收约定 0.1](../../evaluations/acceptance.md)。本轮覆盖用户指定的工业终端，验收文件另设的播客校对任务及干净会话条件仍待执行。

| 条件 | 判定 | 证据或卡点 |
| --- | --- | --- |
| 新会话不依赖之前的聊天记录 | 未验证 | 本轮以现有会话和完整 DCL 仓库执行，也按要求读了案例原件。目标入口可离线打开，执行过程可追溯到独立需求和具体文件。仍需按验收要求只给选定 Skill、独立需求及工作区，再观察一轮。 |
| 无需重新解释基础设计方法 | 本轮有证据 | 用户给出任务方向、风格与验收入口。值班角色、设备范围、数据、层级、故障分支和测试由现有方法推导。 |
| 处理与训练案例不同的产品需求 | 初步支持 | 工业主题与 C08 同域。实际对象为遥测样本、阈值、设备及关联工单，业务逻辑包含两种越限方向、遥测中断、快照过期和防重复登记。样本内排除总控台原有的依赖路径。 |
| 真实可操作的交互 | 本地原型通过 | 浏览器完成设备切换、筛选、登记、查看回执、取消与冲突恢复。登记创建可定位的内存记录。真实工业事务未接入。 |
| 自动检查和人工质量评估 | 部分通过 | 7 组浏览器检查、10 个屏宽×主题组合、3 条所观测契约轨迹通过。下文有 Agent 视觉观察。真人导视、交互连续性、视觉层次、原创性与读屏实测待完成。 |
| 知识跨项目复用并经版本迭代改进 | 部分证据 | 总控台与本终端共用 Skill、规则和测试方法，保留总控台回归。两者放在 DCL 仓库；独立项目迁移与 Skill 0.1.0／0.2.0 同条件对照待完成。 |

总判定为**本地原型及工程检查通过，能力包完整验收尚未通过**。本轮发现留在此记录，共享规则仍使用现有版本。没有将同仓库复用计作干净环境迁移。

## 规则作用与卡点

编号和版本来自 [界面能力规范 0.3](../../standards/interface-capability/rules.json)。作用依据来自终端实现、对照页面或实测观察。

| 规则 | 判定 | 可见后果及边界 |
| --- | --- | --- |
| R01 v0.1 表面表达职责 | 起作用 | 墨色顶栏定位整个终端，队列与诊断各有工作面，确认层才遮住背景。关闭黄色和标识仍可识别三者。保留相同结构时，暖纸与深色主题的偏好待真人判断。 |
| R02 v0.2 首屏焦点与等权条目 | 起作用，也卡过 | 同字级扫描队列，当前对象标题、读数、阈值和差额独立放大。390×844 中登记按钮下缘从队列优先的 y=1333 移到 y=576。诊断优先曾把换设备入口挤出首屏，补了能把键盘焦点带到队列的“跳到设备队列”。首屏位置支持局部结论，任务时间待真人测。 |
| R03 v0.1 路径边须真实 | 不适用 | 快照与阈值是比较关系，设备只有实际工单关联。原型采用表格和详情，保留真实关联，省去工艺拓扑与导航箭头图。 |
| R04 v0.1 返回与筛选保留语境 | 起作用 | P-204 登记后离开“待巡检”，但当前诊断、筛选条件仍在且有范围外提示。该规则阻止了完成提交后自动换到下一台设备的设计。 |
| R05 v0.1 状态和焦点分开 | 起作用 | “越限”“已登记”“当前设备”分别来自最新读数、工单关联、选中对象。登记后越限仍为 3，待巡检从 2 降至 1；去黄色后状态仍有文字和形状。 |
| R06 v0.1 预览与确认边界 | 起作用，真实事务待验证 | 预览交代快照、来源及结果；Esc 返回发起控件；r17 被拒绝时备注保留，载入 r18 后由用户重新确认。当前样本只写同页内存，补偿撤销、权限与并发持久化缺少可验收实现。 |
| R07 v0.1 图形承载数据 | 起作用 | 以最近 12 个实际模拟样本画柱与阈值线，按时间和单位可展开核对。条数、越限点与差额由数据生成。模板里的圆盘、地形纹理与随机编号缺少本任务所需的信息，省去。 |
| R08 v0.1 反例约束复用 | 起作用 | 同数据对照更改界面结构和首屏顺序。加载冻结实现后注入长设备名、读数恰等于阈值的边界，补做待巡检清空但仍有 2 台越限的反例。它们是合成边界检查，结论限于本产品和样本规模。 |
| R09 v0.1 可达性和复盘 | 起作用，也卡过 | 键盘到达并退出预览、定位工单、测试五对文字对比并检查宽切角。在视觉查看前，“无横向溢出”曾掩盖队列入口在手机首屏外；用首屏截图和实际焦点检查修正。10 个布局组合、测得文字色对 5.92:1–16.31:1。屏幕阅读器、真实触屏与长期使用待测。 |
| R10 v0.1 跨对象结果 | 起作用 | 预览明确 P-204、机械巡检班与新增关联。回执跳到 WO-015，浏览器读回记录的设备关联与采样版本。正常及恢复两条路径各只生成一条 P-204 记录，取消时仍只有 1 条既有记录。 |

### 鹰角风格规则在本轮的实际分工

- **有交互职责。** 小切角标识设备编号、筛选和动作，常态面板保持直角。酸黄实色分配给待巡检总数、当前设备、当前主动作和趋势最新样本。默认与移除高亮的比较里，选中行靠墨色边和文字保持辨识，主按钮少了第一眼的权重。所有越限均有文字及形状，黄色不是判级方式。静态黄底主按钮是任务优先的选择，桌面也采用。
- **主要是装饰。** 大写英文眉标、宽体字的品牌调性、左上斜形图案与暖纸色建立风格。关闭英文和图案，经过空白归一化后的业务文字完全相同。这个对照只测信息保留，未单独量出英文、暖纸或图案各自对审美的贡献。数字真实、等宽和列对齐仍有独立的扫描职责。
- **遇到冲突的形式。** 模板圆盘在设备逐列比较时没有业务数据对应，照搬会占用队列与诊断的首屏空间；三色开场条会增加第二、第三个信号色，本页省去。对应“看板切角”与“切角表示可操作”的冲突，优先保留可操作语义；看板不切角。复用 CSS token 语义和现有字体，页面为离线加载实现自己的 CSS 子集。没有验证触控硬件、全套预设或读屏。

### 评审阶段的观察

- **导视。** 默认桌面可以同屏从区域计数定位 P-204，再核对 0.36 MPa、下限 0.42 MPa、差额 0.06 MPa。选择旁边同属冷却回路的健康设备时，标题和行动区同步改。窄屏把设备发现让给一个快捷入口，这一代价需真人首次试用确认。
- **连续性。** 载入 r18 前可同时看到旧版读数与拒绝理由；载入后新读数为 0.34 MPa，备注仍在，确认对象保持 P-204。无后端的设计仅模拟确认时过期，尚无自动到达的异步竞态。
- **视觉层次与原创适配。** 概况先交代区域，具体差值、操作和采样撑起诊断面。桌面筛选仅剩一两行时，队列下方留白较大。深色仍靠分隔、数值与状态区别，版式由设备比较与审核流程推导。Agent 观察支持这几项局部判断，审美偏好仍需实际使用者。 [桌面](../../runs/industrial-terminal/desktop.png) · [深色](../../runs/industrial-terminal/dark.png) · [手机](../../runs/industrial-terminal/mobile.png) · [队列优先](../../runs/industrial-terminal/queue-mobile.png) · [去风格](../../runs/industrial-terminal/plain.png) · [拒绝](../../runs/industrial-terminal/stale.png) · [回执](../../runs/industrial-terminal/registered.png)

## 实际使用的来源

| 来源与层级 | 这次怎么用 |
| --- | --- |
| [dcl-design 0.2.0](../../.agents/skills/dcl-design/SKILL.md)，基线 Git `e03ad44805f1a2e2ff503c668d601d5068e0732d` | 任务定义、业务与视图分层、两种结构表达、浏览器证据。[design](../../.agents/skills/dcl-design/references/design.md) 支持身份、状态、动作分开；[behavior](../../.agents/skills/dcl-design/references/behavior.md)、[随包关联记录契约](../../.agents/skills/dcl-design/references/linked-record-operation.json) 和 [跨对象指南](../../.agents/skills/dcl-design/references/object-changes.md) 用于拟定取消、拒绝、重试、回执及目标事实；[review](../../.agents/skills/dcl-design/references/review.md) 用于人工任务与证据边界。 |
| [endfield-ui 原件](C:/Users/Sakuya/.codex/skills/endfield-ui/SKILL.md)，SKILL.md SHA256 `0da04fbcae6be1bc1bdf7851ccc48874fd3a9b5b1b7abd0d3f745c056574c697` | 读 [variation](C:/Users/Sakuya/.codex/skills/endfield-ui/references/variation.md)、[桌面 web 指南](C:/Users/Sakuya/.codex/skills/endfield-ui/references/platforms/web.md)、[token 原件](C:/Users/Sakuya/.codex/skills/endfield-ui/assets/tokens.json) 及 [console 模板](C:/Users/Sakuya/.codex/skills/endfield-ui/templates/console.html)，目视 [控制台样张](C:/Users/Sakuya/.codex/skills/endfield-ui/examples/web/console-light.jpg)。从 token 取 neutral ink、warm light/dark、yellow、紧切角比例、数字字体及 100ms 响应，主题强调集中定义。token 哈希 `4b7e6831f2904cb05b8fee18101b6457abe06c2122fdbd601f96f1fcd95b42fc`。 |
| [C08 产线诊断](../../cases/endfield-production-diagnosis/case.md)，直接看原图 [官方配方提示 E01](../../cases/endfield-production-diagnosis/evidence/smart-recipe.jpg)、[攻略状态报表 E04](../../cases/endfield-production-diagnosis/evidence/power-details.png) | S01 提供设备身份、异常解释与下一步共处的静态画面；S02/E04 提供当前与理论数字列式比较的静态画面。原型换成读数、阈值、差额和班组。两张图各有自己的版本、观察范围及来源，[原图哈希清单](../../cases/endfield-production-diagnosis/sources.json) 已登记。 |
| [C10 俯瞰和对象选择](../../cases/endfield-overview-selection/case.md)，直接看 S01 视频的 [派生帧 t1-760](../../cases/endfield-overview-selection/evidence/frames-v2/t1-760.png) | 帧中左侧对象列表和右侧当前对象信息分工，给队列与诊断并置提供参考。帧出自教学片段，[原片与抽帧清单](../../cases/endfield-overview-selection/sources.json) 有哈希和来源。页面没有移植教学遮罩或推测原游戏返回行为。 |
| [C07 材料缺口](../../cases/endfield-material-shortage/case.md)、[F01 工作对象](../../cases/focused-workspaces/case.md)、[V01 表面层次](../../cases/surface-hierarchy-comparison/case.md) | 使用已沉淀的规则和案例文字。C07-P01 提醒切到局部时保留原对象与差额，F01-S01/02 的摘要支持等权条目和局部上下文，V01 支持面、线、明暗和注意力分工。原始在线来源在各自清单，评审用仓库快照。 |
| [状态转移 UI 规范 0.1](../../standards/interface-capability/state-transitions.md)、[验证规范](../../standards/interface-capability/validation.md)、[跨对象研究](../../cases/cross-object-changes/case.md) | 从转移规范继承守卫、明确确认、就地解释与保留输入；从验证规范继承配色、焦点、反例与证据分类；跨对象研究经 R10 进入协议。Product Design and UX、Anthropic Frontend Design 与 Vercel 的做法经 DCL 已有规范间接继承，本轮未独立调用这三份 Skill。 |

案例媒体用于观察，无任何游戏资源嵌入原型。测试读数、编号、时间来自 [本轮固定样本](fixture.js)，各计数和趋势从样本生成。终端工程沿用 DCL 本地静态网页与已有 Edge/Playwright 工具。

## 可复现证据

- 实现版本以冻结的五文件 SHA256 标识，随设备终端 [verification.json](../../runs/industrial-terminal/verification.json) 存档。Edge 157.0.4341.46、Node 24.18.0、Python 3.14.10。离线检查未产生网络请求或页面脚本错误。
- 首版浏览器脚本检查通过。当前脚本默认对改稿运行，首版 [运行结果](../../runs/industrial-terminal/verification.json) 和 [实测轨迹](../../runs/industrial-terminal/observed.json) 保留归档。
- `python .agents/skills/dcl-design/scripts/validate_behavior.py applications/industrial-terminal/behavior.json --observed runs/industrial-terminal/observed.json` 通过。契约最初将 scenarios 写成数组，校验器拒绝。按照随包可执行例改为场景名映射。文字说明可补出 JSON 最小形状，候选改进待版本对照。
- `python -m unittest discover -s tests` 8 项通过。`python scripts/build-spec-assets.py --check` 10 张规则卡与 48 对既有颜色检查通过。终端颜色五对的测量另见本轮记录。
- `node scripts/check-state-study.mjs runs/industrial-terminal/state-study-regression` 旧总控台 5 组回归通过。其脚本报告字段 `date` 是原有硬编码标签，复跑由本轮目录与命令标识。[回归记录](../../runs/industrial-terminal/state-study-regression/verification.json)

## 真人复核任务

从 [默认终端](index.html) 开始，先请受测人找出一台应由机械巡检班跟进的设备，说明依据、登记并找回工单。第二次从 [过期快照情境](index.html?scenario=stale) 打开，填写自己的备注并尝试完成相同任务。两次均先提供任务目标。观察是否混淆越限与已登记，首次找错的位置、是否能自行恢复、对比桌面和窄屏首次找到设备的过程，以及风格对理解的帮助或干扰。逐项记录完成、需改或未审，并附停留画面。当前真人审核为未审。
