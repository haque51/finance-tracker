Implement Historical Account Balances with Month Picker
🎯 Feature Overview
Implement a month picker on the Accounts page to show historical account balances for any selected month, with historical currency conversion rates.

Key Requirements:
Month Picker: Add dropdown (like Dashboard) to select month/year
Default View: Current month showing current live balances
Historical View: Selected past month shows balances at month-end with historical exchange rates
Historical Rates Storage: Store exchange rates monthly (last day of each month) starting from user's registration date
Accurate Conversions: Non-EUR accounts show EUR equivalent using historical rates for selected month
🏗️ Implementation Plan (Approved by User)
Phase 1: Backend (30-40 min)
1. Database Schema
Create new table in Supabase:

CREATE TABLE exchange_rates_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  month DATE NOT NULL,  -- Store as "2025-01-31", "2025-02-28" (last day of month)
  rates JSONB NOT NULL, -- {"USD": 0.92, "BDT": 0.0084, "EUR": 1}
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)  -- One rate snapshot per user per month
);

CREATE INDEX idx_exchange_rates_user_month ON exchange_rates_history(user_id, month);
2. Backend API Endpoints
Location: lumina-finance-backend/src

Create new files:

src/controllers/exchangeRates.controller.js
src/services/exchangeRates.service.js
src/routes/exchangeRates.routes.js
Endpoints to implement:

GET /api/exchange-rates/historical/:month

Query params: month (format: "2025-01")
Returns: Historical rates for last day of that month
Example response: { "rates": {"USD": 0.92, "BDT": 0.0084, "EUR": 1}, "month": "2025-01-31" }
If no rates exist: Return earliest available rates or 404
POST /api/exchange-rates/snapshot

Body: { "month": "2025-01-31", "rates": {"USD": 0.92, "BDT": 0.0084, "EUR": 1} }
Saves current rates for specified month
Only allows saving for current or past months
Returns: Saved record
GET /api/exchange-rates/available-months

Returns: List of months with stored rates for current user
Used to show which months have historical data
3. Update API Config
File: src/config/api.config.js

Add new endpoints:

EXCHANGE_RATES_HISTORICAL: '/api/exchange-rates/historical/:month',
EXCHANGE_RATES_SNAPSHOT: '/api/exchange-rates/snapshot',
EXCHANGE_RATES_AVAILABLE: '/api/exchange-rates/available-months',
Phase 2: Frontend (60-80 min)
1. Create Exchange Rates Service
File: src/services/exchangeRatesService.js

class ExchangeRatesService {
  async getHistoricalRates(month) {
    // GET /api/exchange-rates/historical/:month
  }
  
  async saveRatesSnapshot(month, rates) {
    // POST /api/exchange-rates/snapshot
  }
  
  async getAvailableMonths() {
    // GET /api/exchange-rates/available-months
  }
}
2. Update Accounts Page
File: src/pages/Accounts.jsx

Add state:

const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
const [historicalRates, setHistoricalRates] = useState(null);
const [availableMonths, setAvailableMonths] = useState([]);
Add month picker UI (copy from Dashboard.jsx lines 526-543):

<Select value={selectedMonth} onValueChange={setSelectedMonth}>
  <SelectTrigger className="w-40">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);
      const value = format(date, 'yyyy-MM');
      return (
        <SelectItem key={value} value={value}>
          {format(date, 'MMMM yyyy')}
        </SelectItem>
      );
    })}
  </SelectContent>
</Select>
Calculate historical balances:

const calculateHistoricalBalance = (account, selectedMonth, transactions) => {
  const isCurrentMonth = selectedMonth === format(new Date(), 'yyyy-MM');
  
  if (isCurrentMonth) {
    return account.balance; // Current live balance
  }
  
  // Historical: Calculate balance at end of selected month
  const monthEnd = endOfMonth(new Date(selectedMonth));
  
  const relevantTransactions = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate <= monthEnd && (
      t.account_id === account.id ||
      t.from_account_id === account.id ||
      t.to_account_id === account.id
    );
  });
  
  // Calculate balance from opening balance + transactions
  let balance = account.opening_balance || 0;
  
  relevantTransactions.forEach(t => {
    if (t.type === 'income' && t.account_id === account.id) {
      balance += t.amount;
    } else if (t.type === 'expense' && t.account_id === account.id) {
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.from_account_id === account.id) balance -= t.amount;
      if (t.to_account_id === account.id) balance += t.amount;
    }
  });
  
  return balance;
};
Fetch historical rates when month changes:

useEffect(() => {
  const fetchHistoricalRatesForMonth = async () => {
    const isCurrentMonth = selectedMonth === format(new Date(), 'yyyy-MM');
    
    if (isCurrentMonth) {
      setHistoricalRates(exchangeRates); // Use live rates
    } else {
      try {
        const rates = await exchangeRatesService.getHistoricalRates(selectedMonth);
        setHistoricalRates(rates);
      } catch (error) {
        console.warn('No historical rates for', selectedMonth, '- using live rates');
        setHistoricalRates(exchangeRates); // Fallback
      }
    }
  };
  
  fetchHistoricalRatesForMonth();
}, [selectedMonth, exchangeRates]);
Pass historical data to AccountCard:

accountsWithHistoricalBalances.map(account => (
  <AccountCard
    key={account.id}
    account={{
      ...account,
      balance: calculateHistoricalBalance(account, selectedMonth, transactions),
      historicalMonth: selectedMonth
    }}
    exchangeRates={historicalRates || exchangeRates}
    onEdit={() => handleEdit(account)}
    onDelete={() => handleDelete(account.id)}
  />
))
3. Update AccountCard Component
File: src/components/accounts/AccountCard.jsx

Update to recalculate balance_eur using provided exchange rates:

const AccountCard = ({ account, exchangeRates, onEdit, onDelete }) => {
  // Recalculate balance_eur with provided rates
  const balanceEur = account.currency !== 'EUR' 
    ? (account.balance || 0) * (exchangeRates?.[account.currency] || 1)
    : account.balance;
  
  // Rest of component...
  
  {account.currency !== 'EUR' && (
    <p className="text-sm text-slate-500 currency">
      ≈ {formatCurrency(balanceEur, 'EUR', true, true)}
    </p>
  )}
}
📁 Current Codebase Context
Backend Repository
URL: https://github.com/haque51/lumina-finance-backend
Branch: dev
Local Clone: /home/user/lumina-finance-backend
Tech: Node.js, Express, Supabase (PostgreSQL)
Structure: Controllers → Services → Database
Frontend Repository
URL: https://github.com/haque51/finance-tracker
Branch: claude/design-update-011CUdgTgd5qWgfGApg7DLcF
Local Path: /home/user/finance-tracker
Tech: React, TailwindCSS, shadcn/ui components
Important Files to Modify
Backend:

Create: src/controllers/exchangeRates.controller.js
Create: src/services/exchangeRates.service.js
Create: src/routes/exchangeRates.routes.js
Modify: src/server.js (add new routes)
Frontend:

Create: src/services/exchangeRatesService.js
Modify: src/pages/Accounts.jsx
Modify: src/components/accounts/AccountCard.jsx
Modify: src/config/api.config.js
🔑 Key Technical Decisions
Month Format: Store as DATE (last day of month): "2025-01-31", "2025-02-28"
Current Month: Show live balances with real-time rates (don't calculate historical)
Missing Rates: Fall back to earliest available or current rates (with warning)
Balance Calculation: opening_balance + sum(transactions up to month_end)
Rate Storage: Per-user, starting from their registration date
Unique Constraint: One rate snapshot per user per month
🚨 Important Notes
Exchange Rate Fetching: Already implemented using InvokeLLM with internet access (real-time)
Loan Accounts: Use inverted math (fixed in recent commits) - don't break this
Transfer Transactions: Use from_account_id field (recently fixed) - maintain this
Month Picker Bug: Already fixed duplicate October issue (set date to 1st before changing month)
✅ Phase 3: Automation (Later - Not Urgent)
Can be done manually for now. Future task: GitHub Actions cron job to auto-save rates monthly.

🎯 Success Criteria
After implementation:

✅ Month picker visible on Accounts page
✅ Selecting current month shows live balances
✅ Selecting past month shows historical balances at month-end
✅ Non-EUR accounts show correct EUR conversion using historical rates
✅ Backend stores and retrieves historical rates
✅ User can manually save current rates via API
✅ Handles edge cases (missing rates, before registration)
📝 Testing Checklist
Create account with BDT currency
Add transactions in different months
Save current exchange rates snapshot
Change month picker to past month
Verify balance matches transactions up to that month
Verify EUR conversion uses historical rates
Test current month shows live data
Test month before any rates exist (fallback behavior)
