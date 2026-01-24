# Final Ticket Generation Logic

## Problem
Previously, the final ticket generation used a simple union approach - combining all picks from all players per match. This resulted in over-budget tickets that didn't match the target cost.

**Example of the problem:**
- Player 1 picks "1" for match 1
- Player 2 picks "X2" for match 1
- Old result: "1X2" (3 picks, cost = 3× other matches)
- This quickly exceeded the target cost

## Solution
The new algorithm generates a final ticket that costs **exactly** the target cost (in SEK) while reflecting the group's votes.

### Algorithm

1. **Vote Counting**: Count how many times each outcome ("1", "X", "2") was picked for each match across all submitted tickets

2. **Ranking**: Rank outcomes per match by vote count (descending)

3. **Factorization**: Factorize `targetCost` into `2^a × 3^b`
   - This determines how many matches need 2 picks (a) and 3 picks (b)
   - All other matches get 1 pick (the top-voted option)

4. **Uncertainty Scoring**: Calculate which matches are most uncertain
   - `score2 = votes[top2] / votes[top1]` (higher = more people voted for 2nd option)
   - `score3 = votes[top3] / votes[top1]` (higher = more people voted for 3rd option)

5. **Match Assignment**:
   - Assign 3 picks to the `b` matches with highest `score3`
   - Assign 2 picks to the `a` matches with highest `score2` (that don't already have 3 picks)
   - All other matches get 1 pick (the majority vote)

6. **Output**: Build the final ticket using the top-voted outcomes for each match

### Cost Calculation
- Each match contributes a factor equal to its number of picks
- Total cost = product of all picks across matches
- Example: [1 pick, 2 picks, 1 pick, 1 pick] = 1 × 2 × 1 × 1 = 2 kr

### Valid Target Costs
The target cost must be expressible as `2^a × 3^b`:
- ✅ Valid: 1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 27, 32, 36, 48...
- ❌ Invalid: 5, 7, 10, 11, 13, 14, 15, 17, 19, 20...

## Implementation

### Files Modified

1. **`lib/tipsLogic.ts`**
   - Added `factorize()` - factorizes numbers into 2^a × 3^b
   - Added `countVotes()` - counts votes per outcome per match
   - Added `rankOutcomes()` - ranks outcomes by vote count
   - Added `calculateMatchScores()` - calculates uncertainty scores
   - Added `generateFinalTicket()` - main algorithm implementation

2. **`components/final-result.tsx`**
   - Replaced union-based ticket generation with `generateFinalTicket()`
   - Added cost validation and warning UI
   - Added explanatory text: "Vi väljer majoriteten per match och garderar de mest osäkra matcherna tills vi når målkostnaden."
   - Added debug logging to console
   - Shows exact cost validation with ✓ checkmark

### Verification
Run the verification script to test the algorithm:

```bash
npx tsx lib/verify-tipsLogic.ts
```

All test cases pass:
- ✅ Target cost = 1 (all single picks)
- ✅ Target cost = 2 (one 2-pick match)
- ✅ Target cost = 4 (two 2-pick matches)
- ✅ Target cost = 6 (one 2-pick + one 3-pick)
- ✅ Target cost = 12 (two 2-picks + one 3-pick)
- ✅ Invalid costs (e.g., 5) correctly return null

## User Experience

When viewing the final result:
1. The system shows a clear explanation in Swedish
2. Cost validation is displayed prominently
3. If cost doesn't match target, a warning is shown
4. Console logs provide debugging info for verification
5. Each match shows which outcomes were selected based on votes

## Example

Given:
- 4 matches
- Target cost: 6 kr
- Player 1 votes: [1X, X2, 12, 1]
- Player 2 votes: [X2, 1X, 2, 1X]

Result (6 = 2^1 × 3^1):
- Match 1: X (most uncertain for 3-pick) → X12 (3 picks)
- Match 2: X (most uncertain for 2-pick) → X1 (2 picks)
- Match 3: 2 (majority) → 2 (1 pick)
- Match 4: 1 (majority) → 1 (1 pick)
- **Total cost: 3 × 2 × 1 × 1 = 6 kr ✓**
