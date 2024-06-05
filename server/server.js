const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let userBudgets = {
  monthly: 0,
  weekly: 0,
  daily: 0,
  spendDays: [],
};

let expenses = [];

app.post('/budget', (req, res) => {
  const { monthly, weekly, daily } = req.body;
  userBudgets = { ...userBudgets, monthly, weekly, daily };
  res.send('Budgets updated');
});

app.post('/spend-days', (req, res) => {
  const { spendDays } = req.body;
  userBudgets.spendDays = spendDays;
  res.send('Spend days updated');
});

app.post('/expense', (req, res) => {
  const { expense, category } = req.body;
  expenses.push({ amount: expense, category });
  res.send('Expense added');
});

app.get('/suggestions', (req, res) => {
  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remainingWeeklyBudget = userBudgets.weekly - totalExpense;
  const remainingMonthlyBudget = userBudgets.monthly - totalExpense;

  // Calculate remaining spend days within the current week, starting from Monday
  const todayIndex = (new Date().getDay() + 6) % 7; // Adjust to make Monday = 0, Sunday = 6
  const spendDaysIndexes = userBudgets.spendDays.map(day => {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
  });

  const remainingSpendDays = spendDaysIndexes.filter(dayIndex => dayIndex >= todayIndex).length;

  const suggestedDailySpend = remainingSpendDays > 0 ? Math.max(remainingWeeklyBudget / remainingSpendDays, 0) : 0;

  // Check if the user is close to overspending
  const closeToOverspending = suggestedDailySpend < 250;
  const suggestedMonthlyBudget = closeToOverspending ? (250 * userBudgets.spendDays.length * 4) : null;
  const suggestedWeeklyBudget = closeToOverspending ? (250 * userBudgets.spendDays.length) : null;

  res.json({
    totalExpense,
    remainingWeeklyBudget,
    remainingMonthlyBudget,
    suggestedDailySpend,
    closeToOverspending,
    suggestedMonthlyBudget,
    suggestedWeeklyBudget,
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
