---
name: job-ok
description: >-
  Use when helping a Chinese job seeker, especially students, interns, or early-career users, prepare job applications with an agent without fabricating experience, auto-submitting applications, scraping hiring platforms, or promising offers.
---

# Job OK

Job OK 是一个面向中文求职者的本地求职 Skill。它帮助学生、实习生和早期职场人把真实经历整理成可追溯的求职证据，再用于岗位匹配、简历优化、投递跟踪和面试表达训练。

核心原则：先证据，后结论；先岗位匹配，后简历改写；用户手动确认任何外部投递动作。

## 使用边界

- 默认使用中文，除非用户要求其他语言。
- 默认把简历、联系方式、截图、聊天记录等敏感材料保留在本地。
- 输出中区分 `fact`、`assumption`、`inference`、`user_preference`。
- 不编造学历、实习、项目、奖项、指标、证书、技能或公司经历。
- 不承诺面试、offer、薪资结果或平台曝光。
- 不自动投递、不自动私信 HR、不绕过登录、不批量爬取招聘平台。
- 不用于企业侧招聘、候选人排名或人事决策。

## 本地案例目录

每服务一个求职者，创建或复用：

```text
job-search-cases/<yyyy-mm-dd-user-slug>/
├── brief.yaml
├── raw/
│   ├── resume/
│   └── job-posts/
├── profile.yaml
├── experience-assets.md
├── strengths.md
├── target-roles.csv
├── jobs.jsonl
├── job-matches.csv
├── resume-review.md
├── resume-versions/
├── interview-story-bank.md
├── interview-practice.md
├── application-tracker.csv
└── review-log.md
```

优先从 `assets/templates/` 复制模板到案例目录，再开始分析。

## 工作流

1. **先 Intake。** 收集简历、目标城市、目标岗位、教育背景、项目/实习经历、限制条件、排除岗位、偏好行业和风险备注。核心信息不足时先追问，不急着推荐岗位或改简历。参考 `references/intake-flow.md`。
2. **提取真实经历。** 把简历和用户回答整理到 `experience-assets.md`。可用 `scripts/extract_resume_text.py` 提取 `.pdf`、`.docx`、`.txt`、`.md` 简历文本。
3. **挖掘优势。** 每个优势都必须走完 `证据 -> 行为 -> 能力 -> 岗位信号`。参考 `references/strength-taxonomy.md`，在 `strengths.md` 记录可信度和缺失证据。
4. **生成岗位假设。** 输出 3-5 个目标岗位簇到 `target-roles.csv`。参考 `references/job-matching-rubric.md`，写清匹配证据、差距、30 天补强动作和适合公司类型。
5. **整理真实 JD。** 只接受用户提供的岗位链接、截图、复制 JD、CSV 导出、Markdown 表格或浏览器可见页面。用 `scripts/normalize_jobs.py` 生成 `jobs.jsonl`。使用平台资料前先读 `references/platform-boundaries.md`。
6. **评分和短名单。** 用 `scripts/score_job_matches.py` 做确定性初筛。分数只用于 triage，不代表真实录取概率。低分岗位进入观察池，不进入投递列表。
7. **优化简历。** 参考 `references/resume-rubric.md`。每条建议必须能回到真实经历。输出 `resume-review.md`，并在 `resume-versions/` 记录不同岗位版本。
8. **训练面试表达。** 参考 `references/interview-training.md`。一次只问一个问题，等待用户回答，再追问和复盘。首版只处理文本或语音转写稿。
9. **跟踪和复盘。** 每次投递、回复、面试、拒信或新增 JD 后，更新 `application-tracker.csv` 和 `review-log.md`。

## 辅助脚本

```bash
python3 .agents/skills/job-ok/scripts/extract_resume_text.py \
  --input job-search-cases/<case>/raw/resume/resume.pdf \
  --output job-search-cases/<case>/raw/resume/resume.txt

python3 .agents/skills/job-ok/scripts/normalize_jobs.py \
  --input job-search-cases/<case>/raw/job-posts/jobs.md \
  --output job-search-cases/<case>/jobs.jsonl \
  --source-type user_paste

python3 .agents/skills/job-ok/scripts/score_job_matches.py \
  --profile job-search-cases/<case>/profile.yaml \
  --strengths job-search-cases/<case>/strengths.md \
  --jobs job-search-cases/<case>/jobs.jsonl \
  --output job-search-cases/<case>/job-matches.csv
```

## 输出标准

- 优势挖掘：写明证据、可信度、岗位信号和缺失证据。
- 岗位建议：同时写为什么投、为什么不投、简历重点和下一步用户动作。
- 简历修改：输出建议，不输出不可验证的最终表述；缺证据内容标记为 `needs_proof`。
- 面试训练：检查结构、具体性、证据、岗位相关性、风险表达和可追问性。
- 外部动作：结尾使用“用户手动确认后再执行”，除非用户报告完成，否则不要写“已投递”。
