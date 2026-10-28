# CIS COntrols

By @rmostakin@klosconsulting.com · general
Language: en · Domains: finance, data · Source: P01

Source page: https://prompts.chat

```
ROLE
You are a senior IT governance and compliance writer who specializes in CIS Controls v8.1 for managed service providers (MSPs). You turn dense, audit-style policies into clear, practical documents that staff can follow and auditors can verify.

CONTEXT
Klos Consulting Inc. is a Managed IT & Cybersecurity provider. I'm attaching its current "Data Management Process & Datto Runbook" (v2.0 draft). It satisfies CIS Control 3, Safeguard 3.1: Establish and Maintain a Data Management Process (Asset Type: Data, Security Function: Govern).

The safeguard requires a documented process that addresses:
1. Data sensitivity
2. Data owner
3. Handling of data
4. Data retention limits
5. Disposal requirements
...based on the enterprise's sensitivity and retention standards. It must be reviewed and updated annually, or when significant enterprise changes occur.

Systems where data lives (to be covered by the document):
- Microsoft 365: OneDrive, SharePoint
- HR/Finance: Bamboo HR, ADP, QuickBooks Online, Bank of America, Connectbooster
- Sales/Marketing: HubSpot, Canva, MailerLite, Exclaimer, LinkedIn/Facebook/Instagram, Grasshopper
- Client delivery: Egnyte Portal, ScalePad, Lifecycle Insight, SkyKick, Pax8
- Backup/RMM: Kaseya Datto (BCDR/RMM)
- Security/Identity: Huntress, Cloudflare, HaveIBeenPwned, LastPass, Duo, Horizon3
- Network/Cloud: Unifi, Nerdio, SonicWall Portal
- Vendors: Ingram, Dell

TASK
Rewrite the attached document so it is simple, easy to understand, and well organized, without losing anything an auditor needs. Do not weaken or drop any of the five required elements.

REQUIREMENTS
- Plain language: short sentences, no jargon without a one-line definition, and active voice ("The Data Owner approves disposal").
- Lead with a one-page summary: what the process is, who does what, and the 5 rules everyone must remember.
- Use a clear, repeating structure: Purpose, Scope, Roles, Classification, Handling, Retention, Disposal, Review.
- Replace long paragraphs with tables, checklists, and a simple lifecycle flow (Create > Classify > Store/Use > Retain > Dispose).
- Reduce the 4-level classification standard to a one-page "cheat sheet" (what it is, an example, how to handle it, how long to keep it).
- Keep the retention schedule as one simple table (data type, class, owner, keep for, then what).
- Map every platform in the data-location list to a domain, a data owner, a classification, and a retention rule. Flag any platform that is missing from the document.
- Keep the Datto runbook, but make it a separate step-by-step checklist (daily, monthly, quarterly, and client offboarding).
- Keep roles, names, titles, retention periods, and CIS references exactly as given unless I say otherwise. Do not invent facts, legal advice, or numbers. Mark gaps as ${to_confirm}.
- Keep the references, but cite them only where they are used.
- Clean up draft leftovers, typos, duplicated text, and inconsistent terms.

OUTPUT
1. The rewritten document, professionally formatted and ready for CEO approval, with a version/owner/review-date block.
2. A short "What changed and why" list.
3. A short list of open questions or items I need to confirm.

TONE & LENGTH
Professional but friendly, and as short as possible while staying audit-ready. Aim for about half the current length.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
