// All projects and tasks below are fictional demo data.
window.DEMO_TASKS = [
  { id: 'brief', code: 'EX-01', title: '确认社区展览主题', project: 'exhibit', status: '待开始', deps: [], output: '主题与观众说明' },
  { id: 'venue', code: 'EX-02', title: '确认展厅布置时段', project: 'exhibit', status: '阻塞中', deps: [], reason: '等待场地确认开放时段。', output: '可用时段记录' },
  { id: 'layout', code: 'EX-03', title: '确定展位和参观路线', project: 'exhibit', status: '待开始', deps: ['brief', 'venue'], output: '平面草图与动线说明' },
  { id: 'stock', code: 'PR-01', title: '确认纸张和展牌尺寸', project: 'print', status: '已完成', deps: [], output: '展牌尺寸与用纸规格' },
  { id: 'signage', code: 'PR-02', title: '完成展区导览牌样稿', project: 'print', status: '进行中', deps: ['brief', 'stock'], output: '导览牌样稿与说明' },
  { id: 'plan', code: 'EX-04', title: '编写布展清单和验收标准', project: 'exhibit', status: '待开始', deps: ['layout', 'signage', 'stock'], output: '可逐项核对的布展清单' },
  { id: 'review', code: 'EX-05', title: '复核展厅开放前的布展清单并确认观众入口、展牌内容与无障碍动线', project: 'exhibit', status: '待开始', deps: ['plan', 'venue'], output: '开放前复核记录' }
];
