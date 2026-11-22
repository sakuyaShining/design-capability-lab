// Synthetic snapshot for the command desk prototype. Not the live workspace.
window.DECK_DATA = {
  week: { label: 'WEEK 47', range: '2026.11.22', note: '合成快照 / 刷新重置' },
  projects: [
    {
      id: 'ic', code: '01', name: '集创赛', full: '集创赛 · 单人参赛准备', status: '当前重点', priority: 1,
      color: '#b89bff', desc: '以单人参赛为主，先核实赛题与约束，再承诺实现范围。',
      stages: ['赛题与资格核验', '最小可行方案', '实现与验证', '交付与答辩'],
    },
    {
      id: 'soc', code: '02', name: 'SoC / 系统', full: '个人 SoC / 计算机系统', status: '长期建设', priority: 2,
      color: '#79d3c0', desc: '逐步构建可解释、可测试的计算机系统，与竞赛共享可复用成果。',
      stages: ['系统问题定义', '最小计算闭环', '软硬件协同', '性能与复现'],
    },
    {
      id: 'ai', code: '03', name: 'AI 研究', full: 'AI 自动化与表征学习', status: '长期建设', priority: 3,
      color: '#e0b36a', desc: '从机制与证据出发，积累文献、复现实验和自动化边界。',
      stages: ['问题与先行研究', '基线复现', '可控实验', '研究记录'],
    },
    {
      id: 'fpga', code: '04', name: 'FPGA 复盘', full: 'FPGA 电子乐器', status: '已弃赛 · 整理复盘', priority: 4,
      color: '#9aa2ad', desc: '2026-10-30 已弃赛。保留工程资产，复盘预算共识与制造交付缺口。',
      stages: ['文件盘点', '工程可复用性审查', '成本与协作复盘', '资产整理'],
    },
    {
      id: 'op', code: '05', name: '算子赛', full: '2027 算子赛 · 候选计划', status: '暂定方向', priority: 5,
      color: '#8fb6d8', desc: '明年考虑参加，先了解要求与资源，不提前锁定承诺。',
      stages: ['规则与资源调研', '算子基础', '微基准实验', '参赛决策'],
    },
  ],
  notes: {
    n1: { title: '先确认预算承担，再扩大技术投入', basis: '技术设计基本完成，但队友不愿承担 PCB / 硬件制造费用；2026-10-30 弃赛。', result: '下一次立项先明确资金上限、承担人和停止条件；不把默契当作资源承诺。', date: '10-30' },
    n2: { title: '赛题、资格与时间节点尚待核实', basis: '当前以单人参赛为主；页面未填入未经核实的官方截止日期。', result: '解除条件：保留官方规则原文与核验日期。', date: '11-07' },
    n3: { title: '每个 Session 只承担一个可验证目标', basis: '高频 Agent 迭代容易让职责、分支与交付标准混在一起。', result: '记录分支 / worktree、输入范围、提交 SHA、验证结果；尚未执行。', date: '11-07' },
  },
  tasks: [
    {
      id: 'rules', code: 'T-01', title: '核实集创赛赛题、资格与单人参赛条件',
      project: 'ic', kind: '已承诺任务', status: '已完成', date: '11-13', deps: [],
      output: '规则原文与约束清单；日期为规划草案',
      completion: '官方规则原文已归档，资格条款与单人参赛限制已核对；比赛日期仍未核实。',
      evidence: '规则原文 · 本机文件',
      note: 'n2',
      history: [{ action: 'finish', at: '11-13', note: '官方规则原文已归档，资格条款与单人参赛限制已核对；比赛日期仍未核实。' }],
    },
    {
      id: 'scheme', code: 'T-02', title: '写下最小方案与可检验的验收标准',
      project: 'ic', kind: '已承诺任务', status: '待开始', date: '11-17', deps: ['rules'],
      output: '一页方案：目标、非目标、演示与验证方法',
      note: 'n2',
      history: [],
    },
    {
      id: 'socbase', code: 'T-03', title: '定义 SoC 最小计算闭环',
      project: 'soc', kind: '已承诺任务', status: '已完成', date: '11-15', deps: [],
      output: 'CPU / 内存 / 总线 / 软件接口草图与冒烟验证',
      completion: '接口草图与冒烟验证说明完成，最小闭环可在模拟器运行。',
      evidence: '接口草图 · 冒烟记录',
      history: [{ action: 'finish', at: '11-15', note: '接口草图与冒烟验证说明完成，最小闭环可在模拟器运行。' }],
    },
    {
      id: 'reuse', code: 'T-04', title: '验证竞赛与个人 SoC 能否共享成果',
      project: 'soc', kind: '已承诺任务', status: '进行中', date: '11-18', deps: ['rules', 'socbase'],
      output: '可复用模块与不适用部分',
      note: 'n3',
      history: [],
    },
    {
      id: 'ai', code: 'T-05', title: '建立表征学习的先行研究问题表',
      project: 'ai', kind: '待验证想法', status: '待开始', date: '11-18', deps: [],
      output: '问题、关键词、代表论文、已有结论与可检验差异',
      history: [],
    },
    {
      id: 'fpga', code: 'T-06', title: '整理 FPGA 文件与预算决策时间线',
      project: 'fpga', kind: '已承诺任务', status: '阻塞中', previousPhase: 'active', date: '11-15', deps: [],
      output: '可复用文件索引；明确技术完成度与实际交付的差别',
      reason: '等队友确认 PCB 与硬件费用的最终承担人。',
      note: 'n1',
      history: [
        { action: 'block', at: '11-16', note: '等队友确认 PCB 与硬件费用的最终承担人。', stage: 'active' },
      ],
    },
    {
      id: 'op', code: 'T-07', title: '调查算子赛计算资源与基础要求',
      project: 'op', kind: '暂定方向', status: '待开始', date: '2027-01-10', deps: [],
      output: '官方要求与可获得资源清单',
      history: [],
    },
    {
      id: 'demo', code: 'T-08', title: '复核最小方案并准备一次演示',
      project: 'ic', kind: '已承诺任务', status: '待开始', date: '11-20', deps: ['scheme'],
      output: '演示脚本、复核结论与缺口清单',
      history: [],
    },
    {
      id: 'assets', code: 'T-09', title: '整理可复用模块清单与适用边界',
      project: 'soc', kind: '已承诺任务', status: '待开始', date: '11-21', deps: ['reuse'],
      output: '模块清单、来源与不适用部分',
      history: [],
    },
  ],
};
