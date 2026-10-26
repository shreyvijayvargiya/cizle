---
name: share
description: "项目分享与备份。把当前项目存到 Codex 托管并分享，校验上传与访问范围。"
disabled-environments:
  - cloud
---


# Save or Share a Project

Use for the user's request to save or share the current project on Codex. If the user asks only for a local backup or names another destination, use that destination instead of routing to hosted Git.

Follow [new-repo](../new-repo/SKILL.md) for the actual platform checks, file review, existing-remote handling, creation, push, and verification. Keep the explanation understandable to the user's level of Git familiarity; avoid an extra interview when the intended project and destination are clear.

An existing remote is not evidence that the latest work is backed up. Verify the intended files reached the remote branch before saying the project is saved online. If authentication or hosting is unavailable, report what is safely preserved locally and what upload step remains.

When the purpose is sharing with another person, report the service's verified visibility/access behavior and the repository URL. Do not promise that a URL alone grants access, or change collaborators/visibility without authorization. A save request alone does not authorize public publication.
