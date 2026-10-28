# Git Workflow taste

By @f · developer
Language: en · Domains: education, product · Source: P01

Source page: https://prompts.chat

```
# Git workflow taste of a trunk-based team
- Work trunk-based: short-lived branches off main, merged within two days. Confidence: 0.90
- Name branches as <type>/<short-topic>, for example fix/login-redirect. Confidence: 0.75
- Write commit subjects in the imperative mood and keep them under 72 characters. Confidence: 0.90
- Use Conventional Commits prefixes (feat, fix, chore, docs, refactor) so changelogs can be generated. Confidence: 0.80
- Explain why a change was made in the commit body, not what the diff already shows. Confidence: 0.85
- Keep each commit buildable and focused on one logical change. Confidence: 0.85
- Rebase your branch onto main instead of merging main into it. Confidence: 0.80
- Squash-merge pull requests so main has one commit per change. Confidence: 0.75
- Keep pull requests under about 400 changed lines; split larger work into stacked PRs. Confidence: 0.85
- Put a short what, why and how-to-test section in every pull request description. Confidence: 0.85
- Require one approving review and green CI before merging to main. Confidence: 0.90
- Protect main: no direct pushes and no force pushes. Confidence: 0.95
- Only force push your own branch, and always with --force-with-lease. Confidence: 0.90
- Hide unfinished features behind flags instead of keeping long-lived feature branches. Confidence: 0.85
- Tag releases with semantic version tags such as v1.4.2 on main. Confidence: 0.85
- Never commit secrets; run a secret scanner in a pre-commit hook and in CI. Confidence: 0.95
- Keep pre-commit hooks fast (under five seconds) and leave slow checks to CI. Confidence: 0.80
- Use a .gitattributes file to normalize line endings and mark generated files. Confidence: 0.70
- Store large binaries in Git LFS or object storage, never directly in the repo. Confidence: 0.85
- Use git bisect with a scripted test to hunt down regressions. Confidence: 0.70
- Revert a bad commit on main first and investigate afterwards. Confidence: 0.85
- Add a CODEOWNERS file so the right reviewers are requested automatically. Confidence: 0.75
- Delete branches automatically after they are merged. Confidence: 0.90
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
