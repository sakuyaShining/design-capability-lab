const pressure = {
  id: 'P-204', name: '循环冷却泵', zone: '冷却回路',
  metric: '出口压力', unit: 'MPa', limit: 0.42, direction: 'below', digits: 2, scale: [0.30, 0.50],
  samples: [0.46, 0.46, 0.45, 0.46, 0.44, 0.43, 0.41, 0.40, 0.39, 0.38, 0.37, 0.36],
  effect: '冷却回路供压低于监测下限，交由机械巡检班核查。',
  group: '机械巡检班', revision: 17, time: '14:32',
};

const fixture = {
  date: '2026-11-13',
  assets: [
    pressure,
    {
      id: 'M-117', name: '二级输送驱动', zone: '输送廊道',
      metric: '轴承振动', unit: 'mm/s', limit: 5.0, direction: 'above', digits: 1, scale: [2, 7],
      samples: [3.6, 3.7, 3.7, 4.0, 3.8, 4.1, 4.5, 4.9, 5.2, 5.4, 5.6, 5.8],
      effect: '驱动端读数超过监测上限，交由机械巡检班复核测点。',
      group: '机械巡检班', revision: 8, time: '14:31',
    },
    {
      id: 'V-311', name: '排风调节阀', zone: '废气处理',
      metric: '开度偏差', unit: '%', limit: 10, direction: 'above', digits: 0, scale: [0, 25],
      samples: [5, 6, 6, 7, 10, 11, 11, 12, 13, 14, 14, 14],
      effect: '开度反馈偏离设定，仪控巡检班已收到登记记录。',
      group: '仪控巡检班', revision: 5, time: '14:30',
    },
    {id: 'T-092', name: '回水温度变送器', zone: '冷却回路', status: 'offline', metric: '回水温度', unit: '°C', time: '14:19'},
    {id: 'HX-203', name: '板式换热器', zone: '冷却回路', status: 'normal', metric: '回水温度', unit: '°C', value: '32.4', time: '14:32'},
    {id: 'F-122', name: '进风过滤段', zone: '废气处理', status: 'normal', metric: '滤段压差', unit: 'Pa', value: '82', time: '14:31'},
    {id: 'P-205', name: '循环冷却备用泵', zone: '冷却回路', status: 'normal', metric: '出口压力', unit: 'MPa', value: '0.46', time: '14:32'},
    {id: 'C-031', name: '主空压机', zone: '压缩空气', status: 'normal', metric: '出口压力', unit: 'MPa', value: '0.72', time: '14:32'},
    {id: 'B-103', name: '冷却塔补水阀', zone: '冷却回路', status: 'normal', metric: '阀门开度', unit: '%', value: '26', time: '14:31'},
    {id: 'D-018', name: '冷凝水排放泵', zone: '压缩空气', status: 'normal', metric: '集水槽液位', unit: '%', value: '41', time: '14:31'},
    {id: 'S-102', name: '输送带速度传感器', zone: '输送廊道', status: 'normal', metric: '带速', unit: 'm/s', value: '1.26', time: '14:32'},
    {id: 'F-305', name: '末端排风机', zone: '废气处理', status: 'normal', metric: '风机转速', unit: 'rpm', value: '1260', time: '14:31'},
  ],
  orders: [{id: 'WO-014', assetId: 'V-311', group: '仪控巡检班', time: '14:28', revision: 5, note: '复核开度反馈。'}],
  events: [
    {time: '14:27', assetId: 'P-204', text: '出口压力低于监测下限'},
    {time: '14:28', assetId: 'M-117', text: '轴承振动超过监测上限'},
    {time: '14:19', assetId: 'T-092', text: '遥测中断，最后一次采样'},
  ],
  changedPressure: {...pressure, samples: [...pressure.samples.slice(1), 0.34], revision: 18, time: '14:33'},
};
