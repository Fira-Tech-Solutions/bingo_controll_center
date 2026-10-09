# BUILD THE COMPLETE AGENT ROLE — PERMISSIONS + MOBILE-FIRST IMPLEMENTATION

You are now implementing the **AGENT role only** in the existing Bingo Management web application.

The application has exactly three roles:

```text
SUPER_ADMIN
ADMIN
AGENT
```

Super Admin and Admin experiences are being implemented separately.

Your task is to build the complete **Agent experience**, with a strict permission model and the same established design language used by the Super Admin and Admin interfaces.

The Agent should have the simplest operational experience.

The Agent is NOT a system administrator.

The Agent should only be able to perform day-to-day operations on the centers assigned to them and should never gain access to administrative or system-wide functionality.

---

# 1. FIRST RULE — INSPECT THE EXISTING PROJECT

Before implementing anything:

Inspect:

* existing React application
* existing Stitch-derived design
* existing Super Admin implementation
* existing Admin implementation
* routing
* authentication
* role handling
* permission handling
* API/service layer
* backend routes
* backend controllers
* backend services
* database models
* center/agent relationships
* package system
* transaction system
* balance file generation
* credential file generation
* activity/audit system

Create a map:

```text
Agent Screen
    ↓
React Component
    ↓
Service/API
    ↓
API Endpoint
    ↓
Backend Authorization
    ↓
Controller
    ↓
Service
    ↓
Database
```

Do NOT invent API endpoints.

If a required Agent operation is not supported by the backend:

* identify the missing capability
* do not fake it
* do not use mock data
* do not bypass backend authorization
* document the required backend change

---

# 2. AGENT ROLE DEFINITION

The Agent is an operational user.

The Agent can work only within the centers assigned to them.

Conceptually:

```text
AGENT
   │
   ├── Assigned Center A
   ├── Assigned Center B
   └── Assigned Center C
```

An Agent may have multiple assigned centers if supported by the backend.

The Agent must NEVER automatically gain access to all centers.

Center access must be based on the backend's actual assignment/authorization model.

---

# 3. AGENT PERMISSION PHILOSOPHY

The Agent should follow this principle:

> "An Agent can operate the system, but cannot administer the system."

The Agent may perform authorized operational actions.

The Agent may NOT:

* manage Admin users
* manage Agents
* create users
* change roles
* assign users to centers
* create system settings
* manage packages unless explicitly authorized
* access global analytics
* access system-wide reports
* access global audit logs
* access unauthorized centers
* modify permissions
* modify security configuration
* access encryption secrets
* access credential secrets
* modify financial rules

---

# 4. PERMISSION MATRIX

Implement the following permission model.

| Capability                     | Super Admin |             Admin |                                 Agent |
| ------------------------------ | ----------: | ----------------: | ------------------------------------: |
| View own dashboard             |         YES |               YES |                                   YES |
| View assigned centers          |         YES |               YES |                                   YES |
| View all centers               |         YES |            Scoped |                                    NO |
| Create center                  |         YES | Backend-dependent |                                    NO |
| Edit center                    |         YES | Backend-dependent |       NO unless explicitly authorized |
| Create Admin                   |         YES |                NO |                                    NO |
| Manage Admins                  |         YES |                NO |                                    NO |
| Create Agent                   |         YES |               YES |                                    NO |
| Manage Agents                  |         YES |        YES scoped |                                    NO |
| Assign Agent to centers        |         YES |        YES scoped |                                    NO |
| View assigned transactions     |         YES |        YES scoped |                                   YES |
| View global transactions       |         YES |            Scoped |                                    NO |
| Create operational transaction |         YES |               YES |                 YES if backend allows |
| Generate balance file          |         YES |               YES |                     YES if authorized |
| Generate credential file       |         YES |               YES |                     YES if authorized |
| Manage packages                |         YES | Backend-dependent |                                    NO |
| View package definitions       |         YES |               YES |                                   YES |
| View global analytics          |         YES |            Scoped |                                    NO |
| View reports                   |         YES |            Scoped | Only operational reports if supported |
| View activity                  |         YES |            Scoped |                 Own/relevant activity |
| View audit logs                |         YES | Backend-dependent |                                    NO |
| System settings                |         YES |        NO/limited |                                    NO |
| Notifications                  |         YES |               YES |                                   YES |
| Profile                        |         YES |               YES |                                   YES |
| Security                       |         YES |               YES |                                   YES |
| Manage permissions             |         YES |                NO |                                    NO |

IMPORTANT:

This matrix is the intended product model.

However, the backend is authoritative.

If the existing backend has different capabilities, inspect the actual implementation and preserve security.

Do not create frontend permissions that contradict backend authorization.

---

# 5. MOST IMPORTANT SECURITY RULE

Never rely on frontend hiding.

The following must all be protected:

```text
Navigation
Routes
Components
Buttons
Actions
API requests
Backend authorization
```

If an Agent manually enters:

```text
/admin
/super-admin
/admin/agents
/super-admin/users
```

the application must not expose unauthorized content.

Backend authorization must reject unauthorized requests.

Frontend should also redirect/show a proper Forbidden state.

---

# 6. AGENT NAVIGATION

Keep the Agent navigation simple.

Recommended:

```text
Dashboard

Operations
  My Centers
  Transactions
  Balance Files
  Credential Files

Packages
  Packages

Activity
  Activity
  Notifications

Account
  Profile
  Security
```

Only expose screens actually supported by the backend.

DO NOT show:

```text
Admin Management
Agent Management
System Settings
Global Users
Global Audit Logs
Global Analytics
```

The Agent should not even see navigation items for features they cannot use.

---

# 7. MOBILE-FIRST

The Agent is likely to use the system while performing operational work.

Therefore mobile usability is extremely important.

Design first for:

```text
320px
360px
375px
390px
430px
```

Then adapt to:

```text
768px+
1024px+
1280px+
```

The UI must feel like a mobile application.

Prioritize:

* large touch targets
* fast navigation
* compact cards
* clear actions
* minimal typing
* searchable selectors
* bottom navigation
* bottom sheets
* confirmation dialogs
* sticky actions where useful

Avoid giant desktop tables on mobile.

---

# 8. AGENT APP SHELL

Use the same design system as Admin and Super Admin.

Do NOT create a separate visual identity.

The experience should communicate:

```text
Same application
Different role
Different permissions
```

Mobile:

```text
┌────────────────────────┐
│ Header                 │
├────────────────────────┤
│                        │
│ Page                   │
│                        │
├────────────────────────┤
│ Home | Centers | More  │
└────────────────────────┘
```

Reuse existing shell components where possible.

---

# 9. AGENT DASHBOARD

Route:

```text
/agent
```

The dashboard should be focused on operational information.

Do NOT overload it with Super Admin-level analytics.

The Agent should immediately understand:

* which centers they are assigned to
* today's activity
* today's transactions
* files generated
* package options
* recent activity
* notifications
* anything requiring attention

---

# 10. DASHBOARD KPI CARDS

Where supported by backend:

```text
Assigned Centers
3

Today's Transactions
24

Today's Payments
45,000 ETB

Balance Issued
675,000 ETB

Files Generated
18
```

Only show real backend data.

If financial data fails:

```text
Unable to load payment data
```

Never show:

```text
0 ETB
```

as a fake fallback.

---

# 11. QUICK ACTIONS

The Agent dashboard should prioritize the actions they perform most often.

For example:

```text
Generate Balance
Generate Credentials
View Centers
View Transactions
```

Use large mobile-friendly action buttons.

Do not expose administrative actions.

---

# 12. MY CENTERS

Route:

```text
/agent/centers
```

Show only centers assigned to the authenticated Agent.

Do NOT allow the frontend to request all centers and then filter them.

The backend should enforce scope.

Each center card should show useful operational information:

```text
Addis Center
Active

Today's Transactions
8

Last Activity
12 min ago

[Open Center]
```

Only use fields actually available from backend.

---

# 13. CENTER DETAILS

Route:

```text
/agent/centers/:id
```

The Agent should see only authorized center details.

Sections:

### Overview

* center name
* status
* relevant information
* assigned context

### Transactions

Transactions relevant to the center.

### Balance Files

Balance files generated for the center.

### Credential Files

Credential files relevant to the center.

### Packages

Available packages for operations.

### Activity

Relevant operational activity.

Do not expose:

* system-wide financial information
* other centers
* administrative configuration
* secrets

---

# 14. CENTER AUTHORIZATION

This is critical.

If Agent A is assigned:

```text
Center A
Center B
```

and not:

```text
Center C
```

then:

```text
GET /centers/A
```

may succeed.

```text
GET /centers/B
```

may succeed.

```text
GET /centers/C
```

must be rejected by backend authorization.

Frontend should also prevent navigation where possible.

Never trust:

```text
centerId
```

coming from the browser.

Backend must verify the Agent's assignment.

---

# 15. PACKAGE SCREEN

Route:

```text
/agent/packages
```

The Agent should be able to view the currently available packages.

Example:

```text
2,000 ETB
→
30,000 ETB Balance

5,000 ETB
→
75,000 ETB Balance

10,000 ETB
→
150,000 ETB Balance
```

Use actual backend package data.

Clearly communicate:

```text
Customer Payment
Application Balance
```

The Agent should NOT manually enter arbitrary payment/balance values when using the package workflow.

---

# 16. PACKAGE PERMISSION

Default Agent permission:

```text
VIEW PACKAGES
```

NOT:

```text
CREATE PACKAGE
EDIT PACKAGE
DELETE PACKAGE
DEACTIVATE PACKAGE
CHANGE FINANCIAL VALUES
```

Package management belongs to administrative roles according to backend authorization.

If backend explicitly grants some additional capability, implement only that capability.

---

# 17. BALANCE FILE WORKFLOW

This is one of the Agent's most important operations.

Route:

```text
/agent/files/balance
```

Primary workflow:

```text
Select Center
      ↓
Select Package
      ↓
Review
      ↓
Confirm Payment Received
      ↓
Generate
      ↓
Success
      ↓
Download
      ↓
View Transaction
```

---

# 18. CENTER SELECTOR

Only show centers assigned to the Agent.

On mobile, use:

```text
Searchable bottom sheet
```

or another touch-friendly selector.

Do not show unauthorized centers.

---

# 19. PACKAGE SELECTOR

Show active/available packages returned by backend.

Example:

```text
Choose Package

┌────────────────────────┐
│ 2,000 ETB              │
│ Balance: 30,000 ETB    │
└────────────────────────┘

┌────────────────────────┐
│ 5,000 ETB              │
│ Balance: 75,000 ETB    │
└────────────────────────┘
```

The Agent selects a predefined package.

---

# 20. REVIEW BEFORE GENERATION

Before generating the balance file, show a clear review:

```text
Center
Addis Center

Package
5,000 ETB → 75,000 ETB

Payment
5,000 ETB

Application Balance
75,000 ETB
```

Then:

```text
☐ I confirm that the payment has been received.
```

The Generate button remains disabled until confirmation.

---

# 21. BALANCE FILE GENERATION SAFETY

When Generate is pressed:

```text
Generate
   ↓
Disable button
   ↓
Show progress
   ↓
Backend request
   ↓
Success
```

Prevent:

* double-click
* duplicate requests
* accidental repeated generation
* navigation-related duplicate submissions

Use backend idempotency if supported.

If backend does not support idempotency, document the required backend improvement.

---

# 22. DOWNLOAD FAILURE

If:

```text
Generation succeeds
```

but:

```text
Download fails
```

DO NOT regenerate.

Show:

```text
Balance file generated successfully.

The download could not be completed.

[Retry Download]
[View Transaction]
```

The user should never have to regenerate a successful balance file merely because the browser download failed.

---

# 23. DO NOT EXPOSE ENCRYPTION

The Agent should only see:

```text
File ID
Status
Generated time
Center
Package
Transaction
Download
```

Never expose:

```text
encryption keys
encryption algorithm
raw encrypted content
internal secrets
```

Encryption remains backend/server-side.

---

# 24. BALANCE FILE LIST

Show:

```text
File ID
Center
Package
Payment
Balance
Status
Generated at
```

Mobile:

Use cards.

Desktop:

Use table.

Use server-side pagination.

---

# 25. CREDENTIAL FILES

Route:

```text
/agent/files/credentials
```

Allow the Agent to generate credential files only where backend authorization permits it.

Workflow:

```text
Select Center
      ↓
Select Authorized User
      ↓
Review
      ↓
Confirm
      ↓
Generate
      ↓
Success
      ↓
Download
```

Never expose raw credentials.

Never display secrets in UI.

---

# 26. AUTHORIZED USER SELECTION

The Agent must only be able to select users/resources explicitly authorized by backend.

Do not load all users globally.

Bad:

```text
GET /users
```

then frontend filtering.

Good:

```text
GET authorized users for this center
```

using the existing backend API.

If such an endpoint doesn't exist, document the required backend capability.

---

# 27. TRANSACTIONS

Route:

```text
/agent/transactions
```

Show only transactions within the Agent's authorized scope.

Support:

* search
* date filter
* center filter
* package filter
* status filter
* pagination

Do not show global transactions.

---

# 28. MOBILE TRANSACTION CARD

Example:

```text
TX-000182

Addis Center

5,000 ETB
→
75,000 ETB

Completed
Today, 14:32

[View]
```

Make the most important information immediately visible.

---

# 29. TRANSACTION DETAILS

Route:

```text
/agent/transactions/:id
```

Show:

```text
Transaction ID
Center
Package
Payment
Balance
Status
Created time
Generated file
```

Where permitted:

```text
Timeline
```

Do not expose internal security information.

---

# 30. TRANSACTION CREATION

If the existing backend allows Agents to create operational transactions, implement it.

If the existing business flow requires balance file generation as part of the transaction, preserve the existing backend workflow.

Do not create a parallel frontend-only transaction mechanism.

The backend must remain authoritative.

---

# 31. ACTIVITY

Route:

```text
/agent/activity
```

Show activity relevant to the Agent.

Examples:

```text
Balance file generated
Credential file generated
Transaction completed
Center activity
```

Do not expose global system audit logs.

The Agent should only see activity that the backend authorizes.

---

# 32. NOTIFICATIONS

Route:

```text
/agent/notifications
```

Show relevant notifications.

Support:

* unread/read
* severity
* timestamp
* category
* related resource

Allow:

```text
Mark as read
```

if supported.

Use optimistic UI only for safe notification operations.

---

# 33. PROFILE

Route:

```text
/agent/profile
```

Show:

* name
* username/email
* phone if supported
* role
* account status
* assigned center count

Allow editing only fields supported by backend.

Do not allow the Agent to change:

```text
role
permissions
center assignments
```

---

# 34. SECURITY

Route:

```text
/agent/security
```

Possible supported features:

* change password
* security activity
* active sessions
* MFA

Only implement APIs that actually exist.

Never expose:

* passwords
* tokens
* encryption keys
* credentials
* secrets

---

# 35. AGENT CANNOT MANAGE USERS

Explicitly enforce:

```text
Create User → FORBIDDEN
Create Admin → FORBIDDEN
Create Agent → FORBIDDEN
Edit Agent → FORBIDDEN
Assign Agent → FORBIDDEN
Manage roles → FORBIDDEN
```

The Agent is not a user administrator.

---

# 36. AGENT CANNOT MANAGE CENTERS

Unless the backend explicitly provides a narrow operational permission, the Agent should NOT:

```text
Create Center
Delete Center
Edit Center configuration
Assign users
Change center ownership
```

The Agent can:

```text
VIEW ASSIGNED CENTERS
OPERATE WITHIN ASSIGNED CENTERS
```

---

# 37. AGENT CANNOT CHANGE PACKAGES

The Agent cannot:

```text
Create package
Edit package
Delete package
Change payment amount
Change balance amount
Change package rules
```

Packages are controlled by authorized administrative roles.

---

# 38. GLOBAL DATA RESTRICTION

Never expose global:

```text
users
centers
transactions
files
financial reports
analytics
audit logs
```

unless backend explicitly authorizes it.

Agent scope should always be respected.

---

# 39. FORBIDDEN ROUTE HANDLING

If Agent attempts to open:

```text
/super-admin
/admin
/admin/agents
/admin/packages/manage
/super-admin/audit-logs
```

show a proper:

```text
403 Forbidden
You don't have permission to access this page.
```

Do not display blank screens.

Do not leak data before redirecting.

---

# 40. API AUTHORIZATION

Every request must use the authenticated user's session/token according to the existing authentication architecture.

Do not send:

```text
role=ADMIN
```

from the frontend and assume that makes the user an Admin.

Do not trust:

```text
centerId
userId
role
permissions
```

from client-controlled values.

Backend must validate all authorization.

---

# 41. LOADING EXPERIENCE

Agent workflows must feel extremely fast.

Use:

* skeletons
* cached data
* background refresh
* independent loading
* optimistic updates only when safe
* route-level lazy loading
* request deduplication

The Agent should not wait for the whole dashboard to load.

---

# 42. PERFORMANCE

Use the application's existing performance strategy.

Important:

* server pagination
* query caching
* request deduplication
* debounce search
* lazy-load heavy screens
* avoid unnecessary API calls
* don't load all centers
* don't load all users
* don't load all transactions
* don't load all files
* don't load all activity

The Agent's limited data scope should make this role especially fast.

---

# 43. OFFLINE/NETWORK BEHAVIOR

If the web application supports PWA/caching:

Previously loaded safe data can remain visible when offline.

Example:

```text
Offline

Showing last updated center information.
```

But never pretend these succeeded offline:

```text
Transaction creation
Payment confirmation
Balance generation
Credential generation
Account changes
```

These require server confirmation.

---

# 44. ERROR HANDLING

Implement:

```text
401
403
404
409
422
429
500
network error
timeout
file generation failure
download failure
```

For example:

```text
403
You don't have permission to access this center.
```

For network errors:

```text
Unable to connect.

[Retry]
```

For file generation:

```text
File generation failed.

No file was generated.

[Try Again]
```

Do not tell the user that a file exists unless backend confirms it.

---

# 45. EMPTY STATES

Use useful empty states.

Example:

```text
No centers assigned

You currently don't have any centers assigned
to your account.
```

Transactions:

```text
No transactions yet

Transactions for your assigned centers
will appear here.
```

Files:

```text
No balance files yet

Generated balance files will appear here.
```

---

# 46. MOBILE ACTION DESIGN

The Agent often needs to complete tasks quickly.

Prioritize:

```text
Select center
Select package
Review
Confirm
Generate
Download
```

Use a clear step-by-step mobile workflow.

Avoid forcing the Agent through complicated administrative forms.

---

# 47. CONFIRMATION DIALOGS

Use confirmation for important actions.

Especially:

```text
Generate Balance File
Generate Credential File
```

The confirmation should summarize exactly what will happen.

Example:

```text
Generate Balance File?

Center:
Addis Center

Package:
5,000 ETB → 75,000 ETB

Payment:
5,000 ETB

Balance:
75,000 ETB

☑ Payment received

[Cancel]
[Generate]
```

---

# 48. NO MANUAL FINANCIAL EDITING

The normal Agent workflow must NOT allow:

```text
Payment = [editable]
Balance = [editable]
```

Instead:

```text
Package
5,000 ETB
↓
Backend-defined balance
75,000 ETB
```

This prevents accidental financial manipulation.

---

# 49. AUDITABILITY

Important Agent operations must be recorded by the backend where supported.

Examples:

```text
Transaction created
Balance file generated
Credential file generated
```

The UI should display:

```text
Actor
Timestamp
Resource
Result
```

where appropriate.

Do not implement fake audit records in React.

---

# 50. AGENT DASHBOARD INFORMATION HIERARCHY

Prioritize:

```text
1. Today's operational status
2. Assigned centers
3. Quick actions
4. Transactions
5. File generation
6. Recent activity
7. Notifications
```

Do NOT prioritize:

```text
Global company analytics
Global revenue
Global users
System configuration
Administrative management
```

Those belong to higher roles.

---

# 51. DESKTOP EXPERIENCE

Desktop should still be professional.

Use:

* sidebar
* tables where appropriate
* compact cards
* split layouts
* detail panels
* charts only where useful

But do not let desktop complexity leak into mobile.

---

# 52. MOBILE EXPERIENCE

On mobile:

Use:

```text
Cards
Bottom sheets
Bottom navigation
Sticky primary action
Compact filters
Searchable selectors
Collapsible sections
```

Avoid:

```text
Wide tables
Tiny buttons
Tiny dropdowns
Multiple competing primary actions
Long forms
Horizontal scrolling
```

---

# 53. PERFORMANCE + DATA CACHING

Use the existing application caching architecture.

Recommended behavior:

```text
Open Centers
    ↓
cached centers appear
    ↓
background refresh
    ↓
fresh centers
```

For transactions:

```text
cached first page
    ↓
background refresh
```

For financial data:

Use appropriate freshness and authoritative backend data.

Never display stale financial information as though it were confirmed current when the workflow requires current state.

---

# 54. PREVENT DUPLICATE API REQUESTS

Avoid:

```text
Dashboard
 ↓
GET centers

Navigation
 ↓
GET centers

Center selector
 ↓
GET centers
```

Use shared query/cache where appropriate.

---

# 55. SEARCH AND FILTERING

Use debounced search:

```text
250–400ms
```

or an appropriate value.

Cancel/ignore obsolete requests.

Example:

```text
Addis
 ↓
Adama
```

The Adama result must not be overwritten by a late Addis response.

---

# 56. ROUTING STRUCTURE

Adapt to the existing router.

Conceptual structure:

```text
/agent
/agent/centers
/agent/centers/:id
/agent/packages
/agent/transactions
/agent/transactions/:id
/agent/files/balance
/agent/files/balance/:id
/agent/files/credentials
/agent/files/credentials/:id
/agent/activity
/agent/notifications
/agent/profile
/agent/security
```

Do not blindly create routes that conflict with the existing application.

---

# 57. COMPONENT REUSE

Reuse:

* buttons
* cards
* tables
* dialogs
* forms
* selectors
* status badges
* notification components
* shell
* navigation
* skeletons
* error states

Do not create duplicate versions of existing components unless necessary.

---

# 58. DESIGN CONSISTENCY

The Agent UI must visually belong to the same product.

Maintain:

* typography
* spacing
* colors
* border radius
* shadows
* icons
* buttons
* status styles
* cards
* form controls
* responsive behavior

The difference should be:

```text
ROLE
+
PERMISSION
+
INFORMATION SCOPE
```

not an entirely different design.

---

# 59. TEST PERMISSIONS THOROUGHLY

Test with a real Agent account.

### Agent CAN:

```text
Login
View dashboard
View assigned centers
Open assigned center
View authorized packages
View authorized transactions
Generate authorized balance files
Download generated files
Generate authorized credential files
View relevant activity
View notifications
Manage own profile
Manage own security
```

### Agent CANNOT:

```text
Create Admin
Create Agent
Edit Agent
Assign Agent
Create Center
Manage Center
Change packages
Create packages
Edit package values
View unauthorized center
View unauthorized transaction
View global transactions
View global users
View global files
View global analytics
View global reports
View audit logs
Change roles
Change permissions
Access system settings
```

---

# 60. DIRECT URL TESTING

Test manually:

```text
Agent logs in
    ↓
tries /super-admin
    ↓
403/redirect

tries /admin
    ↓
403/redirect

tries /admin/agents
    ↓
403/redirect

tries unauthorized center URL
    ↓
backend rejects

tries unauthorized transaction URL
    ↓
backend rejects
```

Do not merely hide these pages from navigation.

---

# 61. SECURITY TESTING

Verify:

* JWT/session authorization
* backend role enforcement
* center-level authorization
* resource ownership/scope
* no IDOR vulnerabilities
* no client-controlled role escalation
* no client-controlled center access
* no sensitive response data
* no secrets in local storage unless existing architecture explicitly requires it
* no encryption keys exposed
* no raw credentials exposed

If you identify an authorization vulnerability in the backend, document it and fix it if appropriate within the existing architecture.

---

# 62. PRODUCTION QUALITY

Do not leave:

```text
console.log()
mock data
temporary permissions
fake API responses
TODO security bypasses
hardcoded users
hardcoded centers
hardcoded package values
```

in production flows.

---

# 63. IMPLEMENTATION ORDER

Build incrementally.

### Phase 1

Agent authentication and authorization.

### Phase 2

Agent shell/navigation.

### Phase 3

Agent dashboard.

### Phase 4

Assigned centers.

### Phase 5

Center details.

### Phase 6

Packages/read-only package selection.

### Phase 7

Balance file generation.

### Phase 8

Credential file generation.

### Phase 9

Transactions.

### Phase 10

Activity.

### Phase 11

Notifications.

### Phase 12

Profile.

### Phase 13

Security.

### Phase 14

Performance optimization.

### Phase 15

Mobile hardening.

### Phase 16

Permission/security testing.

---

# 64. DEFINITION OF DONE

The Agent role is complete only when:

* Agent login works
* Agent routes are protected
* Agent sees only authorized centers
* center-level authorization works
* Agent cannot manage users
* Agent cannot create Admins
* Agent cannot create Agents
* Agent cannot assign users
* Agent cannot manage packages
* Agent can view available packages
* Agent can perform authorized operational workflows
* balance generation works where authorized
* credential generation works where authorized
* duplicate generation is prevented
* transaction history is scoped
* file history is scoped
* activity is scoped
* notifications work
* profile works
* security works
* loading states work
* empty states work
* error states work
* mobile UI works from 320px+
* desktop UI works
* no horizontal overflow
* no mock data
* no invented APIs
* no secrets exposed
* financial values remain backend-authoritative
* backend authorization is enforced
* direct URL access is protected
* typecheck passes
* lint passes
* tests pass
* production build succeeds

---

# FINAL PRODUCT PRINCIPLE

The Agent interface should communicate:

> **"Everything I need to operate my assigned centers, and nothing I should not control."**

Keep the Agent experience:

```text
FAST
SIMPLE
MOBILE-FIRST
OPERATIONAL
SECURE
INFORMATIVE
```

while keeping the same visual language as Super Admin and Admin.

Do not turn the Agent dashboard into another administrative dashboard.

The Agent should be able to open the application and quickly:

```text
See assigned centers
      ↓
Choose center
      ↓
Choose package
      ↓
Confirm payment
      ↓
Generate balance
      ↓
Download file
      ↓
Continue operating
```

That operational workflow should be the **fastest and most frictionless part of the application**.

Start by auditing the existing authentication, role/permission implementation, center assignment model, package APIs, transaction APIs, and file-generation APIs. Then implement the Agent role incrementally, using real backend data and enforcing authorization at both frontend and backend levels.
