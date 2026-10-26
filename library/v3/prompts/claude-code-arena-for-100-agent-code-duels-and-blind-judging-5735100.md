# Claude Code arena for 100-agent code duels and blind judging

By @0xKiyoro
Language: ? · Domains: general · Source: V04

Original post: https://x.com/0xKiyoro/status/2107496394365735100

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xkiyoro-2107496394365735100

Demo video: https://video.twimg.com/amplify_video/2107494687569264640/vid/avc1/1080x1350/vW-iLIuNSJIMXfjr.mp4?tag=29

```
Build me a /arena tournament for Claude Code:

1. Check ~/.claude/agents and .claude/agents for agents that fit architect, adversary, inversion and judge roles
> Create only the missing ones as subagent files
> Workers on Sonnet 5.5, the lead evaluator and the judge on Opus 5.5

2. Create .claude/commands/arena.md: spawn N solvers in waves of 10, each in its own git worktree under .arena/runs/, with no shared context

3. Pair them head-to-head: each attacks the other's solution at three points (before code runs, when input scales, before done), then one revision round, then a blind judge

4. Write rubric.md: 100 points. Correctness 30, completeness 25, robustness 20, specificity 15, clarity 10. A fatal flaw is an automatic loss

5. Add one rule to CLAUDE.md: changes to critical architecture go through the arena before merge

Show me every diff first. Don't apply anything until I confirm.
```

Creator's prompt, collected for private study. Ask before republishing.
