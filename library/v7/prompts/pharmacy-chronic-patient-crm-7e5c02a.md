# Pharmacy chronic patient crm

By @yakoobhaitham370@gmail.com · general
Language: en · Domains: health, history, product · Source: P01

Source page: https://prompts.chat

```
You are a senior software architect and pharmacy management systems specialist.

Design and build a private pharmacy CRM for my pharmacy in Mosul, Iraq.

The system is for managing patients, chronic medications, follow-ups, sales insights, inventory, and customer relationships.

Main goal

Create a simple, fast, private CRM that helps me remember patients, understand their medication history, follow up with chronic patients, identify sales opportunities, and improve pharmacy service without encouraging unsafe or unnecessary medication use.

Users

The system will initially have one administrator user.

The pharmacist must control access to patient information.

Patient data must not be publicly accessible.

Core patient profile

Each patient should have:

- Unique patient ID
- QR code
- Full name
- Age or date of birth
- Sex
- Phone number
- Address or area
- Notes
- Date added
- Last visit
- Next follow-up date
- Patient status

Medication profile

For each patient store:

- Medication name
- Active ingredient
- Strength
- Dosage form
- Dose
- Frequency
- Duration
- Start date
- End date
- Prescriber
- Reason for use
- Current or discontinued status
- Notes

Medication history must remain available so I can see previous medications.

Chronic medication management

Allow me to mark patients as chronic-care patients.

For chronic patients show:

- Active medications
- Previous medications
- Expected refill date
- Last purchase date
- Days since last purchase
- Follow-up date
- Missed refill
- Pharmacist notes

The system should help identify patients who may need follow-up.

Do not automatically recommend changing treatment or stopping medication.

Dashboard

Create a dashboard showing:

- Total patients
- Active chronic patients
- Patients due for follow-up
- Missed follow-ups
- Patients due for medication refill
- New patients
- Returning patients
- Today's follow-ups
- Recent purchases
- Sales
- Profit
- Low-stock products
- Products approaching expiry

CRM features

Allow me to:

- Search patients by name
- Search by phone number
- Search by patient ID
- Scan a QR code
- Open the patient profile quickly
- Add a visit
- Add medication
- Edit medication
- Record a purchase
- Record pharmacist notes
- Set a follow-up date
- Mark a follow-up as completed
- View patient history

QR system

Every patient should have a unique QR code.

Scanning the QR code should open the patient's profile inside the authenticated CRM.

The QR code must not expose sensitive patient information directly.

Inventory integration

If pharmacy inventory data is available, connect the CRM to it.

Show:

- Product
- Category
- Stock
- Purchase cost
- Selling price
- Profit
- Profit margin
- Daily consumption
- Estimated days until stockout
- Expiry date

Marketing and CRM analytics

Create useful customer segments such as:

- Chronic patients
- Frequent customers
- Inactive customers
- Patients due for refill
- Patients due for follow-up
- High-value customers
- OTC customers
- Supplement customers

Use these segments to suggest ethical pharmacy actions.

Examples:

- Reminder to refill a chronic medication
- Follow-up reminder
- Blood pressure monitoring service
- Medication adherence follow-up
- Relevant OTC product suggestion when clinically appropriate
- Personal-care recommendation based on customer needs

Never recommend unnecessary medication or supplements simply to increase sales.

Sales analytics

Track:

- Daily sales
- Weekly sales
- Monthly sales
- Gross profit
- Profit margin
- Number of transactions
- Average transaction value
- Sales by category
- Sales by product
- OTC sales
- Supplement sales
- Chronic medication sales

Show trends and identify changes in customer behavior.

Alerts

Create alerts for:

- Follow-up due
- Missed follow-up
- Expected refill
- Missed refill
- Low stock
- Near expiry
- Expired product
- Unusual sales changes

Privacy and security

Patient information is sensitive.

Use:

- Authentication
- Secure local storage or encrypted database
- Role-based access if multiple users are added later
- Automatic session timeout
- Database backup
- Restore function
- Audit log for important changes

The system should work locally whenever possible.

Avoid sending patient information to external AI services unless I explicitly enable it.

Interface

Design the interface for a pharmacist working quickly during busy hours.

Prioritize:

- Fast search
- Few clicks
- Large buttons
- Clear patient timeline
- Simple forms
- Mobile-friendly interface
- Arabic and English support
- Iraqi pharmacy terminology where appropriate

Main screens

Create:

1. Dashboard
2. Patients
3. Patient profile
4. Medication history
5. Visits
6. Follow-ups
7. Inventory
8. Sales analytics
9. Alerts
10. Reports
11. Settings
12. Backup and restore

Patient timeline

Every patient should have a chronological timeline containing:

- Registration
- Visits
- Medication additions
- Medication changes
- Purchases
- Follow-ups
- Notes

Analytics

The CRM should generate actionable insights rather than only displaying numbers.

For example:

"23 chronic patients are expected to refill within 7 days."

"11 patients have not returned within their expected refill period."

"OTC sales increased 14% this month."

"Category X has high sales but low profit margin."

"17 products may expire before expected stock depletion."

Explain why each insight matters and what action I should consider.

AI assistant

Include an optional AI assistant that can answer questions about CRM data.

Examples:

- Which chronic patients are due for refill this week?
- Which patients have missed their expected refill?
- What are my top 20 profitable products?
- Which categories have high sales but low margins?
- Which products are at risk of expiry?
- Which days have the highest sales?
- What changed compared with last month?
- Which patients need follow-up today?

The AI must distinguish between:

- Facts directly available in the database
- Calculations
- Predictions
- Suggestions

Never invent patient information or sales data.

Architecture

Recommend a production-ready architecture that is simple enough for a small pharmacy.

Prefer a local-first architecture.

Explain:

- Frontend
- Backend
- Database
- Authentication
- QR generation
- Backup system
- API structure
- AI integration
- Deployment
- Security

Design the database schema before implementation.

Include relationships between:

- Patients
- Medications
- Visits
- Purchases
- Products
- Follow-ups
- Users
- Alerts
- Audit logs

Important constraints

The system must remain simple.

Do not add features just because they sound impressive.

Every feature should answer one of these questions:

- Does it save pharmacist time?
- Does it improve patient follow-up?
- Does it reduce stock problems?
- Does it improve business visibility?
- Does it improve patient service?
- Does it protect patient data?

Before writing implementation code:

1. Define the complete requirements.
2. Identify missing requirements.
3. Design the database.
4. Design the user workflow.
5. Design the API.
6. Define the security model.
7. Define the MVP.
8. Then propose the implementation plan.

Build the MVP first.

Do not overengineer the system.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
