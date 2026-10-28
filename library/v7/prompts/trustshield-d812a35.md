# TrustShield

By @abhishekdubey8340@gmail.com · general
Language: en · Domains: product, data, education · Source: P01

Source page: https://prompts.chat

```
# Project Prompt: TrustShield — Hackathon-Ready Web Application

Act as a senior full-stack developer, UI/UX designer, and cybersecurity engineer. Build a complete, professional, responsive web application for my hackathon project.

## 1. Project Identity

**Project Name:** TrustShield  
**Tagline:** Securing Online Transactions with Multi-Layered Identity Verification Protocols  
**Team Name:** SudoX  
**Team Number:** T-0002  
**Institution:** Rungta College of Engineering and Technology  
**Event:** Cyber AI Hackathon 2026 — University of Derby, UK

The goal is to demonstrate a risk-adaptive transaction verification system that evaluates transaction signals, calculates a risk score, explains suspicious indicators, and recommends an appropriate verification action.

## 2. Design Requirements

Create a premium fintech cybersecurity dashboard with:

- Clean white background with restrained navy-blue, light-blue, and red accents.
- Modern typography, rounded cards, subtle shadows, and consistent spacing.
- Professional icons and simple visualizations.
- Responsive layouts for desktop, laptop, tablet, and mobile.
- Smooth but subtle transitions and clear loading, success, warning, and error states.
- No excessive gradients, unnecessary animations, or overcrowded content.
- A polished, realistic interface suitable for a university-level international hackathon presentation.

The UI must look like a functional cybersecurity product, not a generic marketing template.

## 3. Required Pages and Features

### A. Landing Page

Include:
- TrustShield logo and project name.
- A concise explanation of the problem and proposed solution.
- A primary button: “Launch Security Dashboard”.
- Feature cards for Multi-Layer Verification, Risk Analysis, Adaptive Authentication, and Offline-Resilient Assessment.
- A short workflow visualization showing how a transaction is assessed.
- Team name SudoX and hackathon information in the footer.

### B. Security Dashboard

Create a dashboard with:
- Total demo transactions analyzed.
- Low-, medium-, and high-risk counts based only on actual demo interactions or clearly labelled seed data.
- A risk distribution chart.
- A recent transaction table.
- A prominent “Analyze Transaction” action.
- A clear indication that this is a hackathon prototype using simulated transactions.

Do not invent real customers, real bank connections, production fraud statistics, or verified performance metrics.

### C. Transaction Risk Analyzer

Build a fully interactive form containing:

- Transaction amount in INR.
- Beneficiary: known or new.
- Device: recognized or new.
- Transaction frequency: normal or unusually frequent.
- Behavioral pattern: normal or unusual.
- Optional location anomaly indicator.

When the user clicks “Analyze Transaction”, calculate the score dynamically using a transparent, configurable rules-based risk engine.

Display:
- Risk score from 0–100.
- Low, medium, or high risk classification.
- A visual risk meter.
- Individual risk factors and their contribution.
- A plain-language explanation of why the score was assigned.
- A recommended action.

Use these initial demonstration thresholds:
- 0–29: Low Risk.
- 30–59: Medium Risk.
- 60–100: High Risk.

Use configurable example weights, cap the score at 100, and document the scoring logic. Do not assign a manually fixed score to a scenario.

### D. Adaptive Decision Engine

Use the computed risk score and detected signals to select a response:

- Low risk: recommend the standard verification flow.
- Medium risk: recommend additional verification.
- High risk: recommend stronger verification or placing the transaction on hold.

Do not claim that the prototype actually authorizes, blocks, or processes bank/UPI payments. The result is a recommendation in a simulated environment.

### E. Explainability Panel

For every analysis, display:
- Which signals increased the score.
- The points contributed by each signal.
- The final score calculation.
- The reason behind the recommended action.

Include a short security note that unusual behavior does not automatically prove fraud.

### F. Interactive Demo Scenarios

Add three buttons that populate the analyzer with reproducible example scenarios:

1. **Low Risk:** recognized device, known beneficiary, normal amount and behavior.
2. **Medium Risk:** new device and moderately unusual transaction.
3. **High Risk:** new device, new beneficiary, high amount and unusual frequency or behavior.

Each scenario must be processed by the same risk engine. The score must arise from the input signals rather than a hardcoded result.

### G. Transaction History

Show analyzed demo transactions with:
- Demo transaction ID.
- Timestamp.
- Amount.
- Risk score and classification.
- Main contributing risk signals.
- Recommended action.

Persist the demo history locally using an appropriate storage mechanism. Clearly label all seeded records as sample data. Do not store real financial credentials or
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
