import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  onSnapshot
} from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [categoryData, setCategoryData] = useState({});
  const [allTransactions, setAllTransactions] = useState([]);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map((doc) => doc.data());
      setAllTransactions(transactions);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let expenseCategories = {};

    const filtered = allTransactions.filter((t) => {
      const d = new Date(t.date);
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear().toString();
      return (
        (!filterMonth || filterMonth === month) &&
        (!filterYear || filterYear === year)
      );
    });

    filtered.forEach(({ type, amount, category }) => {
      if (type === "income") incomeTotal += amount;
      else if (type === "expense") {
        expenseTotal += amount;
        expenseCategories[category] = (expenseCategories[category] || 0) + amount;
      }
    });

    setIncome(incomeTotal);
    setExpense(expenseTotal);
    setCategoryData(expenseCategories);
  }, [allTransactions, filterMonth, filterYear]);

  // Generate consistent hex colors for each category
  const generateColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${((hash >> 16) & 0xff)
      .toString(16)
      .padStart(2, "0")}${((hash >> 8) & 0xff).toString(16).padStart(2, "0")}`;
    return color.slice(0, 7); // Ensure valid 6-digit hex
  };

  const categoryColors = Object.keys(categoryData).map((cat) =>
    generateColorFromString(cat)
  );

  const incomeExpenseChart = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ["#198754", "#dc3545"]
      }
    ]
  };

  const categoryChart = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: categoryColors
      }
    ]
  };

  const availableYears = [...new Set(allTransactions.map((t) => new Date(t.date).getFullYear()))];

  return (
    <div className="container py-5">
      <h2 className="mb-4">Dashboard Overview</h2>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5 className="text-center">Income vs Expense</h5>
            <Pie data={incomeExpenseChart} />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5 className="text-center">Expense Breakdown by Category</h5>
            <Pie data={categoryChart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
