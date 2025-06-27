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

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let incomeTotal = 0;
      let expenseTotal = 0;
      let expenseCategories = {};

      snapshot.forEach((doc) => {
        const { type, amount, category } = doc.data();
        if (type === "income") incomeTotal += amount;
        else if (type === "expense") {
          expenseTotal += amount;
          if (expenseCategories[category]) {
            expenseCategories[category] += amount;
          } else {
            expenseCategories[category] = amount;
          }
        }
      });

      setIncome(incomeTotal);
      setExpense(expenseTotal);
      setCategoryData(expenseCategories);
    });

    return () => unsubscribe();
  }, []);

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
        backgroundColor: [
          "#0d6efd",
          "#ffc107",
          "#fd7e14",
          "#20c997",
          "#6f42c1"
        ]
      }
    ]
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Dashboard Overview</h2>

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
