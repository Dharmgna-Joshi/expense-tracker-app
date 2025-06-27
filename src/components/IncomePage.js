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
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState(null);

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
      date: new Date().toISOString(),
    });

    setAmount("");
    setCategory(null);
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditAmount(t.amount);
    setEditCategory({ label: t.category, value: t.category });
  };

  const handleUpdate = async () => {
    if (!editAmount || !editCategory || !user) return;

    await updateDoc(
      doc(db, "users", user.uid, "transactions", editingId),
      {
        amount: parseFloat(editAmount),
        category: editCategory.label,
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
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <CreatableSelect
              isClearable
              onChange={setCategory}
              options={categoryOptions}
              value={category}
              placeholder="Select or create category"
            />
          </div>
          <div className="col-md-4">
            <button className="btn btn-success w-100" onClick={handleAdd}>
              Add Income
            </button>
          </div>
        </div>
      </div>

      <h4>Income History</h4>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((t) => (
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
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
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
                  <td>{new Date(t.date).toLocaleDateString()}</td>
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
