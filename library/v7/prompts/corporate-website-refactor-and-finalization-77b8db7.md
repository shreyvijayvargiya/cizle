# Corporate Website Refactor and Finalization

By @hayebra073@gmail.com · general
Language: en · Domains: product, engineering · Source: P01

Source page: https://prompts.chat

```
Act as an elite full-stack developer and UI/UX expert. Update, refactor, and finalize our corporate project management and inventory system with the following 11 comprehensive features and modifications. Ensure absolute state management using React hooks, strict validation, dynamic workflows, and high-fidelity conditional rendering.

1. Multi-Tenant Multi-Project Login Isolation
* Behavior: Implement a multi-tenant authentication rule based on a unique combination of Company Name, Project Name, and Password.
* Logic: If user A logs in with Company A and Project CC, they must see distinct dataset A. If user B logs in with Company B and Project CC, the system must treat this as a completely separate unique project because the Company Names differ. Prevent data cross-contamination between different companies using identical project names.

2. Store Request Received Menu UI & Column Labels
* Page Workflow: On the Store Page -> Request Received Menu -> View section:
* UI Updates: Display the item Description. Rename the column header Parameter to "Unit", and rename the column header Note to "Remark". 
* Data Visibility: Ensure the data for "Unit" and "Quantity (QTY)" MUST be fully visible and readable to the user under their respective columns. Do not hide these core transaction details.
* Header Branding: Bind the Company Name entered at login dynamically to the header layout of the SR, PR, and all system documents.

3. Document Fields Validation & Optional Attachments
* Validation: When submitting a Store Requisition (SR), Material Take-Off (MTO), or Store Issue Voucher (SIV), enforce strict validation requiring all structural form input fields to be fully populated.
* Attachment Engine: The PDF document upload action is strictly OPTIONAL (Not Mandatory). Users can successfully submit forms without an attachment. 
* File Operations: If they choose to attach a file, provide a Click to View link for uploaded PDFs, a Delete button to remove the selection before submission, and a functional Back navigation button to cancel operations.

4. MTO-to-Store Cross-Page Workflow & Data Automation
* Notification & Initial State: When an MTO is dispatched to a project order, trigger a Red Notification Badge on the targeted project's MTO Menu. Inside this menu, only display two options: Ready and View.
* Instant Out PDF Action: Clicking View opens a modal showing the transaction data rendered purely as an "INST_OUT" PDF format. After review, the user clicks the Ready button.
* Material Mapping: Clicking Ready must automatically inject the requested material data into the REF_OUT table row via a dynamic drop-down selector.
* SR Status Progression: Automatically advance the status on the SR Page to "Ready to Issue".

5. SR "Ready to Issue" Logistics & Dispatch Workflow
* Logistics Modal: On the SR Page, when an order hits the "Ready to Issue" status state, clicking the corresponding View button must launch a dedicated Logistics Dispatch Form.
* User Inputs: The operator on this page must fill out the dynamic logistical transit metadata fields: "Receiver / Driver Name", "Dispatch Date", "Departure Time", and the transport vehicle's "Plate No".
* Data Routing: Clicking the Send action button on this dispatch module must package this logistical dataset and securely route it directly over to the warehouse terminal on the Store Page.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
