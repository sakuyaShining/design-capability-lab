# 总控台文件组织与 DCL 归属梳理

核查日期：2026-11-10。状态：现状盘点和入口整理完成；物理拆分、迁移及分支调整尚未执行。本文是组织清单，不复制研究正文。

## 当前真实结构

```text
D:/Dev/projects/project-console/          本机入口，不是 Git 仓库
├─ README.md                             项目定位、启动与设计库链接
├─ AGENTS.md                             指向源码内的工作指令
└─ .sites-checkout/                       Git 仓库与源码根目录
   ├─ .git/                              当前 design-library 分支
   ├─ README.md                          本地首页说明＋原 Starter 说明
   ├─ AGENTS.md                          产品实施与设计研究接续指令
   ├─ PRODUCT.md / PROJECT.md             产品定位、开发结构与工具约定
   ├─ DESIGN.md                          产品界面规范
   ├─ app/                               页面、业务模型、API、Agent/MCP
   ├─ components/、hooks/、lib/           通用组件及基础代码
   ├─ db/、drizzle/、worker/              数据定义、迁移、服务入口
   ├─ public/                            产品资源，含字体及许可
   ├─ review/                            产品验收与设计研究材料，20 个已跟踪文件
   │  ├─ README.md                       设计规范与素材库入口
   │  ├─ design-plan.md                  首页设计方案与后续研究链接
   │  ├─ home-desktop.jpg                桌面样张
   │  ├─ home-mobile.jpg                 手机样张
   │  ├─ home-motion-desktop.jpg         动效版桌面样张
   │  ├─ home-motion-mobile.jpg          动效版手机样张
   │  ├─ verification.json               首页验证与限制
   │  ├─ case-studies.md                 多产品案例分析与总控台改版假设
   │  ├─ human-feedback.md               用户方法要求、公开反馈与产品适配
   │  ├─ research-production.md          四成分研究制作流程草案
   │  ├─ case-template.md                案例模板
   │  ├─ reference-library.md            参考来源索引
   │  ├─ ignoredone-study.md             参考资源、工具及研究方法分析
   │  ├─ upstream-references.json        已读上游 Skill 的版本哈希
   │  ├─ evidence/ignoredone/            3 张原图及 sources.json
   │  ├─ library-manifest.json           有界文件清单及哈希
   │  └─ check-library.py                清单、链接、来源与 Git 排除校验
   ├─ scripts/、配置、锁文件              开发、构建与托管配置
   ├─ node_modules/                      可重建依赖
   ├─ dist/、.next/、.vinext/等           构建或框架运行状态
   └─ .wrangler/、.sites-runtime/         本地数据库、配置及初始化材料
```

树中省略了通用组件、配置和依赖的内部文件。`review/workspace-rev13.json` 是被 Git 忽略的私人数据快照，不在上述 20 个跟踪文件中；数据库与快照均不属于设计能力交付物。

## Git 关系

| 项目 | Git 根目录 | 当前分支与版本 |
| --- | --- | --- |
| 总控台 | `D:/Dev/projects/project-console/.sites-checkout/` | `design-library`：459a751；`main`：58891d6；标签 `design-library-v0.1.0` 固定研究与首页样张基线 |
| DCL | `D:/Dev/projects/design-capability-lab/` | `master`，尚无提交；2026-11-10 已完成项目目录搬迁，与总控台同属 D:/Dev/projects/ |

`design-library` 不是独立项目或独立仓库。它在总控台仓库内，同时保存了首页实现与研究材料；分支名称不能替代两个项目的职责划分。

## 从哪里找材料，以及如何归属

以下为整理判断；所有原件当前仍位于总控台，表中“候选”不表示已迁移或已采用。

| 当前原件（相对总控台 Git 根目录） | 内容与归属判断 | 整理方向 |
| --- | --- | --- |
| `app/`、`components/`、`db/`、`drizzle/`、`worker/` 等源码 | 总控台产品实现 | 留在总控台 |
| `PRODUCT.md`、`PROJECT.md`、`DESIGN.md` | 总控台产品与开发约定 | 留在总控台 |
| `app/home-design.css`、`app/home-reveal.tsx`、`public/fonts/` | 已应用到产品的样式、动效、字体与许可 | 留在总控台；DCL 通过版本引用评估实际应用 |
| `review/design-plan.md`、4 张 `home-*.jpg`、`verification.json` | 总控台候选方案及其验收证据 | 留在总控台，供首个使用情景引用 |
| `review/research-production.md`、`case-template.md` | 倾向可复用的研究方法与模板，但含地图试件、项目边界及相对链接 | DCL 方法候选；逐段核对并处理引用后再确定独立原件 |
| `review/case-studies.md` | 终末地官网、Linear、GitHub Projects、Backstage 的资料分析，混有总控台诊断与下一版假设 | 按研究依据与产品应用区分；不整份搬成终末地 UI 证据 |
| `review/human-feedback.md` | 研究方法偏好、历史明日方舟/终末地公开自述与总控台适配处理混合；含私人对话摘录 | 按反馈对象拆分，保留原话、来源和记录标识；不公开上传 |
| `review/reference-library.md`、`ignoredone-study.md`、`evidence/ignoredone/`、`upstream-references.json` | 可复用参考候选、来源与上游版本；也含总控台语境 | 先做来源与适用范围审查；证据与来源记录一起处理 |
| `review/README.md`、`library-manifest.json`、`check-library.py` | 现有总控台库入口及清单机制，包含固定路径与文件分类 | 在实际拆分时同步更新，保持旧基线可追溯 |
| 私人快照、数据库、运行配置 | 总控台本地验收状态 | 留在原位，不纳入 DCL 研究正文 |
| 依赖与构建输出 | 可重建内容，不是知识原件 | 沿用总控台环境；当前不做清理 |

阅读原件从[总控台设计库](D:/Dev/projects/project-console/.sites-checkout/review/README.md)进入；产品使用从[总控台固定入口](D:/Dev/projects/project-console/README.md)进入。

## 拆分前需要处理的引用

- 总控台源码内 `README.md` 和 `AGENTS.md` 直接引用现有研究文件；只搬文件会令入口与工作指令失效。
- `design-plan.md` 引用 `case-studies.md`；研究、反馈、模板和来源索引之间有相互的相对链接，需要随拆分更新。
- `check-library.py` 固定扫描 `review/` 并按文件名分类，清单记录内容哈希；移动或改写文件后必须更新清单并运行校验。
- 第三方原图与 `sources.json` 的路径、大小、哈希绑定；移动时必须整组处理，不能只取图片。
- 旧标签及其 Git 历史保留原来的结构；新的工作区结构需要自己的修订记录，不改写历史。
- DCL 首轮限定终末地 UI；现有的多产品分析、官网观察和其他游戏历史反馈可以作为背景资料，不能算作已完成首轮连续交互取证，也不自动扩大案例数量。

## 本轮整理结果与限制

已完成：现状目录展示、职责分类、引用影响清单，以及两个项目入口到本页的导航。唯一新增的清单原件在 DCL；没有新建第二套研究正文或复制产品源码。

尚未执行：原研究文档的内容拆分、原件迁移、分支命名调整、Git 提交和远端备份。它们没有被登记为完成；DCL-001-T01 已开始，首批材料从[DCL 项目入口](../README.md)进入，连续操作取证仍在进行。

验证方式：核对 Git 跟踪文件、分支与基线，检查本轮入口链接，并运行总控台现有 `review/check-library.py` 检查清单、来源哈希及排除项。当前没有改动应用代码，不涉及运行或界面验收。

接续顺序：依据本页归属表逐份审阅研究候选；先确定每份材料的唯一原件与产品引用方式，再执行拆分及迁移，最后更新两个入口、清单与总览。不要直接搬走整个 `review/`。
