import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  where,
  getDocs
} from "firebase/firestore";
import { useCategories } from "../context/CategoryContext";
import CreatableSelect from "react-select/creatable";

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");


  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");



  const user = auth.currentUser;
  const allCategories = useCategories();
  const categories = allCategories.filter(
    (cat) => cat.type?.toLowerCase().trim() === "income"
  );
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.name }));

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "transactions"),
      where("type", "==", "income"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncomes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async () => {
    if (!amount || !category || !user) return;

    const categoryName = category.label;
    const categoryRef = collection(db, "users", user.uid, "categories");

    const existing = categories.find((c) =>
      c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!existing) {
      await addDoc(categoryRef, {
        name: categoryName,
        type: "income",
      });
    }

    await addDoc(collection(db, "users", user.uid, "transactions"), {
      amount: parseFloat(amount),
      category: categoryName,
      type: "income",
      date: date || new Date().toISOString().split("T")[0], // save as YYYY-MM-DD
      notes: notes.trim(),
    });

    setAmount("");
    setCategory(null);
    setNotes("");
  };

  const filteredIncomes = incomes.filter((t) => {
  const incomeDate = new Date(t.date);
  const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, "0");
  const incomeYear = incomeDate.getFullYear().toString();

  return (
    (!filterMonth || incomeMonth === filterMonth) &&
    (!filterYear || incomeYear === filterYear)
  );
});

  const startEdit = (t) => {
  setEditingId(t.id);
  setEditAmount(t.amount);
  setEditCategory({ label: t.category, value: t.category });
  setEditNotes(t.notes || "");

  // ✅ Format to YYYY-MM-DD (for input type="date")
  const rawDate = typeof t.date === "string" ? t.date : "";
  const formatted = rawDate.includes("T")
    ? rawDate.split("T")[0]
    : rawDate; // already clean
  setEditDate(formatted);
};


  const handleUpdate = async () => {
    if (!editAmount || !editCategory || !user) return;

   await updateDoc(
      doc(db, "users", user.uid, "transactions", editingId),
      {
        amount: parseFloat(editAmount),
        category: editCategory.label,
        date: editDate, // 👈 store plain YYYY-MM-DD
        notes: editNotes.trim(),
      }
    );


    setEditingId(null);
    setEditAmount("");
    setEditCategory(null);
  };

  const handleDelete = async (id) => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Manage Income</h2>
      <div className="card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <CreatableSelect
              isClearable
              onChange={setCategory}
              options={categoryOptions}
              value={category}
              placeholder="Select or create category"
            />
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              placeholder="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-success w-100" onClick={handleAdd}>
              Add Income
            </button>
          </div>
        </div>

      </div>

      <h4>Income History</h4>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <select className="form-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {[...new Set(incomes.map((t) => new Date(t.date).getFullYear()))].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncomes.map((t) => (
            <tr key={t.id}>
              {editingId === t.id ? (
                <>
                  <td>
                  <input
                    type="number"
                    className="form-control"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </td>
                <td>
                  <CreatableSelect
                    isClearable
                    onChange={setEditCategory}
                    options={categoryOptions}
                    value={editCategory}
                />
                </td>
                <td>
                  <input
                    type="date"
                    className="form-control"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </td>
                <td>
                  <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>
                    Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </td>
                </>
              ) : (
                <>
                  <td>${t.amount.toFixed(2)}</td>
                  <td>
                    {typeof t.category === "string"
                      ? t.category
                      : t.category?.label || t.category?.value}
                  </td>
                  <td>{t.date}</td>
                  <td>{t.notes || ""}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => startEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomePage;
