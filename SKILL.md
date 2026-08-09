# SKILL — 归色临摹发版流程

> 本文件总结从「改版本号 → 构建 APK → 发 GitHub」的完整流程经验，供日后照做。
> 中文名：发版流程技能 — SKILL.md

## 前置约定

- 仓库：`origin` = `https://github.com/sideonkeibulllll/-calligraphy.git`，分支 `master`
- 签名：`android/keystore.properties` 指向本地 keystore（已 gitignore）
- `android/` 与 `release/` 均在 `.gitignore` 中，不入库
- 版本号三处需同步：`package.json` 的 `version`、`android/app/build.gradle` 的 `versionCode` + `versionName`、以及 git tag

## 一、版本号联动表

| 位置 | 字段 | 示例（1.0 → 1.1） |
|---|---|---|
| `package.json` | `version` | `1.0.0` → `1.1.0` |
| `android/app/build.gradle` | `versionCode` | `1` → `2`（每次递增） |
| `android/app/build.gradle` | `versionName` | `"1.0"` → `"1.1"` |
| git tag | — | `v1.0` → `v1.1` |

> 规律：`versionName` 与 tag 用「主.次」；`package.json` 用 semver「主.次.0」；`versionCode` 每次发版 +1。

## 二、完整发版步骤

### 1. 改代码 + 升版本号
1. 完成功能/修复
2. 改 `package.json` 的 `version`
3. 改 `android/app/build.gradle` 的 `versionCode`、`versionName`

### 2. 构建前端 + 同步到 Android
```powershell
npm run build            # tsc -b && vite build → dist/
npx cap sync android     # 把 dist 拷进 android/app/src/main/assets/public
```

### 3. 打 Release APK
```powershell
cd android
.\gradlew.bat assembleRelease --no-daemon
```
产物：`android/app/build/outputs/apk/release/app-release.apk`

> 若报签名错，检查 `android/keystore.properties` 是否存在且 `storeFile` 路径正确。
> 构建走 `signingConfigs.release`，自动用 keystore 签名。

### 4. 归档 APK 到 release/
```powershell
Copy-Item android\app\build\outputs\apk\release\app-release.apk release\calligraphy-shufa-v1.1-release.apk -Force
```
命名规则：`calligraphy-shufa-v{versionName}-release.apk`

### 5. 提交并推送
```powershell
git add <改动文件>       # 注意 android/ 与 release/ 已 ignore，不会误提
git commit -m "v1.1: <一句话说明>"
git push origin master
```

### 6. 打 tag 并推送
```powershell
git tag v1.1
git push origin v1.1
```

### 7.（可选）在 GitHub 创建 Release 并附 APK
- 到仓库 Releases → Draft a new release → 选 tag `v1.1`
- 上传 `release/calligraphy-shufa-v1.1-release.apk` 作为资产

## 三、踩坑备忘

- **去重陷阱**：`splitChars` 用 `Set` 去重会把"一生一世"变"一生世"。保留顺序与重复只需 `Array.from(text).filter(ch => ch.trim())`，不要用 Set。
- **歌单重复**：`addCharsByString` 若有"已存在则跳过"检查会再次去重；要允许重复堆叠就移除该检查，直接逐个 `addItem`。
- **数据模型已天然支持重复字**：`cards` 按字唯一（SM-2 状态共享）、`records` 与 `playlist_items` 无唯一约束（各自独立）。所以去重逻辑删掉后整条流程不会错乱。
- **构建前先 `npm run build`**：先验证 TS 编译通过，再 cap sync，避免把编译错误带进 APK。
- **android/release 不入库**：二者都在 `.gitignore`，APK 只留本地归档，仓库只跟踪源码与版本号。

## 四、本次（v1.1）变更摘要

- 修复：主页输入框与歌单加字不再去重，"一生一世"保留 4 字
- 版本：1.0 → 1.1（package.json 1.1.0、versionCode 2、versionName 1.1、tag v1.1）
- APK：`release/calligraphy-shufa-v1.1-release.apk`
