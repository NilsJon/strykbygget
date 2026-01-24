# Ticket Viewing & Submission Tracking Feature

## Overview
Added functionality to prevent duplicate submissions and allow users to view their own submitted tickets.

## Changes Made

### 1. API Changes (`app/api/rooms/[roomId]/route.ts`)
- **Accepts `clientId` query parameter** to identify the current user
- **Returns `isYours` flag** on each ticket to indicate ownership
- Uses hashed clientId for privacy (SHA-256)

**Usage:**
```
GET /api/rooms/{roomId}?clientId={clientId}
```

### 2. Type Updates (`lib/types.ts`)
- Added `isYours?: boolean` field to `Ticket` interface
- Marks which ticket belongs to the current user

### 3. Room Page Updates (`app/room/[roomId]/page.tsx`)
- Passes `clientId` when fetching room data
- Propagates `isYours` flag to ticket objects

### 4. Ticket Form Updates (`components/ticket-form.tsx`)
**Before submission:**
- Shows full form for entering picks

**After submission:**
- Hides the form completely
- Shows a confirmation card with:
  - ✓ Checkmark icon
  - "Kupong inskickad" heading
  - User's name, combinations, and cost
  - Message directing to "Inskickade kuponger" list

### 5. Submitted Tickets Updates (`components/submitted-tickets.tsx`)

**Visual Indicators:**
- Your ticket has a **highlighted background** (primary/10 color)
- Shows **(Du)** tag next to your name
- Slightly stronger border color for your ticket

**View Button:**
- Only appears on **your own ticket**
- Eye icon + "Visa" text
- Opens a modal dialog

**Ticket Viewer Dialog:**
- Shows complete ticket details:
  - Name, rader (rows), cost
  - All matches with selected outcomes (1/X/2)
  - Visual highlighting for selected outcomes
  - Same styling as final result view

### 6. Room View Updates (`components/room-view.tsx`)
- Passes `matches` prop to `SubmittedTickets` for the viewer dialog

## User Experience Flow

### First Visit
1. User enters room
2. Sees ticket submission form
3. Fills out and submits ticket
4. Form disappears, replaced with confirmation

### After Submission
1. Form shows "Kupong inskickad" card instead
2. User's ticket highlighted in the submitted list
3. "Visa" button appears next to user's name
4. Click "Visa" → modal opens showing full ticket details

### Viewing Your Ticket
- Click the "Visa" button next to your name
- Modal dialog displays:
  - Summary stats at top
  - Full match-by-match breakdown
  - Visual outcome indicators (1/X/2)
  - Close by clicking outside or X button

## Security Notes

- Uses localStorage for client tracking
- Client IDs are hashed (SHA-256) before storage
- Not cryptographically secure (can be bypassed)
- Sufficient for preventing accidental duplicates
- Same person can submit from different browsers/devices

## Technical Details

**Duplicate Prevention:**
- Client ID stored in localStorage (`stryktipset-client-id`)
- ID persists across page reloads
- Server checks hash before accepting tickets
- Returns 409 error if duplicate detected

**Ticket Ownership:**
- Determined by comparing `clientIdHash`
- Checked on every room fetch
- Only your ticket gets `isYours: true`
- UI components use this flag for conditional rendering

## Testing

Build verification:
```bash
npm run build
```

All features compile successfully with no errors.
