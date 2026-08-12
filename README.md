# 归色临摹

> 暗夜多巴胺乐园里，异乡人「天镜」通过临摹汉字让色彩回流。
> 每一次着色都是温柔的牺牲，每一次告别都成为新快乐的种子。

**归色临摹** 是一款面向汉字书写练习的跨端 App（Web / Android）。它以「暗夜孟菲斯」视觉风格包裹一套循序渐进的临摹 + 间隔重复（SM-2）记忆体系，让练字这件事既解压又上头。

---

## ✨ 功能特性

- **大字临摹**：超大字区展示目标汉字，支持描红层辅助落笔。
- **笔顺动画**：基于 [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) 数据自渲染 SVG，逐笔演示正确笔顺（不依赖任何 CDN，离线可用）。
- **自评 + 星标**：写完自己打分（勾 / 中 / 差），可收藏易错字。
- **间隔重复（SM-2）**：定制版记忆算法，首次练习与出错自动入队，勾=推进、中=不推进且置顶、差=重排，复习效率拉满。
- **历史记录**：按时间轴回溯每一次练习，支持搜索与星标筛选。
- **歌单管理**：把目标字串成「歌单」，批量导入、顺序练习，支持重复字堆叠（如「一生一世」保留 4 字）。
- **每日名言**：首页随机呈现一句练字/人生格言，陪伴每一次归色。
- **进度可视化**：归色进度环实时反映你的「色彩回流」程度。

---

## 🧱 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 路由 | react-router-dom 6 |
| 状态管理 | Zustand |
| 跨端 | Capacitor 6（Android） |
| 数据存储 | Web 端 `sql.js`，原生端 `@capacitor-community/sqlite`（统一 repository 接口，上层零分支） |
| 汉字数据 | Make Me a Hanzi（9574 字 SVG 路径 + 字典） |
| 记忆算法 | 定制 SM-2 |

---

## 🎨 设计风格

暗夜模式下的**孟菲斯（Memphis）**风格：深炭灰背景（`#1a1714`，偏暖接近黑），粉 / 青 / 黄三色高饱和霓虹撞色，几何色块拼贴、波点、锯齿线条，20px 胶囊圆角按钮配彩色硬阴影，粗体几何无衬线字体，80 年代后现代童趣 + 现代科技感。

---

## 📁 目录结构

```
calligraphy-shufa/
├── public/hanzi-data/     # 汉字图形 + 字典数据（graphics.txt / dictionary.txt）
├── src/
│   ├── components/        # 通用组件（胶囊按钮、大字区、描红层、进度环…）
│   ├── pages/             # 页面（主页 / 临摹 / 历史 / 详情 / 歌单 / 设置）
│   ├── db/                # 数据库连接 + 表结构 + 仓库层
│   ├── store/             # Zustand 状态（设置 / 复习 / 临摹）
│   ├── hooks/             # 业务钩子（今日复习 / 汉字数据 / 随机名言）
│   ├── utils/             # SM-2 算法、日期工具
│   ├── data/              # 名言库
│   ├── styles/            # 主题 / 全局样式
│   ├── main.tsx           # 入口（BrowserRouter 包裹 App）
│   └── App.tsx            # 根组件 + 路由
├── scripts/               # 汉字数据下载脚本
├── android/               # Capacitor 安卓工程（.gitignore，不入库）
├── release/               # 归档 APK（.gitignore，不入库）
├── capacitor.config.ts
├── vite.config.ts
└── package.json
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+（推荐 22）
- npm 9+

### 1. 安装依赖

```bash
npm install
```

### 2. 下载汉字数据（首次必做）

> 注意：数据下载脚本在部分网络环境下需禁用证书校验。

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run fetch:hanzi
```

数据会写入 `public/hanzi-data/`（已随仓库或需本地生成）。

### 3. 本地开发

```bash
npm run dev          # 启动 Vite 开发服务器
```

### 4. 生产构建

```bash
npm run build        # tsc -b && vite build → dist/
npm run preview      # 本地预览构建产物
```

---

## 📱 安卓构建（Capacitor）

`android/` 与 `release/` 已加入 `.gitignore`，不进入版本库；仓库只跟踪源码与版本号。

```bash
npm run build                 # 先构建前端
npx cap sync android          # 将 dist 同步进安卓工程
npm run android               # 构建并打开 Android Studio
```

如需手动打 Release APK：

```bash
cd android
.\gradlew.bat assembleRelease --no-daemon
# 产物：android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔁 间隔重复算法（SM-2 定制）

- 首次练习：勾 / 差 → 入队；中 → 不写入队。
- 复习时：勾 = 推进；中 = 不推进且置顶；差 = 不计入并重新排到队首。
- 数据模型天然支持重复字：`cards` 按字唯一（SM-2 状态共享），`records` 与 `playlist_items` 各自独立无唯一约束。

---

## 📦 发版流程

版本号需三处联动：`package.json` 的 `version`、`android/app/build.gradle` 的 `versionCode` + `versionName`、以及 git tag。完整步骤见 [`SKILL.md`](./SKILL.md)。

简要流程：

```bash
npm run build
npx cap sync android
cd android && .\gradlew.bat assembleRelease --no-daemon
cp android/app/build/outputs/apk/release/app-release.apk release/calligraphy-shufa-v1.1-release.apk

git add <改动文件>
git commit -m "v1.1: <一句话说明>"
git push origin master
git tag v1.1 && git push origin v1.1
```

---

## 📝 项目约定

本仓库遵循一套由 `项目记忆.md` / `seed.md` 维护的开发条约，核心要点：

- 每个文件单一导出，职责不混合（准则二）。
- 模块引用需在自身文件声明依赖的中文名（准则二）。
- 新增导出组件 / 页面须分配唯一中文名并写入 `seed.md`（准则一）。
- 新页面先用带序号色块图展示布局，确认后再实现（准则三）。

---

## 📄 许可

本项目为个人 / 学习用途，暂未启用正式开源许可证。如需使用，请先联系作者。
