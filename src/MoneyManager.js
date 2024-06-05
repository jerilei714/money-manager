import React, { useState, useEffect } from 'react';
import axios from 'axios';

const categories = ['Food', 'Transport', 'Entertainment', 'Other'];

const MoneyManager = () => {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [dailyExpense, setDailyExpense] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(categories[0]);
  const [spendDays, setSpendDays] = useState([]);
  const [suggestions, setSuggestions] = useState({});

  const handleExpenseChange = (e) => {
    setDailyExpense(e.target.value);
  };

  const handleAddExpense = () => {
    if (parseFloat(dailyExpense) < 0) {
      alert('Expense cannot be negative.');
      return;
    }
    setExpenses([...expenses, { amount: parseFloat(dailyExpense), category: expenseCategory }]);
    setDailyExpense('');
    axios.post('http://localhost:3000/expense', { expense: parseFloat(dailyExpense), category: expenseCategory })
      .then(() => fetchSuggestions())
      .catch(err => console.error(err));
  };

  const handleBudgetChange = () => {
    if (parseFloat(monthlyBudget) < 0 || parseFloat(weeklyBudget) < 0 || parseFloat(dailyBudget) < 0) {
      alert('Budgets cannot be negative.');
      return;
    }
    axios.post('http://localhost:3000/budget', {
      monthly: parseFloat(monthlyBudget),
      weekly: parseFloat(weeklyBudget),
      daily: parseFloat(dailyBudget),
    })
      .then(() => fetchSuggestions())
      .catch(err => console.error(err));
  };

  const handleSpendDaysChange = (e) => {
    const day = e.target.value;
    const updatedSpendDays = spendDays.includes(day)
      ? spendDays.filter(d => d !== day)
      : [...spendDays, day];

    setSpendDays(updatedSpendDays);

    axios.post('http://localhost:3000/spend-days', { spendDays: updatedSpendDays })
      .then(() => fetchSuggestions())
      .catch(err => console.error(err));
  };

  const fetchSuggestions = () => {
    axios.get('http://localhost:3000/suggestions')
      .then(response => setSuggestions(response.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSuggestions();
  }, [expenses, spendDays]);

  const calculateTotalExpense = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div>
      <h1>Money Manager</h1>
      <div>
        <label>Monthly Budget:</label>
        <input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} />
        <label>Weekly Budget:</label>
        <input type="number" value={weeklyBudget} onChange={(e) => setWeeklyBudget(e.target.value)} />
        <label>Daily Budget:</label>
        <input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
        <button onClick={handleBudgetChange}>Set Budgets</button>
      </div>
      <div>
        <label>Spend Days:</label>
        <div>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <label key={day}>
              <input
                type="checkbox"
                value={day}
                onChange={handleSpendDaysChange}
                checked={spendDays.includes(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label>Daily Expense:</label>
        <input type="number" value={dailyExpense} onChange={handleExpenseChange} />
        <label>Category:</label>
        <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>
      <div>
        <h2>Total Expense: {calculateTotalExpense()}</h2>
        <h2>Remaining Weekly Budget: {suggestions.remainingWeeklyBudget >= 0 ? suggestions.remainingWeeklyBudget : 0}</h2>
        <h2>Remaining Monthly Budget: {suggestions.remainingMonthlyBudget >= 0 ? suggestions.remainingMonthlyBudget : 0}</h2>
        <h2>Suggested Daily Spend: {suggestions.suggestedDailySpend >= 0 ? suggestions.suggestedDailySpend : 0}</h2>
        {suggestions.closeToOverspending && parseFloat(monthlyBudget) > 0 && parseFloat(weeklyBudget) > 0 && (
          <div>
            <p>You are close to overspending! Consider increasing your monthly budget to {suggestions.suggestedMonthlyBudget.toFixed(2)} or your weekly budget to {suggestions.suggestedWeeklyBudget.toFixed(2)}.</p>
            <p>If you don't want to increase your budget, consider not spending on specific days.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyManager;
