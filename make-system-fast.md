# PERFORMANCE ENGINEERING — MAKE THE BINGO MANAGEMENT WEB APP FEEL LIKE A NATIVE MOBILE APP

You are now responsible for making the existing Bingo Management web application **extremely fast, smooth, responsive, and app-like**, especially on mobile networks and lower-powered devices.

The goal is:

> When a user opens or navigates through the application, it should feel almost like opening a native mobile application: the interface appears immediately, navigation is smooth, useful content appears quickly, cached data is reused intelligently, and fresh server data updates in the background.

This is a **performance engineering task**, NOT a redesign.

Do not change the established Stitch-derived UI/design system unless a change is required for performance.

Do not change business rules.

Do not weaken authentication or authorization.

Do not move security-sensitive logic into the frontend.

Do not replace the existing backend architecture unnecessarily.

---

# 1. FIRST: AUDIT BEFORE CHANGING CODE

Before implementing optimizations, inspect the entire current application.

Analyze:

* React architecture
* routing
* components
* state management
* API/service layer
* authentication
* data fetching
* caching
* bundle size
* dependency size
* images/assets
* CSS
* dashboard requests
* page requests
* backend API latency
* database queries where accessible
* pagination
* unnecessary requests
* duplicate requests
* rendering performance
* mobile performance

Do not immediately start rewriting code.

First identify the actual bottlenecks.

Create a performance map such as:

```text
App startup
    ↓
JavaScript bundle
    ↓
React initialization
    ↓
Authentication/session check
    ↓
App shell
    ↓
Dashboard API requests
    ↓
Data rendering
    ↓
Secondary requests
```

Also inspect important routes:

```text
/admin
/admin/centers
/admin/agents
/admin/packages
/admin/transactions
/admin/files/balance
/admin/files/credentials
/admin/reports
/admin/analytics
/admin/activity
/admin/notifications
```

and equivalent Super Admin routes.

---

# 2. PERFORMANCE GOAL

The application should behave like:

```text
USER OPENS APP
       ↓
APP SHELL
       ↓
IMMEDIATE VISUAL FEEDBACK
       ↓
CACHED DATA IF AVAILABLE
       ↓
FRESH API DATA IN BACKGROUND
       ↓
SMOOTH UPDATE
```

Never make users stare at a blank screen while the entire application waits for multiple API requests.

---

# 3. DEFINE PERFORMANCE BUDGETS

Establish practical targets.

Aim for:

### Initial experience

```text
First meaningful UI:
very fast

App shell:
appears immediately

Dashboard:
usable as soon as primary data is available

Secondary widgets:
load independently
```

### Navigation

Previously visited pages should feel nearly instantaneous through:

* cached data
* persistent app shell
* route prefetching where useful
* lazy-loaded page chunks
* skeleton states

### Network

Minimize:

* number of requests
* request payload size
* duplicate requests
* unnecessary refetches
* unnecessary data transfer

Measure actual results rather than claiming performance improvements without evidence.

---

# 4. KEEP THE APP SHELL FAST

The following should appear as early as possible:

```text
App shell
Header
Navigation
Main layout
Page structure
```

Do not make the shell wait for:

* analytics
* transaction lists
* activity
* notifications
* reports
* large datasets

Structure:

```text
App startup
    ↓
Shell renders
    ↓
Primary page renders
    ↓
Data loads independently
```

The user should see the application immediately.

---

# 5. DO NOT LOAD THE ENTIRE SYSTEM AT STARTUP

This is one of the highest-priority requirements.

Never do:

```text
Application startup
    ↓
load all centers
load all agents
load all transactions
load all files
load all activity
load all notifications
load all reports
load all analytics
```

Instead:

```text
Application startup
    ↓
authentication
    ↓
app shell
    ↓
current page data only
```

Load additional data only when needed.

---

# 6. IMPLEMENT SERVER-STATE CACHING

Inspect the current data-fetching architecture.

If the application does not already have a suitable server-state/cache solution, evaluate using **TanStack Query** or the project's existing equivalent.

Use caching for data such as:

```text
centers
agents
packages
transactions
files
notifications
activity
dashboard summaries
```

The exact implementation must match the existing project.

Avoid introducing unnecessary dependencies if an existing solution already provides the required functionality.

---

# 7. CACHE + BACKGROUND REFRESH

For appropriate read-only data:

```text
First visit
    ↓
API
    ↓
cache
    ↓
render

Second visit
    ↓
cached data immediately
    ↓
background API request
    ↓
fresh data
    ↓
smooth update
```

This is extremely important for making the app feel fast.

Do not force users to wait for a network request if valid cached data is already available.

However:

* financial data must be treated carefully
* security-sensitive data must not be improperly cached
* stale data must be clearly handled where accuracy matters

---

# 8. DEDUPLICATE REQUESTS

Find cases such as:

```text
Dashboard → GET centers
Navigation → GET centers
Agent page → GET centers
Create Agent → GET centers
```

If these are the same server data, use a shared query/cache.

Avoid multiple identical requests at the same time.

Example:

```text
              Centers Query
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
 Dashboard      Agents      Create Agent
```

One shared request/cache instead of three independent requests.

---

# 9. DASHBOARD MUST LOAD INDEPENDENTLY

Do not create a single giant dashboard request if the backend does not support it efficiently.

Instead, where appropriate:

```text
Dashboard
   │
   ├── Summary
   ├── Financial overview
   ├── Centers
   ├── Agents
   ├── Activity
   └── Alerts
```

Each section should be able to load independently.

Example:

```text
KPI       → loaded
Centers   → loaded
Activity  → loading
Analytics → loading
Alerts    → error + retry
```

The entire dashboard must not become blocked because one API endpoint is slow.

---

# 10. USE SKELETON UI

Never use a full-page:

```text
Loading...
```

when the structure is already known.

Use skeletons matching the final UI.

Example:

```text
┌─────────────────────────┐
│ Dashboard               │
│                         │
│ ┌───────┐ ┌───────┐     │
│ │██████ │ │██████ │     │
│ │████   │ │████   │     │
│ └───────┘ └───────┘     │
│                         │
│ Recent activity         │
│ ███████████████         │
│ █████████████           │
└─────────────────────────┘
```

Then smoothly replace skeletons with actual data.

Do not create excessive animation.

Prefer subtle, professional transitions.

---

# 11. MOBILE-FIRST PERFORMANCE

The primary performance target is mobile.

Test approximately:

```text
320px
360px
375px
390px
430px
```

and simulate:

```text
Slow 4G
Fast 4G
Typical mobile network
High latency
Intermittent connection
```

Do not optimize only for a powerful desktop computer.

The application should remain usable on lower-powered Android devices.

---

# 12. RESPONSIVE RENDERING

Do not load desktop-only resources on mobile unnecessarily.

Avoid:

* huge tables
* massive DOM trees
* unnecessary chart rendering
* large hidden components
* desktop-only components mounted invisibly

If a desktop table contains thousands of DOM nodes, don't simply hide it on mobile.

Use appropriate mobile components.

---

# 13. ROUTE-LEVEL CODE SPLITTING

Do not ship every page's JavaScript in the initial bundle.

Use route-level lazy loading where appropriate.

Conceptually:

```text
Initial bundle
 ├── App shell
 ├── authentication
 ├── navigation
 └── current page

Lazy chunks
 ├── analytics
 ├── reports
 ├── transactions
 ├── activity
 ├── security
 └── other heavy pages
```

Especially lazy-load:

* analytics
* reports
* large charts
* audit/activity pages
* complex forms
* heavy file-related interfaces

Do not lazy-load tiny components where doing so would make navigation slower.

Use judgment.

---

# 14. PREFETCH LIKELY NEXT PAGES

Prefetch only likely next actions.

Examples:

```text
Dashboard
    ↓
prefetch Centers

Centers
    ↓
prefetch likely Center details

Agents
    ↓
prefetch create-agent dependencies
```

Do NOT prefetch every route.

Prefetching should improve perceived speed without wasting bandwidth.

---

# 15. PERSIST THE APP SHELL

Navigation should not rebuild the entire application.

Keep persistent:

```text
Header
Sidebar
Bottom navigation
User context
Global notifications
```

Only replace the active page content.

Desired behavior:

```text
Dashboard
   ↓
tap Centers
   ↓
same shell
   ↓
Centers content appears
```

Not:

```text
destroy entire app
 ↓
reinitialize
 ↓
reload everything
```

---

# 16. SERVER-SIDE PAGINATION

Every large collection must use server-side pagination.

Especially:

```text
transactions
activity
audit logs
agents
centers
files
notifications
```

Do not fetch thousands of records to display 20.

Prefer:

```text
GET /transactions?page=1&limit=20
```

or the equivalent existing backend API.

Use the backend's existing pagination conventions.

---

# 17. SEARCH PERFORMANCE

Search must be debounced.

Do NOT:

```text
User types:
A
→ request

Ad
→ request

Add
→ request

Addi
→ request

Addis
→ request
```

Instead:

```text
User types
    ↓
wait ~250–400ms
    ↓
request
```

Use a reasonable debounce based on existing UX.

Cancel obsolete requests where supported.

Example:

```text
Search: Addis
     ↓
user changes to Adama
     ↓
cancel/ignore Addis request
     ↓
show Adama results
```

Never allow stale responses to overwrite newer search results.

---

# 18. URL-BASED FILTER STATE

For important list pages, preserve:

```text
page
search
filters
sorting
date range
```

in the URL when appropriate.

Example:

```text
/admin/transactions?page=2&status=completed
```

This improves:

* navigation
* browser back/forward
* refresh behavior
* state restoration
* perceived performance

---

# 19. API RESPONSE SIZE

Inspect API payloads.

Do not request giant objects for list views.

For example, transaction list should return only what the list needs.

Conceptually:

```json
{
  "id": "TX123",
  "centerName": "Example Center",
  "payment": 5000,
  "balance": 75000,
  "status": "COMPLETED",
  "createdAt": "..."
}
```

Then detail page can request additional information:

```text
GET /transactions/:id
```

Do not change backend contracts without verifying existing architecture.

If API changes are necessary, document them separately.

---

# 20. BACKEND PERFORMANCE

Frontend optimization alone is not enough.

Inspect backend performance where access is available.

Look for:

* slow endpoints
* N+1 queries
* missing database indexes
* unnecessarily large responses
* expensive aggregations
* repeated database queries
* synchronous expensive operations
* inefficient joins/population
* unnecessary file operations

For example:

```text
GET /transactions
```

should not perform one database query per transaction to retrieve center information if it can efficiently obtain the required information in a single optimized operation.

Do not blindly rewrite backend queries.

Measure first.

---

# 21. DASHBOARD AGGREGATIONS

Do not calculate large financial statistics in React.

Bad:

```text
GET 20,000 transactions
        ↓
React calculates:
payments
balances
trends
package statistics
```

Prefer:

```text
Backend
   ↓
aggregated dashboard metrics
   ↓
small response
   ↓
React renders
```

The backend should remain authoritative for financial/business calculations.

---

# 22. FINANCIAL DATA MUST REMAIN AUTHORITATIVE

Never sacrifice correctness for perceived speed.

For:

* payments
* balance
* package values
* transaction creation
* balance file generation
* credential file generation

the backend is authoritative.

Cached data can be used for display where appropriate, but before critical financial actions, obtain the authoritative state required by the backend workflow.

Never make the UI claim:

```text
Payment successful
```

just because an optimistic UI update occurred.

---

# 23. FINANCIAL OPERATIONS MUST NOT BE OPTIMISTIC

Do NOT optimistically perform:

```text
payment confirmation
balance generation
credential generation
transaction creation
```

Correct flow:

```text
User confirms
    ↓
backend request
    ↓
backend validates
    ↓
backend performs operation
    ↓
success response
    ↓
update UI/cache
```

For safe actions such as:

```text
mark notification as read
```

optimistic updates may be used where appropriate.

---

# 24. FILE GENERATION PERFORMANCE

Balance and credential file generation can be expensive.

Do not block the entire UI while waiting.

Use:

```text
Generate
   ↓
button disabled
   ↓
progress state
   ↓
backend generation
   ↓
success
   ↓
download
```

The rest of the application should remain responsive where possible.

If generation succeeds but download fails:

```text
Generation successful

Download failed.

[Retry download]
[View transaction]
```

Never automatically generate a second file.

---

# 25. DUPLICATE REQUEST PROTECTION

For every important mutation:

* disable action while submitting
* prevent double-click
* track request state
* handle retries safely
* use backend idempotency if available

Especially:

```text
Generate Balance File
Generate Credential File
Create Transaction
Create Agent
Create Center
```

Never solve duplicate operations only with frontend state.

Backend must remain authoritative.

---

# 26. REQUEST CANCELLATION

Where supported, cancel obsolete requests.

Examples:

```text
Search request
Filter request
Rapid page navigation
```

If cancellation isn't possible, ensure stale responses cannot overwrite current state.

---

# 27. ERROR STATES MUST BE FAST AND USEFUL

Do not make users wait indefinitely.

Implement:

```text
loading
success
empty
error
```

For failed widgets:

```text
Unable to load activity.

[Retry]
```

Do not fail the entire page because one section failed.

---

# 28. RETRY STRATEGY

Use reasonable retries for:

* temporary network errors
* transient server errors

Do not automatically retry dangerous mutations indefinitely.

Especially do not blindly retry:

```text
balance generation
credential generation
financial transaction
```

unless the backend operation is safely idempotent.

---

# 29. AUTHENTICATION PERFORMANCE

Inspect authentication startup.

Avoid repeatedly doing:

```text
GET current-user
GET current-user
GET current-user
GET current-user
```

Use a centralized authenticated session/user query.

Persist only what is safe and appropriate.

Never store sensitive credentials insecurely just to make startup faster.

---

# 30. GLOBAL USER/ROLE CONTEXT

Once authenticated, don't repeatedly fetch:

```text
role
permissions
profile
```

from every component.

Use a centralized auth/session state.

However, authorization decisions must still be enforced by the backend.

---

# 31. REACT RENDER PERFORMANCE

Profile the application.

Look for:

* unnecessary parent renders
* huge component trees
* unstable props
* unnecessary state
* duplicated state
* expensive calculations
* expensive charts
* unnecessary context updates

Use:

* memoization where it actually helps
* stable callbacks where useful
* component splitting
* virtualization for genuinely large lists

Do NOT blindly add `useMemo` and `useCallback` everywhere.

Measure before optimizing.

---

# 32. LIST PERFORMANCE

For lists:

```text
transactions
activity
agents
centers
files
```

prefer:

```text
server pagination
```

before using virtualization.

If a screen genuinely renders hundreds/thousands of items simultaneously, consider list virtualization.

Don't optimize a 20-row paginated table with unnecessary complexity.

---

# 33. CHART PERFORMANCE

Charts can be expensive.

Do not render heavy analytics charts on the initial application startup unless required.

Use:

```text
lazy-loaded chart components
```

and render charts only when needed.

On mobile:

* reduce unnecessary data points
* avoid excessive animations
* keep labels readable
* don't render hidden desktop charts

Charts should communicate information quickly, not become the performance bottleneck.

---

# 34. ANIMATION

Use animation carefully.

The application should feel smooth, not flashy.

Use subtle transitions for:

* page transitions
* cards
* dialogs
* bottom sheets
* loading states
* navigation

Avoid:

* huge animations
* long transitions
* animation on every element
* expensive continuous animations

Respect:

```text
prefers-reduced-motion
```

---

# 35. IMAGE AND ASSET OPTIMIZATION

Inspect all images/assets.

Use appropriate:

* WebP
* AVIF where beneficial
* responsive sizes
* lazy loading

Don't load large images when small versions are sufficient.

Do not prioritize image optimization over API/bundle optimization if the application is primarily data-driven.

---

# 36. JAVASCRIPT BUNDLE OPTIMIZATION

Analyze the production bundle.

Identify:

* large dependencies
* duplicated packages
* unnecessary imports
* unused code
* heavy chart libraries
* heavy icon libraries
* unnecessary polyfills

Use tree-shaking-compatible imports.

Remove dependencies only when safe.

Do not replace stable libraries merely for a tiny theoretical size reduction.

---

# 37. CSS PERFORMANCE

Inspect:

* giant CSS bundles
* duplicated styles
* unused styles
* expensive selectors
* excessive DOM nesting

Do not destroy the established design system.

Optimize without changing visual behavior.

---

# 38. STATIC ASSET CACHING

Configure production delivery to use appropriate caching for versioned static assets.

For example:

```text
JS
CSS
fonts
icons
images
```

Use long cache lifetimes for hashed/versioned assets.

Ensure new deployments correctly invalidate changed assets.

---

# 39. HTTP COMPRESSION

Production server/infrastructure should support:

```text
Brotli
gzip
HTTP/2 or HTTP/3 where available
```

Prefer Brotli for compatible clients.

Measure actual transfer sizes.

---

# 40. API CACHE HEADERS

Where appropriate, use HTTP caching for safe public/static resources.

Be careful with authenticated financial/admin data.

Do not accidentally cache sensitive responses publicly.

Private user-specific data must remain properly protected.

---

# 41. PWA / APP-LIKE EXPERIENCE

Evaluate adding PWA capabilities if compatible with the existing application.

Potentially implement:

```text
Web App Manifest
Service Worker
Installability
Standalone display
Controlled static asset caching
```

The goal is:

```text
Website
   ↓
Add to Home Screen
   ↓
App icon
   ↓
Standalone application-like experience
```

But do NOT blindly cache sensitive financial/API responses.

Use a conservative caching strategy.

Safe candidates are generally:

* static application shell
* versioned assets
* icons
* fonts
* non-sensitive static resources

Treat authenticated API data carefully.

---

# 42. OFFLINE EXPERIENCE

The application can provide limited offline resilience.

When offline:

```text
Previously loaded safe content
        ↓
remain visible where appropriate
        ↓
"Offline — showing last updated data"
```

But never pretend that server-required operations succeeded.

These must require connectivity:

```text
financial transactions
balance generation
credential generation
account changes
permissions
```

Do not create a fake offline transaction queue unless the backend architecture explicitly supports safe synchronization.

---

# 43. NETWORK-AWARE UX

Handle slow networks gracefully.

When network is slow:

```text
show shell
show skeleton
show cached data
continue loading
```

Do not freeze the interface.

When offline:

```text
show clear offline state
```

When reconnecting:

```text
refresh appropriate data
```

Avoid refreshing everything unnecessarily.

---

# 44. DATA FRESHNESS STRATEGY

Define different freshness rules.

For example:

```text
Static configuration
→ long cache

Packages
→ moderate cache

Centers
→ moderate cache

Agents
→ moderate cache

Dashboard metrics
→ shorter cache

Transactions
→ short cache / refresh appropriately

Financial details
→ authoritative fetch when required

Notifications
→ refresh/poll according to backend support
```

Do not use one global cache duration for everything.

Choose based on business importance and actual application behavior.

---

# 45. PREFETCH USER'S MOST LIKELY ACTIONS

For Admin:

```text
Dashboard
   ↓
Centers
Agents
Transactions
```

For Super Admin:

```text
Dashboard
   ↓
Centers
Admins
Agents
Transactions
```

Prefetch only when it is likely to help and bandwidth is sufficient.

Do not waste mobile bandwidth.

---

# 46. PAGE TRANSITION EXPERIENCE

When navigation occurs:

```text
tap page
   ↓
instant route transition
   ↓
cached content if available
   ↓
skeleton for missing data
   ↓
fresh content
```

Avoid:

```text
tap
 ↓
white screen
 ↓
spinner for 2 seconds
 ↓
page
```

---

# 47. BACKGROUND REFRESH

For frequently viewed information, refresh in the background.

Example:

```text
Dashboard opens
   ↓
cached dashboard appears
   ↓
background refresh
   ↓
new metrics
```

Do not interrupt the user's interaction.

If values changed:

```text
smoothly update
```

---

# 48. VISUAL STABILITY

Avoid layout shifts.

Reserve space for:

* charts
* images
* cards
* tables
* loading states

A skeleton should have approximately the same dimensions as the final component.

Goal:

```text
content loads
        ↓
content replaces skeleton
        ↓
layout remains stable
```

not:

```text
small skeleton
 ↓
huge content appears
 ↓
everything moves
```

---

# 49. MOBILE TOUCH PERFORMANCE

Ensure:

* buttons respond immediately
* touch targets are sufficiently large
* no accidental double taps
* dialogs animate smoothly
* scrolling remains smooth
* tables don't create horizontal scrolling
* large lists don't lock the browser

Avoid heavy JavaScript during scrolling.

---

# 50. DON'T BLOCK THE MAIN THREAD

Identify expensive work happening in the browser.

Move large calculations to the backend where appropriate.

Do not perform:

```text
20,000 transaction calculations
```

on the main UI thread just to create a dashboard chart.

Prefer backend aggregation.

---

# 51. MONITOR PERFORMANCE

Add a practical performance measurement strategy.

Measure:

```text
TTFB
FCP
LCP
INP
CLS
bundle size
API latency
request count
request payload size
time to dashboard usable
```

Also inspect:

```text
slowest API endpoint
slowest page
largest JS chunk
largest asset
largest API response
```

Create a baseline before major optimization.

Then compare after optimization.

---

# 52. USE BROWSER PERFORMANCE TOOLS

Use browser developer tools to inspect:

### Network

* request count
* request waterfall
* response size
* latency
* duplicated requests

### Performance

* long tasks
* rendering
* scripting
* layout
* paint

### Coverage

* unused JavaScript
* unused CSS

### Lighthouse/PageSpeed

Use where useful.

Do not optimize only for a Lighthouse score.

Optimize actual user experience.

---

# 53. PRODUCTION BUILD TEST

Always test the production build.

Development mode can behave very differently.

Run:

```text
production build
production server
```

and measure there.

Do not claim the application is fast based only on development mode.

---

# 54. TEST ON REALISTIC MOBILE CONDITIONS

Test with:

```text
desktop
mid-range Android
lower-powered Android
mobile Chrome
mobile Firefox where relevant
slow network
high latency
```

Test:

```text
cold start
warm start
first visit
second visit
navigation
search
pagination
dashboard
large lists
file generation
error conditions
```

---

# 55. DO NOT BREAK BUSINESS LOGIC

During performance optimization, preserve:

* authentication
* authorization
* role hierarchy
* financial logic
* package logic
* transaction logic
* encryption
* credential generation
* file generation
* audit behavior
* backend validation

Performance improvements must not bypass security or correctness.

---

# 56. DO NOT INVENT BACKEND ENDPOINTS

If an optimization requires an endpoint that does not exist:

Do not silently invent it.

Document:

```text
Required backend improvement:
GET /...
Purpose:
...
Expected response:
...
Performance reason:
...
```

Then continue with frontend optimizations that can be safely implemented using existing APIs.

---

# 57. PERFORMANCE PRIORITY ORDER

Prioritize optimizations in this order:

## 🔴 Priority 1

API/backend latency.

## 🔴 Priority 2

Stop loading unnecessary data.

## 🔴 Priority 3

Server-side pagination.

## 🔴 Priority 4

Caching and request deduplication.

## 🔴 Priority 5

Fast app shell + skeleton UI.

## 🔴 Priority 6

Independent dashboard loading.

## 🟠 Priority 7

Route-level code splitting.

## 🟠 Priority 8

API compression and payload reduction.

## 🟠 Priority 9

Prefetch likely next pages.

## 🟠 Priority 10

React rendering optimization.

## 🟡 Priority 11

Image optimization.

## 🟡 Priority 12

Fine-grained CSS optimization.

Do not spend hours optimizing tiny React functions while the API is taking several seconds.

---

# 58. REQUIRED PERFORMANCE ARCHITECTURE

Aim for this architecture:

```text
                     USER
                       │
                       ▼
                React App Shell
                       │
          ┌────────────┴────────────┐
          │                         │
      Route Layer             Query Cache
          │                         │
          │                 ┌───────┴───────┐
          │                 │               │
          ▼              Cached Data     Fresh API
      Page UI                 │               │
          │                   └───────┬───────┘
          │                           ▼
          └──────────────────── Smooth Update
                                      │
                                      ▼
                                    API
                                      │
                           ┌──────────┴──────────┐
                           ▼                     ▼
                       Database             File Services
```

---

# 59. TARGET USER EXPERIENCE

The final experience should feel like:

```text
OPEN APP
   ↓
App shell immediately visible
   ↓
Cached information appears
   ↓
Skeletons only where necessary
   ↓
Fresh API data arrives
   ↓
Cards update smoothly
   ↓
User taps Centers
   ↓
Centers page appears immediately
   ↓
Fresh data updates in background
   ↓
User taps an Agent
   ↓
Agent detail appears smoothly
```

The user should almost never experience:

```text
blank screen
+
long spinner
+
whole-page reload
+
repeated API requests
+
layout jumping
```

---

# 60. FINAL DELIVERABLE

After implementation, provide a performance report containing:

```text
1. Performance problems found
2. Changes implemented
3. API optimizations
4. Caching strategy
5. Bundle optimizations
6. Route/code splitting
7. Dashboard loading improvements
8. Mobile improvements
9. PWA changes if implemented
10. Backend changes required
11. Before/after measurements
12. Remaining bottlenecks
```

Include measurable information where possible:

```text
Initial JS:
Before → X KB
After  → X KB

Dashboard requests:
Before → X
After  → X

Largest API response:
Before → X KB
After  → X KB

Dashboard usable:
Before → X seconds
After  → X seconds
```

Do not fabricate measurements.

If something was not measured, explicitly say:

```text
Not measured
```

---

# 61. DEFINITION OF DONE

Performance optimization is complete only when:

* app shell renders quickly
* mobile startup is optimized
* dashboard does not wait for unnecessary data
* large datasets are paginated
* API requests are deduplicated
* server state is appropriately cached
* background refresh works where appropriate
* navigation is smooth
* likely next pages can be prefetched where beneficial
* heavy routes are lazy-loaded
* dashboard sections load independently
* skeleton states exist
* empty states exist
* error states exist
* duplicate mutations are prevented
* financial operations remain backend-authoritative
* no sensitive data is improperly cached
* no secrets are exposed
* API payloads are not unnecessarily large
* backend bottlenecks have been identified
* database/query bottlenecks have been investigated where possible
* production bundle is optimized
* static assets are appropriately cached/compressed
* mobile performance has been tested
* slow network behavior has been tested
* offline behavior is safe
* accessibility remains intact
* existing UI/design remains intact
* existing RBAC remains intact
* business logic remains intact
* production build succeeds
* typecheck passes
* lint passes
* tests pass where available

---

# FINAL INSTRUCTION

Do not perform a superficial "optimization pass."

Treat this as a real **performance engineering project**.

First measure and identify bottlenecks.

Then optimize systematically.

The most important goal is not achieving an arbitrary benchmark score.

The goal is:

> **Make the Bingo Management web application feel extremely fast, smooth, responsive, and native-app-like on real mobile devices and real-world networks while preserving the existing design, functionality, security, authorization, and financial correctness.**

Start by auditing the current implementation and producing a concise performance baseline. Then implement the highest-impact improvements first.
