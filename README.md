# Serene ｜ 墨尔本留学生海外避坑安心助手 🇦🇺🛡️

> **在异国他乡，温暖陪伴，为你撑起避坑、防宰、维权的防护伞。**

---

## 🌟 项目简介 (Introduction)

**Serene** 是一款专门针对澳洲（特别是墨尔本地区）中国留学生设计的智能化、一站式海外避坑与应急维权安心助手。

留学生只身海外，面对全英文的天价罚单、账单、学校发来的 Stop/Show Cause（停学/退学警告信），或者是租房时遭遇无良房东的押金纠纷时，往往因不熟悉当地法规、英语非母语、缺乏本地信息而感到万分孤立与无助。**Serene** 基于 Google 顶尖的 AI 技术和可靠的云端底座，实时提供深度合规分析、全网智能验价、自救食谱生成，并能一键撰写符合澳洲行政规范的英文申诉、抗辩公函，让留学生在维权路上有据可依、底气十足。

---

## 🎯 面向人群与核心解决痛点 (Target Audience & Key Pain Points)

- **服务对象**：澳洲（特别是墨尔本/维多利亚州）新老中国留学生。
- **核心痛点**：
  1. **看不懂、不会回**：收到路边停车罚单、高额水电煤气账单或 Show Cause 警告信，惊慌失措、耗费大量时间翻译思考、无力英文申诉响应。
  2. **二手防宰**：二手群买单人床、微波炉、电竞椅，由于不熟悉 Kmart、Target 全新基础款价格，经常被他人虚高溢价“当韭菜”宰，甚至在网上买单前遭遇定金转账诈骗。
  3. **租房押金纠纷**：退房时房东以“清洁不合格、地毯有磨损”为由恶意克扣几百甚至上千澳元 Bond（押金），留学生不知如何向维州官方机构 RTBA 或 VCAT 提请仲裁。
  4. **外卖刺客与天价高支**：在墨尔本点一餐中餐外卖加运送费动辄 \$30+ AUD，长期吃外卖导致生活费告急，冰箱堆满生鲜却不会做省钱配餐。

---

## 🛡️ 核心五大功能模块 (Core Features)

1. **✍️ 信件官 (Letter Official)**
   - **拍照一键分析**：借助双端多模态视觉大模型（Gemini Vision），拍照上传复杂的全英文罚单、税单、Show Cause 通知书。
   - **一句话自救**：输入简单的中文意图，Serene 将立刻提供深度行政条款分析、避坑建议、关键截止时间警示。
   - **专业英文公函**：自动一键为您生成合规、得体、严谨的抗辩与申诉信件（Email Drafts），并提供 Gmail 快速起 draft 打开通道。

2. **💡 防坑盾 (Anti-Scam Shield)**
   - **智能验价**：输入拟交易的二手商品标题、价格、描述，自动启用实时 Google Search grounding，按用户所选国家联网对比当地主流商店（如 Walmart / Kmart / IKEA / Best Buy）全新价格、计算合理二手区间及差分推理。
   - **时薪痛感换算**：结合当地法定最低时薪，换算出该商品相当于兼职打工多少小时，帮新移民痛感警醒、严防超额溢价。
   - **反诈自检**：勾选可疑信号 + 上传聊天截图，Gemini 结合 Google Search 实时比对当地高发诈骗手法，输出风险等级与应对建议。
   - *(未来规划：面交资金托管 / 担保交易等支付层能力，当前版本不含真实资金流转。)*

3. **⚖️ 法援站 (Legal Station)**
   - **维权流程指导**：内置租房与生活高频维权流程指引，并按用户所选国家/州由 AI 实时给出对应官方机构与流程。
   - **AI 处境避坑清单**：描述你当前的棘手处境，`/api/match-companion` 调用 Gemini 即时生成针对该处境的可执行避坑 / 反诈行动清单。
   - *(未来规划：接入真实的在地学长姐互助社区；当前演示中的向导为示例数据。)*

4. **🚑 急救包 (First-Aid Kit)**
   - **生存电话速查**：精选澳洲在校与社会常备紧急救助渠道（火警/警局/急救 000、翻译与传译服务 TIS 131450、心理和涉外应急等）。
   - **避坑离线检查单**：初到澳洲的“三大件办卡安全防诈小贴士”，提醒如何甄别 DHL/大使馆/ATO 假中文恐吓电话。

5. **🥦 冰箱省钱自救菜谱 (Kitchen Survivor)**
   - **智能冰箱/小票扫描**：拍照上传冰箱剩余生鲜、蔬菜，或超市（Woolworths / Coles）买菜小票。
   - **最低成本快手食谱**：AI 瞬间为您量身定制成本低于 \$5 AUD 且营养均衡的中英文菜谱和做法，并精算比对外卖省下的真实费用，折合减少餐厅兼职时间，拒绝高价外卖。

---

## ⚙️ Google 与 Firebase 技术实力背书 (Technologies)

- **Gemini API & SDK** (`@google/genai`):
  - **Gemini 2.5 Flash**（`gemini-2.5-flash`）：提供瞬时、高响应速度的多模态图像扫描（Vision）和复杂语境下的申诉公函写作能力，所有后端接口均实际调用此型号。
  - **Google Search Grounding (联网实时搜索)**：集成在 `/api/analyze-bill`、`/api/check-price`、`/api/scam-check`、`/api/tenancy-guide` 等接口，绕过模型时效局限，按用户所选「国家 + 州/省」实时检索当地法规、机构与物价。
- **Firebase 服务**:
  - **Firebase Authentication**：提供安全的 Google 账号一键安全登录，无需记录冗长密码，保障留学生账号统一与会话合规。
  - **Firebase Cloud Firestore**：长效数据存储。并为 `appeals` 申诉数据和流程配置了极其严密的安全规则（`firestore.rules` 账户隔离机制），严防越权偷窥。
- **AI Studio Build Preview**：轻量化实时沙盒。

---

## 🔒 极致安全的 API 密钥保护设计 (Security Architecture)

为了保证最严苛的账户资产安全：
- **拒绝前端裸奔**：所有与 Google Gemini API、联网 Search 相关的秘钥配置和接口请求均**设计在 server-side node.js (Express) 后端服务器**，对浏览器端（Client）完全隐藏，从根本上防止了 API 密钥被恶意反编译和截获利用。
- **个人敏感数据严格属主隔离**：涉及个人隐私的数据（申诉 `appeals`、用户档案 `userProfiles`、看板 `kanbanTasks`）在 `firestore.rules` 中按 UID 细粒度隔离——非本用户 UID 的任何读写请求都会被底层规则阻断拒绝。
- **免登录拼饭局的分级放开与加固**：为了让好友“扫码即进”，`meetups`（拼饭局）是一个**刻意不需要登录**的独立集合，其中不含任何敏感数据（仅一顿饭的昵称、大致区域、口味偏好）。它不套用上面的属主隔离，而是单独加固：`list` 被禁止（无法枚举/爬取所有房间）、房间 `delete` 被禁止（陌生人无法清空活跃房间）、每一次写入都做字段与长度校验（无法灌入超大或任意结构的垃圾数据）；`get` 需要随机 6 位房间码（即文档 ID）才能读取。（如需彻底收紧，可在 Firebase 控制台开启 Anonymous Auth 后把该集合规则改为 `if request.auth != null`，客户端在写入被拒时会自动降级为本地模式，功能不受影响。）
- **Firebase Web 配置为设计上可公开项**：`firebase-applet-config.json` 中的 `apiKey` 属于 Firebase 前端标识（本就需下发到浏览器），并非服务端密钥；真正的访问控制由上述 Firestore 规则承担，另建议在 GCP 侧为该 key 配置 HTTP referrer / API 限制。

---

## 🏃 快速启动与本地运行 (Local Setup)

要在本地运行 Serene 极其轻松，请遵照以下步骤：

### 1. 准备工作 (Prerequisites)
- 安装 [Node.js](https://nodejs.org/) (建议最新 LTS 版本 18+ 或 20+)。

### 2. 拷贝代码并安装依赖
```bash
# 进入项目根目录并下载依赖组件
npm install
```

### 3. 配置环境变量 (Environment System)
在根目录下创建一个 `.env` 文件，定义好您的后端私密 API Key：
```env
# 仅放在后端服务器的安全 API 密钥，不要提交到公共代码仓库！
GEMINI_API_KEY=your_gemini_api_key_here
```
您可以参照项目中的 `.env.example` 获取配置结构模版。

### 4. 启动开发服务器 (Development)
```bash
# 一键运行前后端全栈开发环境
npm run dev
```
启动成功后，浏览器打开 `http://localhost:3000` 即可开始使用。

### 5. 编译与构建 (Production)
```bash
# 自动通过 Vite 编译前端、Esbuild 打包后端并混淆压缩
npm run build

# 运行生产打包产物
npm run start
```

### 6. 部署到 Google Cloud Run (Deploy)
项目已内置 `Dockerfile`，可一键部署到 Google Cloud Run（服务器已监听 `0.0.0.0:$PORT`，与 Cloud Run 的 `8080` 端口天然兼容）：
```bash
gcloud run deploy serene --source . --region asia-southeast1 \
  --allow-unauthenticated --set-env-vars GEMINI_API_KEY=<你的密钥>
```
（Render 部署仍可继续使用根目录的 `render.yaml`。）

---

*“在陌生的南半球，有 Serene 在，避坑抗灾，底气常在。祝你留学顺利，平安学成归来！”🌟*
