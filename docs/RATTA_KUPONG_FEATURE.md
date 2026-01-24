# Rätta Kupong Feature

## Overview
Added a "Rätta kupong" (Check/Grade tickets) feature that allows users to enter actual match results and see a leaderboard ranking all participants by accuracy.

## User Flow

### 1. Enter Results
1. Click **"Rätta kupong"** button at bottom of "Inskickade kuponger" card
2. Modal dialog opens: "Ange matchresultat"
3. For each match, select the actual result (1/X/2)
4. All matches must be filled before proceeding
5. Click **"Visa resultattabell"** to see rankings

### 2. View Leaderboard
- Automatically displays after submitting results
- Shows all participants ranked by accuracy
- Each entry shows:
  - Ranking position (medal icons for top 3)
  - Player name
  - Number of correct matches
  - Ticket details (rows, cost)

## Features

### Results Entry Dialog
- **Scrollable list** of all matches
- **Single-choice buttons** for 1/X/2 per match
- **Visual feedback** - selected outcome is highlighted
- **Validation** - submit button disabled until all results filled
- **Responsive** - fits screen with max-h-[85vh]

### Leaderboard Display
**Ranking:**
- Sorted by number of correct matches (highest to lowest)
- Top 3 positions get special treatment:
  - 🥇 1st place: Gold medal, yellow highlight
  - 🥈 2nd place: Silver medal, gray highlight
  - 🥉 3rd place: Bronze medal, orange highlight
  - 4th+: Number badge, neutral background

**Per Entry Shows:**
- Ranking position (medal or number)
- Player avatar icon
- Player name + "(Du)" tag if it's your ticket
- Ticket details (combinations, cost)
- **Large score display** showing correct count

**Styling:**
- First place: `bg-yellow-500/10 border-yellow-500/30`
- Second place: `bg-gray-400/10 border-gray-400/30`
- Third place: `bg-orange-600/10 border-orange-600/30`
- Other: Standard secondary background

### Scoring Logic
**How scores are calculated:**
```typescript
calculateScore(ticket: Ticket): number {
  let score = 0;
  ticket.selections.forEach((selection, index) => {
    const actualResult = results[index];
    // If the actual result is in the user's selected outcomes, +1 point
    if (selection.outcomes.includes(actualResult)) {
      score++;
    }
  });
  return score;
}
```

**Example:**
- Match 1: User picked [1, X], actual result = X → ✓ Correct (+1)
- Match 2: User picked [2], actual result = 1 → ✗ Wrong (0)
- Match 3: User picked [1, X, 2], actual result = 2 → ✓ Correct (+1)
- **Total score: 2 / 3**

### Edge Cases Handled
- **Ties:** Players with same score maintain submission order
- **Your ticket highlighted:** "(Du)" tag shows even in leaderboard
- **Empty results:** Can't submit until all matches filled
- **Multiple picks:** If user has multiple outcomes selected, ANY match counts as correct

## UI Components Used
- **Dialog** - Modal overlays for both forms
- **Button** - "Rätta kupong" and "Visa resultattabell"
- **Icons** - CheckSquare, Trophy, Medal
- **Scrollable content** - Both dialogs support long lists

## State Management
```typescript
const [showResultsForm, setShowResultsForm] = useState(false);
const [results, setResults] = useState<Outcome[]>([]);
const [showLeaderboard, setShowLeaderboard] = useState(false);
```

**Flow:**
1. Click "Rätta kupong" → `showResultsForm = true`
2. Fill results → Updates `results` array
3. Submit → `showResultsForm = false`, `showLeaderboard = true`
4. Close leaderboard → `showLeaderboard = false`

## Files Modified

**`components/submitted-tickets.tsx`**
- Added "Rätta kupong" button
- Added results entry dialog
- Added leaderboard dialog
- Implemented scoring logic
- Added state management for dialogs and results

## Technical Details

**Performance:**
- Scoring calculated on-demand when showing leaderboard
- Uses memoization pattern (computed from state)
- No unnecessary re-renders

**Accessibility:**
- Button states (disabled when incomplete)
- Clear visual feedback on selections
- Scrollable content for long lists

**Responsive:**
- Dialogs constrained to 85% viewport height
- Scrollable content areas
- Works on mobile and desktop

## Future Enhancements (Not Implemented)

Potential additions:
- Save results to database
- Show which specific matches each person got right/wrong
- Add percentage accuracy display
- Export leaderboard as image/PDF
- Historical results tracking
- Tie-breaker rules (by cost, by submission time, etc.)

## Testing

Build verification:
```bash
npm run build
```

All features compile successfully with no errors.
