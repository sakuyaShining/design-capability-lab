// Synthetic held-out scenario added after implementation freeze 9345d42.
window.EXTRA_CASES={
  "holdout": {
    "name": "新语境：资料发布核对",
    "root": "release/check",
    "tasks": [
      {
        "id": "release/check",
        "code": "R-20",
        "title": "发布前核对“图像来源 / 字体许可”、跨项目复用边界与回退说明 <试用稿>",
        "project": "publishing",
        "status": "待开始",
        "deps": [
          "rights",
          "qa"
        ],
        "output": "发布清单与版本来源；这是合成情境，不是实际发布任务"
      },
      {
        "id": "rights",
        "code": "R-21",
        "title": "核对第三方素材及字体的使用条件",
        "project": "publishing",
        "status": "待开始",
        "deps": [
          "art",
          "font"
        ],
        "output": "逐项许可与适用范围"
      },
      {
        "id": "qa",
        "code": "R-22",
        "title": "复查不同阅读设备的文字与引用",
        "project": "publishing",
        "status": "进行中",
        "deps": [
          "font"
        ],
        "output": "阅读与链接检查记录"
      },
      {
        "id": "art",
        "code": "R-23",
        "title": "登记图像作者与原始地址",
        "project": "publishing",
        "status": "已完成",
        "deps": [],
        "output": "作者及原图来源"
      },
      {
        "id": "font",
        "code": "R-24",
        "title": "确认嵌入字体的许可与替代方案",
        "project": "publishing",
        "status": "阻塞中",
        "reason": "等待确认发布范围，不能以预览正常代替许可核对。",
        "deps": [],
        "output": "许可清单与 <script> 元素示例的核验说明"
      }
    ]
  }
};
