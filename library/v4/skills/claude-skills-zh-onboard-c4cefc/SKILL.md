---
name: onboard
description: "新手引导流程。了解你的基本偏好、定第一个目标、指引下一步。"disable-model-invocation: true
---


# Onboard

Use only when the user explicitly invokes `/onboard`. Help them choose one useful first task with a short conversation. Do not make them repeat context already provided.

Ask only the next question that affects the direction. A preferred name is optional; work context and the desired result usually matter more. Offer a few concrete options when the user is unsure, and use an available question tool only when its current mode permits it. Match the user's language.

Use the answers in this conversation. Save personal preferences only when the user directly requests persistent saving and the current environment permits it; follow the active memory or rule workflow. Never treat answering an onboarding question as permission to write a personal rule. If saving is unavailable, explain it without claiming future memory.

For a product question, use current local/runtime evidence and the installed `openai-docs` skill as appropriate. Do not guess settings paths, tool availability, or integrations.

Once a concrete task is clear, give a compact next step. If the user asks to perform it, end the onboarding interview and continue the authorized work using the relevant workflow; do not require them to repeat the task in a new message. If they only wanted suggestions, provide a usable prompt or plan and stop. A Plan-mode switch requires a supported tool and user intent; never claim a mode changed without a successful tool result.

Do not browse accounts, install integrations, clone repositories, or change settings merely to enrich onboarding. Do such actions only when needed for the specific task the user has chosen and authorized.
