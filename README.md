# VBARMS — Vehicle Breakdown Assistance and Response Management System

React + Firebase implementation for the CSCD602 individual project exam.
The codebase is aligned to the consolidated project documentation (CSCD602
exam submission).

## What's implemented (Must-have scope, per the documentation)

- Driver & Provider registration/login (Firebase Auth, **email/password only**)
- Report breakdown (type + text location + description), one active request
  per driver (BR-01)
- Driver views providers filtered by service type and chooses one to assign
  (FR-05 / FR-06)
- Provider unavailable-while-active-job rule enforced on assignment (BR-02)
- Full status workflow: Reported → Assigned → Accepted → In Progress →
  Completed, plus Cancelled — with transition validation
- Provider accept/reject (FR-08), status updates (FR-09), "only assigned
  provider can complete" (BR-04)
- Driver cancel, only before Accepted (BR-05 / FR-11)
- History view for both roles (FR-12)
- Firestore security rules for owner/role-scoped access
- Responsive UI (Tailwind), input validation, error handling throughout

**Not implemented (documented technical debt / future evolution — see the
project documentation Sections 12 and 16):** Admin/Dispatcher role, GPS/maps,
automated provider matching, push/SMS notifications, ratings, payments,
dedicated backend server (rule enforcement currently lives in client code +
Firestore rules, not Cloud Functions).

## Data model (Firestore collections — documentation Section 9.3)

```
users               { name, email, role }                    (role: driver | provider)
drivers             { userId, phone }
providers           { userId, phone, serviceType, availabilityStatus }
breakdownRequests   { driverId, breakdownType, description, location, status, createdAt }
assignments         { requestId, providerId, assignedAt, acceptedAt, completedAt }
```

## Local setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication → Email/Password** sign-in method
3. Create a **Firestore Database** (start in production mode)
4. Deploy the security rules in this repo:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at this project, keep firestore.rules
   firebase deploy --only firestore:rules
   ```
5. Copy `.env.example` to `.env` and fill in your Firebase web app config
   (Project Settings → General → Your apps → SDK setup and config)
6. Install and run:
   ```
   npm install
   npm run dev
   ```

## Deploying to Vercel

```
npm install -g vercel
vercel
```

## Project structure

```
src/
  firebase.js              Firebase app/auth/firestore initialisation
  lib/businessRules.js     Pure functions for BR-01..05 and status transitions
  lib/firestore.js         All Firestore reads/writes (single source of truth
                            for how business rules are applied to data)
  lib/matching.js          FR-05 provider filtering by serviceType + ranking
  contexts/AuthContext.jsx Current user + role, available app-wide
  components/              Shared UI: NavBar, StatusTimeline, forms, cards
  pages/                   Login, Register, DriverDashboard, ProviderDashboard,
                            History
firestore.rules            Server-side authorisation rules
```

## Manual test checklist (maps to Testing Report in the project documentation)

- [ ] Driver cannot submit a 2nd report while one is active
- [ ] Assigning a provider already on an active job is blocked
- [ ] Provider cannot mark Completed unless status is In Progress
- [ ] Non-assigned provider cannot update someone else's request
- [ ] Driver cannot cancel once status is Accepted or later
- [ ] Full happy path: report → assign → accept → in progress → completed →
      appears in both users' history