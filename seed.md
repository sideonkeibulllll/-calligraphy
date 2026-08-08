# seed.md — 中文名与文件路径映射

> 准则二：模块 A 被模块 B 引用时，A 在自身文件声明依赖（中文名）。本文件为中文名索引。
> 格式：中文名 — 路径 — 依赖

## 配置
- 依赖清单 — package.json —
- 构建配置 — vite.config.ts —
- TS配置 — tsconfig.json —
- TS_node配置 — tsconfig.node.json —
- Capacitor配置 — capacitor.config.ts —
- HTML入口 — index.html — 应用入口
- Vite类型声明 — src/vite-env.d.ts —
- 汉字数据下载脚本 — scripts/fetch-hanzi-data.mjs —

## 样式
- 主题样式 — src/styles/theme.css —
- 全局样式 — src/styles/global.css —

## 类型
- 类型定义 — src/types/index.ts —

## 数据
- 名言库 — src/data/quotes.ts —

## 数据库
- 数据库连接 — src/db/database.ts — 数据表结构
- 数据表结构 — src/db/schema.ts —
- 字卡仓库 — src/db/repositories/card-repository.ts — 数据库连接、类型定义、日期工具
- 练习记录仓库 — src/db/repositories/record-repository.ts — 数据库连接、类型定义、日期工具
- 歌单仓库 — src/db/repositories/playlist-repository.ts — 数据库连接、类型定义、日期工具

## 算法与工具
- 间隔重复算法 — src/utils/sm2.ts — 类型定义、日期工具
- 日期工具 — src/utils/date.ts —

## 状态管理
- 设置状态 — src/store/settings-store.ts — 类型定义
- 复习状态 — src/store/review-store.ts — 类型定义
- 临摹状态 — src/store/practice-store.ts — 类型定义

## Hooks
- 今日复习钩子 — src/hooks/use-today-review.ts — 字卡仓库、复习状态
- 汉字数据钩子 — src/hooks/use-character-data.ts —
- 随机名言钩子 — src/hooks/use-random-quote.ts — 名言库

## 通用组件
- 胶囊按钮 — src/components/CapsuleButton.tsx —
- 网格背景 — src/components/GridBackground.tsx — 类型定义
- 星标按钮 — src/components/StarToggle.tsx —
- 归色进度环 — src/components/ProgressRing.tsx —
- 搜索框 — src/components/SearchBar.tsx —
- 大字区 — src/components/BigCharacter.tsx — 网格背景、设置状态
- 自评栏 — src/components/EvaluationBar.tsx — 类型定义
- 字符输入框 — src/components/CharacterInput.tsx — 胶囊按钮
- 底部导航栏 — src/components/TabBar.tsx —
- 描红层 — src/components/TracingLayer.tsx —
- 笔顺区 — src/components/StrokeOrder.tsx — 汉字数据钩子

## 页面
- 应用入口 — src/main.tsx — 路由容器、应用根组件
- 应用根组件 — src/App.tsx — 底部导航栏、练习主页、临摹练习页、历史记录页、字符详情页、歌单管理页、歌单详情页、设置页
- 练习主页 — src/pages/HomePage.tsx — 胶囊按钮、字符输入框、归色进度环、随机名言钩子、临摹状态、字卡仓库、练习记录仓库
- 临摹练习页 — src/pages/PracticePage.tsx — 大字区、笔顺区、自评栏、星标按钮、描红层、胶囊按钮、设置状态、临摹状态、复习状态、字卡仓库、练习记录仓库、歌单仓库、间隔重复算法、日期工具
- 历史记录页 — src/pages/HistoryPage.tsx — 搜索框、星标按钮、字卡仓库、练习记录仓库、日期工具
- 字符详情页 — src/pages/DetailPage.tsx — 大字区、笔顺区、星标按钮、胶囊按钮、汉字数据钩子、字卡仓库、练习记录仓库、歌单仓库、临摹状态、日期工具
- 歌单管理页 — src/pages/PlaylistPage.tsx — 胶囊按钮、歌单仓库
- 歌单详情页 — src/pages/PlaylistDetailPage.tsx — 胶囊按钮、字符输入框、歌单仓库
- 设置页 — src/pages/SettingsPage.tsx — 设置状态

## 数据资源
- 汉字图形数据 — public/hanzi-data/graphics.txt —（Make Me a Hanzi，9574 字 SVG 路径）
- 汉字字典数据 — public/hanzi-data/dictionary.txt —（部首、笔画数）
