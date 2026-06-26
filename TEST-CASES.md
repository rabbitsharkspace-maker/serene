# Serene — 50 测试用例 (Manual QA Test Plan)

Grounded in the actual app (`src/App.tsx` + the 6 tabs and Ecosystem sub-tabs).
Tabs: 信件官 Letter Officer · 防坑盾 Safety Shield · 法援站 Legal Station · 我的案头 History · 急救包 Emergency Aid · 生态 Ecosystem.

Status legend: ☐ untested · ✅ pass · ❌ fail

## A. 全局 / Global (6)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | 目的国切换 | Change the country `<select>` in the header | Destination context updates app-wide (agencies, references) |
| 2 | 显示语言切换 | Change the language `<select>` | UI display language switches |
| 3 | 州/省选择器出现 | Pick a country that has regions (e.g. US / AU) | Region `<select>` appears with options |
| 4 | 州/省选择器隐藏 | Pick a country with no regions | Region selector is hidden (no empty dropdown) |
| 5 | 移动端底部导航 | At mobile width, tap each bottom-nav item | Active tab switches; active item highlighted |
| 6 | 桌面端侧边导航 | At desktop width, click each side-nav item | Active tab switches; active item highlighted |

## B. 信件官 Letter Officer (11)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 7 | 未登录默认态 | Open Letter Officer logged out | Shows "暂未登录…本地保存" note; flow still usable |
| 8 | 载入示例/上传选区 | Use the sample letter / upload region | Letter text appears in 信件原文预览 |
| 9 | AI 深度汉化翻译 | Trigger 一键深度汉化翻译 | Chinese translation renders; "翻译中…" state shown then result |
| 10 | Grounding 信源对齐 | After analysis | 官方监管及法规信源 (CAV/VCAT) listed with real links |
| 11 | 生成英文申诉草稿 | Run draft generation | EN draft (英语抗诉正文) populates |
| 12 | 主题与正文填充 | After generation | EMAIL SUBJECT and EN DRAFT both filled |
| 13 | [方括号] 提醒 | Before sending | "发送前请仔细检查 [中括号] 内的信息" reminder visible |
| 14 | 一键打开 Gmail | Click 一键在 Gmail 打开 | Prefilled Gmail web compose opens with full letter |
| 15 | 按需登录 | Create draft while logged out | Triggers Google sign-in on demand only |
| 16 | 弹窗被拦截回退 | Block the popup, sign in | Redirect fallback completes; queued draft created on return |
| 17 | 处理下一封信 | Click 处理下一封信 | Flow resets for a new letter |

## C. 防坑盾 Safety Shield (9)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 18 | 上传估价线索 | Upload a screenshot / ad / quote | Image accepted; preview shown |
| 19 | 一键载入经典案例 | Click 一键快速载入经典案例 | Sample case loads into inputs |
| 20 | 补充背景描述 | Type into 补充背景描述 / 对方说辞 | Text captured for diagnosis |
| 21 | 运行防坑诊断 | Click 全网大数据比对与防坑诊断 | Diagnosis runs and returns a result |
| 22 | 诈骗概率显示 | After diagnosis | 诈骗概率 percentage displayed |
| 23 | 物价体感换算 | After diagnosis | 物价体感换算 / 估值对标折合约 shown |
| 24 | 澳洲实体零售参考价 | After diagnosis | 澳洲实体零售参考价 reference shown |
| 25 | 粘贴可疑文字 | Paste suspicious text / phone gist | Text-based analysis runs |
| 26 | 截屏高危话术识别 | Upload chat screenshot | High-risk phrases detected from image |

## D. 法援站 Legal Station (7)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 27 | 本地化机构 | Set country + state | AI-generated agencies for that country+state |
| 28 | 全国/全境 vs 州省 | Toggle scope | 全国/全境 vs state/province scope switches results |
| 29 | 你的法律权利 | Open the rights section | KNOW YOUR RIGHTS content renders |
| 30 | 需要口译选项 | Open 需要口译 | Interpreter guidance/option presented |
| 31 | 英文申诉模板 | View 官方申诉英文草稿模板 | Template with [方括号] placeholders shown |
| 32 | 通用起草模板 | Pick 通用起草模板 | Generic drafting template available |
| 33 | 跳转信件官 | Click open-Letter-Officer link | Switches to 信件官 tab (cross-link works) |

## E. 我的案头 History (7)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 34 | 空状态 | Open with no items | Empty state for 避坑案头 & 历史记录 |
| 35 | 新增待办(必填) | Add todo without 待办项说明 | Validation blocks; description required |
| 36 | 死线(选填) | Add 处理期限/死线 | Deadline stored and displayed |
| 37 | 严重度红黄绿 | Set 严重度 | Red/yellow/green grouping (进行中/高危死线/已搞定) |
| 38 | 申诉渠道(选填) | Fill 申诉渠道/涉案机构 | Stored on the item |
| 39 | 关联官方链接(选填) | Fill 关联官方链接 | Link saved and clickable |
| 40 | 多信件汇聚 | Generate from multiple letters | 行动清单 aggregates across letters; 前往 Gmail 发送 works |

## F. 急救包 Emergency Aid (6)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 41 | 安全提示与切换 | View safety warning | Prompts switch to physical-threat mode when life at risk |
| 42 | 租房纠纷自救箱 | Open 租房恶劣纠纷自救箱 | High-frequency self-help box opens |
| 43 | 选择遭遇场景 | Pick a 惨剧 scenario | Tailored guidance for that scenario |
| 44 | 步骤勾选清单 | Work the 请一步步勾选完成 list | Checklist items toggle; 心理脱敏 step present |
| 45 | 语音/文字输入处境 | Speak or type your situation | Input captured (对着手机说出 / 下方输入) |
| 46 | 实时定位与拨号 | Use 实时精准定位 + 点击拨打 | Location shown; call action triggers dialer |

## G. 生态 Ecosystem (4)

| # | Test case | Steps | Expected |
|---|-----------|-------|----------|
| 47 | 留学私厨/拼饭 | Open Kitchen → 拼饭 planner | Kahoot-style meetup planner loads (sample fallback if rate-limited) |
| 48 | 大桌聚餐分摊 | Use 大桌聚餐分摊 | Split calculation works; 菜肴故事留言 shown |
| 49 | 代购带货 Daigou | Open Daigou board | Board renders listings |
| 50 | 实用工具 Tools | Open Tools → FX + photo-translate | Live FX converter and photo-translate function |
