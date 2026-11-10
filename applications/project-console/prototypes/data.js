// Synthetic fixture based on existing schema and work vocabulary, never live commitments.
window.DEMO_TASKS=[
 {id:'rules',code:'T-10',title:'核对赛题与参赛规则',project:'ic',status:'待开始',deps:[],output:'规则原文与核验清单'},
 {id:'mentor',code:'T-11',title:'确认导师与校内盖章办理路径',project:'ic',status:'阻塞中',deps:[],reason:'等待校内负责人的确认，尚无可执行的办理路径。',output:'负责人及办理条件'},
 {id:'direction',code:'T-12',title:'比较候选方向，确定主选与备选',project:'ic',status:'待开始',deps:['rules','mentor'],output:'候选对照表与选择依据'},
 {id:'socbase',code:'T-13',title:'定义 SoC 最小计算闭环',project:'soc',status:'已完成',deps:[],output:'系统接口与冒烟验证说明'},
 {id:'reuse',code:'T-14',title:'验证竞赛与个人 SoC 能否共享成果',project:'soc',status:'进行中',deps:['rules','socbase'],output:'可复用模块与适用边界'},
 {id:'scheme',code:'T-15',title:'写下最小方案与可检验的验收标准',project:'ic',status:'待开始',deps:['direction','reuse','socbase'],output:'一页方案：目标、非目标、演示与验证方法'},
 {id:'archive',code:'T-16',title:'整理旧工程的独有证据与可复用资产',project:'soc',status:'已完成',deps:[],output:'原件位置与证据索引'},
 {id:'review',code:'T-17',title:'复核方案中涉及跨项目共享、制造成本与验收证据的约束是否都已明确记录',project:'ic',status:'待开始',deps:['scheme','mentor'],output:'缺口清单与复核结论'}
];
