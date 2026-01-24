# Stryktipset Pool - Setup Guide

## What Was Done

The app has been successfully wired to use Firebase Firestore as the backend. All existing UI components remain unchanged - only the data layer was adapted to work with Firebase.

### Changes Made

#### 1. Backend Infrastructure

**Firebase Admin SDK Setup** (`lib/firebaseAdmin.ts`)
- Initializes Firebase Admin SDK for server-side operations
- Uses service account credentials from environment variables
- Provides database connection for API routes

**Business Logic** (`lib/tipsLogic.ts`)
- Client ID hashing for tracking unique submissions
- Ticket validation logic
- Combination calculation for Firestore format

**Client Utilities** (`lib/utils.ts`)
- Added `getClientId()` function to generate stable browser identifiers
- Used for enforcing one-submission-per-browser rule

#### 2. API Routes

**POST /api/rooms/create**
- Creates new betting rooms in Firestore
- Converts UI format (teamA/teamB) to Firestore format (home/away)
- Returns room ID and data

**GET /api/rooms/[roomId]**
- Fetches room data with all submitted tickets
- Used by the dynamic room page

**POST /api/rooms/[roomId]/submit**
- Submits tickets using Firestore transactions
- Enforces business rules:
  - One submission per browser (via clientIdHash)
  - Cost cannot exceed remaining budget
  - All matches must have selections
- Updates remainingBudget atomically

#### 3. Frontend Updates

**Dynamic Room Page** (`app/room/[roomId]/page.tsx`)
- New page for viewing rooms via shareable links
- Fetches data from API and converts to UI format
- Auto-refreshes every 5 seconds for live updates

**CreateRoomForm** (`components/create-room-form.tsx`)
- Calls `/api/rooms/create` instead of context
- Shows loading/error states
- Navigates to room page on success

**TicketForm** (`components/ticket-form.tsx`)
- Calls `/api/rooms/[roomId]/submit` instead of context
- Converts UI selections to Firestore format
- Shows success/error messages
- Reloads page after successful submission

**RoomView** (`components/room-view.tsx`)
- Removed dependency on betting context
- Works directly with props from room page

**Home Page** (`app/page.tsx`)
- Updated to navigate to `/room/[roomId]` after room creation

#### 4. Data Format Conversion

The app handles two different data formats:

**UI Format (existing)**
```typescript
matches: [{ id: "match-0", teamA: "Home", teamB: "Away" }]
selections: [{ matchId: "match-0", outcomes: ["1", "X"] }]
```

**Firestore Format (new)**
```typescript
matches: [{ home: "Home", away: "Away" }]
selections: [["1", "X"], ["2"], ...]  // Array per match
```

Conversion happens at the API boundary - UI code unchanged.

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in production mode
   - Choose a location

4. Get Service Account Key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

### 2. Environment Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your service account key:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```

   **Important**: Paste the entire JSON content as a single-line string.

### 3. Run the App

```bash
# Install dependencies (already done)
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000`

### 4. Test the Flow

1. **Create a Room**
   - Fill in room name, budget, price per combo
   - Add matches (home vs away teams)
   - Click "Launch the money machine"
   - You'll be redirected to the room page

2. **Share the Room**
   - Copy the shareable link
   - Open in another browser/incognito window

3. **Submit Tickets**
   - Enter player name
   - Select outcomes for each match (1, X, or 2)
   - See cost calculation
   - Submit ticket
   - Page refreshes showing updated budget and tickets

4. **Verify in Firestore**
   - Go to Firebase Console > Firestore
   - See `rooms/{roomId}` document
   - See `rooms/{roomId}/tickets/{ticketId}` documents

## Firestore Structure

```
rooms/
  {roomId}/
    title: "Friday Night Tipset"
    targetCost: 8
    status: "open"
    createdAt: timestamp
    matches: [
      { home: "Arsenal", away: "Chelsea" },
      { home: "Liverpool", away: "Man City" }
    ]

    tickets/
      {ticketId}/
        playerName: "John"
        clientIdHash: "sha256..."
        selections: [
          { outcomes: ["1"] },
          { outcomes: ["X", "2"] }
        ]
        combinations: 2
        cost: 2
        createdAt: timestamp
```

**Note:** Firestore doesn't support nested arrays, so selections are stored as an array of objects with an `outcomes` field, rather than a direct nested array.

## Business Rules Enforced

✅ One ticket per browser (via clientIdHash)
✅ Ticket cost cannot exceed remaining budget
✅ All matches must have at least one selection
✅ Budget updates are atomic (using Firestore transactions)
✅ Invalid selections are rejected

## Next Steps (Optional)

- Add room status finalization
- Add proper error boundaries
- Add loading skeletons
- Replace page reload with optimistic updates
- Add Firebase Security Rules
- Add analytics/monitoring
- Add tests

## Security Note

The current setup uses Firebase Admin SDK on the server side, which is secure. However, you should add Firestore Security Rules to prevent direct client access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all client access - use API routes only
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Apply these rules in Firebase Console > Firestore > Rules.
