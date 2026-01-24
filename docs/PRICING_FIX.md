# Pricing Logic Fix - Stryktipset Rules

## Summary

Updated the app to match Stryktipset pricing rules:
- **Price per row = 1 SEK** (fixed, no longer configurable)
- **Ticket cost = number of combinations** (no multiplier)
- **Rooms have a target cost** (not a budget pool)
- **Every ticket must cost exactly the target cost** (enforced server-side)

## Files Changed

### 1. **lib/types.ts**
**Changes:**
- `Room` interface: Removed `totalBudget` and `pricePerCombination`, added `targetCost`
- `calculateCost()`: Now takes only `combinations` parameter, returns `combinations` (cost = combinations)
- Removed `getRemainingBudget()` function

**Why:** Core data model needs to reflect target cost instead of budget pool.

---

### 2. **lib/tipsLogic.ts**
**Changes:**
- `validateTicket()`: Changed `remainingBudget` parameter to `targetCost`
- Validation now checks `cost === targetCost` (exact match) instead of `cost <= remainingBudget`
- Error message updated to show both actual and target cost

**Why:** Server-side validation must enforce exact cost matching.

---

### 3. **app/api/rooms/create/route.ts**
**Changes:**
- Request body expects `targetCost` instead of `totalBudget` and `pricePerCombination`
- Firestore document stores only `targetCost`
- Removed `remainingBudget` field

**Why:** API contract matches new data model.

---

### 4. **app/api/rooms/[roomId]/submit/route.ts**
**Changes:**
- Cost calculation: `const cost = combinations` (no price multiplier)
- Validation: `targetCost: roomData.targetCost` instead of `remainingBudget`
- Removed transaction update of `remainingBudget`

**Why:** Ticket submission validates against target cost, not budget consumption.

---

### 5. **app/api/rooms/[roomId]/route.ts**
**Changes:**
- Response returns `targetCost` instead of `totalBudget`, `remainingBudget`, and `pricePerCombination`

**Why:** API response matches new data model.

---

### 6. **components/create-room-form.tsx**
**Changes:**
- Removed state: `totalBudget`, `pricePerCombination`
- Added state: `targetCost` (default: 8)
- UI: Replaced two input fields (budget + price) with single "Target cost" field
- Added help text: "All tickets must cost exactly this amount. Cost = number of combinations."
- Success screen shows target cost instead of budget

**Why:** UI reflects simplified pricing model.

---

### 7. **components/ticket-form.tsx**
**Changes:**
- Removed `remainingBudget` prop
- Cost calculation: `calculateCost(combinations)` (no price multiplier)
- Validation: `costMatchesTarget = cost === room.targetCost`
- Submit disabled unless cost exactly matches target
- UI shows three values:
  - Combinations (calculated)
  - Your ticket cost (red if wrong, green if matches)
  - Target cost (always shown)
- Error message: "Adjust your picks! Cost must be exactly X kr (currently Y kr)."
- Success message: "Perfect! Your ticket matches the target cost. ✨"

**Why:** Frontend enforces and communicates exact cost matching requirement.

---

### 8. **components/room-view.tsx**
**Changes:**
- Removed `BudgetBar` component
- Removed `remainingBudget` calculation
- Header shows "Target: X kr" instead of budget info
- Description changed to "All tickets must cost exactly X kr"
- Removed conditional rendering based on budget depletion (form always shown)

**Why:** Budget concept no longer exists; target cost is the key constraint.

---

### 9. **app/room/[roomId]/page.tsx**
**Changes:**
- `FirestoreRoom` interface: Removed `totalBudget`, `remainingBudget`, `pricePerCombination`; added `targetCost`
- Data conversion: Map `targetCost` from Firestore to UI format

**Why:** Dynamic room page needs to handle new data structure.

---

### 10. **lib/betting-context.tsx**
**Changes:**
- Gutted implementation, now empty shell
- Kept for compatibility (avoid breaking layout.tsx)
- Added comment: "Legacy betting context - kept for compatibility but no longer used"

**Why:** All data operations now go through API routes; context is obsolete but kept to avoid removing provider from layout.

---

## Firestore Schema (Updated)

```
rooms/{roomId}
  title: string
  targetCost: number          // NEW: Required exact cost
  status: "open" | "finalized"
  createdAt: server timestamp
  matches: Array<{home, away}>

  tickets/{ticketId}
    playerName: string
    clientIdHash: string
    selections: Array<{outcomes: Array<"1"|"X"|"2">}>  // Firestore doesn't support nested arrays
    combinations: number
    cost: number              // Always equals combinations
    createdAt: server timestamp
```

**Key changes:**
- No `remainingBudget` tracking. Each ticket is independently validated against `targetCost`.
- `selections` stored as array of objects (not nested arrays) due to Firestore limitation.

---

## Business Rules (Now Enforced)

✅ **Fixed price:** 1 SEK per row (hardcoded)
✅ **Cost = combinations:** No price multiplier
✅ **Exact cost matching:** Ticket cost must equal room's target cost
✅ **Server-side validation:** API rejects tickets that don't match target cost
✅ **Client-side feedback:** UI shows real-time cost calculation and matching status
✅ **One ticket per browser:** Still enforced via clientIdHash

---

## Testing the Changes

1. **Create a room:**
   - Set target cost (e.g., 8 kr)
   - Add matches

2. **Submit a ticket:**
   - Make picks that result in cost < target → Form shows error, submit disabled
   - Adjust picks to match target exactly → Green message, submit enabled
   - Submit → Server validates cost === targetCost

3. **Try invalid submission:**
   - Attempt to submit with wrong cost → HTTP 400 with clear error message

---

## Migration Notes

**No database migration needed** - old rooms in Firestore will continue to exist but won't work with the new code. For a production migration, you would:

1. Add a migration script to convert existing rooms
2. Map `totalBudget` → `targetCost` (or set a sensible default)
3. Remove `remainingBudget` and `pricePerCombination` fields

For this prototype, simply create new rooms using the updated UI.
