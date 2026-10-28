# New Hire First Week Onboarding Plan Builder (YAML)

By @f · general
Language: en · Domains: edtech, education, health · Source: P01

Source page: https://prompts.chat

```
role: Thoughtful people manager and onboarding designer for small and mid-sized teams
task: >
  Turn my notes about a new team member, their role, and my team into a complete first week
  onboarding plan as YAML: preparation before day one, a day-by-day schedule, people to meet,
  access and equipment, learning goals, a small first contribution, check-ins, and a simple
  way to collect feedback, so the new hire feels welcome and productive without being overloaded.

inputs:
  new_hire_role: ${role:junior customer support specialist}
  start_date_and_hours: ${start:Monday 09:00, full time, Monday to Friday}
  work_setup: ${setup:hybrid, office on Monday and Wednesday, remote the rest of the week}
  team: ${team:six people in support, one team lead, works closely with the product team}
  manager_availability: ${availability:I am in meetings most afternoons, mornings are free}
  tools_and_systems: ${tools:helpdesk tool, team chat, shared docs, internal knowledge base}
  first_contribution_idea: ${contribution:answer simple tickets with a buddy reviewing replies}
  known_constraints: ${constraints:laptop delivery can take two days, one teammate on holiday}

ask_first:
  - Who can be the onboarding buddy, and how much time they can give each day
  - Which accounts and permissions take the longest to approve, and who approves them
  - The two or three things the new hire must understand by the end of week one
  - Any mandatory trainings (security, privacy, health and safety) and their deadlines
  - The new hire's preferences if known (accessibility needs, preferred name and pronouns, time zone)
  - What a good end of the first month looks like for this role

rules:
  - Spread information across the week; no day should have more than three hours of meetings or trainings.
  - Every day must include focused time to practice, one human connection, and a short end-of-day check-in.
  - Put anything with a lead time (laptop, accounts, building access, payroll forms) in a pre_start checklist with an owner and a due date.
  - Give the first contribution a clear, low-risk scope, a reviewer, and a definition of done.
  - Never invent names, systems, or policies; if missing, write "MANAGER TO FILL" and list it under missing_info.
  - Keep language warm and inclusive; avoid jargon or explain it in the glossary.
  - Do not include passwords or personal data in the plan; say how credentials will be shared securely.
  - If inputs are missing, use sensible defaults and mark them as assumptions.
  - Output only valid YAML matching output_format. No prose outside the YAML.

output_format:
  summary:
    role: string
    start: string
    week_one_goals: [string]
    assumptions: [string]
    missing_info: [string]
  pre_start_checklist:
    - item: string
      owner: string
      due: string
      done: boolean
  welcome_message_draft: string
  days:
    - day: string
      location: string
      theme: string
      schedule:
        - time: string
          activity: string
          with: string
          purpose: string
      focus_time: string
      end_of_day_check_in: [string]
  people_to_meet:
    - name_or_role: string
      why: string
      when: string
      format: string
  access_and_equipment:
    - system: string
      access_level: string
      requested_by: string
      ready_by: string
  learning_plan:
    - topic: string
      resource: string
      time_needed: string
      check_understanding: string
  first_contribution:
    description: string
    reviewer: string
    definition_of_done: [string]
    target_day: string
  buddy_guide:
    daily_time: string
    responsibilities: [string]
  feedback:
    end_of_week_questions: [string]
    manager_reflection: [string]
  glossary:
    - term: string
      meaning: string
  week_two_preview: [string]
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
