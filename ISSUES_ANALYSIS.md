# Finance Tracker Issues Analysis

## 1. Reconciliation Page

### Issue 1.i: Account dropdown empty
**Location:** `/src/pages/Reconciliation.jsx` line 171-173

**Analysis:**
```javascript
{accounts.map(acc => (
    <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</SelectItem>
))}
```

**Root Cause:** The `accounts` array is empty. This happens because:
- `Account.filter({ is_active: true })` is called on line 36-38
- If no accounts exist or all accounts have `is_active: false`, the dropdown will be empty

**Solution:**
1. Check if user has created any accounts in the Accounts page
2. Verify accounts have `is_active: true` in the database
3. Try removing the `is_active: true` filter temporarily to see all accounts

### Issue 1.ii: Reconciliation logic verification
**Analysis:** The reconciliation logic appears correct:
- Line 86-108: Calculates beginning balance, cleared balance, and difference
- Line 122-147: Updates transactions and account on finish
- Uses proper transaction type handling (expense/income/transfer)

**Potential Issues:**
- Line 92-100: Transfer logic may not handle all currency scenarios properly
- Consider testing with simple income/expense transactions first before transfers

---

## 2. Goals Page

### Issue 2: Savings account dropdown empty
**Location:** `/src/components/goals/GoalForm.jsx` line 86

**Analysis:**
```javascript
{accounts.filter(a => a.type === 'savings').map(account => (
    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
))}
```

**Root Cause:** Filter looks for `type === 'savings'` but:
- User may not have any accounts with type='savings'
- Account types might be: 'checking', 'cash', 'investment', 'credit_card', 'loan'
- 'savings' type might not exist in the database

**Solution:**
1. Check what account types exist in Accounts page
2. Either create a savings account OR
3. Change filter to show all non-debt accounts:
```javascript
{accounts.filter(a => a.type !== 'loan' && a.type !== 'credit_card').map(account => (
```

---

## 3. Debt Payoff Page

### Issue 3.i: Shows €0 total debt (incorrect)
### Issue 3.ii: No option to create debt payoff planner

**Status:** Need to locate DebtPayoff.jsx file to analyze

**Expected behavior:**
- Should calculate total from all accounts where `type === 'loan' OR type === 'credit_card'`
- Should provide UI to create payoff plans

**Action Required:** Please confirm:
1. Do you have any accounts with type='loan' or type='credit_card'?
2. What are the current balances of these accounts?
3. Is there a DebtPayoff or DebtPayoffPlanner component?

---

## 4. Insights Page

### Issue 4.i: Alert tab shows "no alert was saved"
**Status:** Need to locate Insights.jsx to analyze alert functionality

### Issue 4.ii: Add "Historical Data" tab
**Requirements:**
- Date range selector (from MM/YYYY to MM/YYYY)
- Show trends for:
  - Income
  - Expense
  - Savings
  - Net Worth
- Display as line chart or similar visualization

**Implementation Notes:**
- Can reuse MonthlyTrendChart component from Dashboard
- Need to create HistoricalDataTab component
- Fetch transactions for selected date range
- Calculate metrics by month

---

## 5. Forecast Page

### Issue 5: Verify forecast logic is working
**Status:** Need to locate Forecast.jsx file to analyze

**Expected functionality:**
- Project future income/expenses based on recurring transactions
- Show projected account balances
- May use historical trends for predictions

---

## 6. Settings Page

### Issue 6.i: Currency tab - "Refresh rates" no feedback
**Analysis:** Button likely works but needs visual feedback

**Solution:** Add loading state and success message:
```javascript
const [isRefreshing, setIsRefreshing] = useState(false);
const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
    toast.success("Exchange rates updated!");
};
<Button onClick={handleRefresh} disabled={isRefreshing}>
    {isRefreshing ? "Refreshing..." : "Refresh Rates"}
</Button>
```

### Issue 6.ii: Goals tab - What happens after setting income/savings goals?
**Status:** Need to see Settings Goals tab implementation

**Expected behavior:**
- Should store goals in user preferences
- Dashboard or Insights page should compare actual vs goal
- May show progress indicators or warnings

### Issue 6.iii: Default tab - Account dropdown empty
**Same root cause as Reconciliation:**
- Accounts array is empty or not being passed correctly
- Check if Account.filter() is being called
- Verify accounts exist in database

---

## Common Patterns Observed

**Empty Dropdowns:** Multiple pages have empty account dropdowns because:
1. No accounts created yet - User needs to create accounts first
2. Accounts not loading - Check API calls and response
3. Filters too restrictive - e.g., `type === 'savings'` when no savings accounts exist

**Recommended First Steps:**
1. Go to Accounts page and verify accounts exist
2. Check account types and balances
3. Ensure at least one account of each type (checking, savings, loan) for testing
4. Check browser console for any API errors when loading pages

---

## Files That Need Review

Please provide these files so I can analyze the remaining issues:
- `/src/pages/DebtPayoff.jsx` or `/src/pages/DebtPayoffPlanner.jsx`
- `/src/pages/Insights.jsx`
- `/src/pages/Forecast.jsx`
- `/src/pages/Settings.jsx` or `/src/components/settings/*`
