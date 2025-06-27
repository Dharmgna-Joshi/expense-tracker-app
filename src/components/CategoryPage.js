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
} from "firebase/firestore";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("expense");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState("expense");

  const user = auth.currentUser;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(data);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);


  const handleAddCategory = async () => {
    if (!newCategory.trim() || !user) return;

    await addDoc(collection(db, "users", user.uid, "categories"), {
      name: newCategory,
      type: newType,
    });

    setNewCategory("");
    setNewType("expense");
  };

  const handleDeleteCategory = async (id) => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "categories", id));
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditedName(category.name);
    setEditedType(category.type);
  };

  const handleUpdateCategory = async () => {
    if (!editedName.trim() || !user) return;

    await updateDoc(doc(db, "users", user.uid, "categories", editingCategory.id), {
      name: editedName,
      type: editedType,
    });

    setEditingCategory(null);
    setEditedName("");
    setEditedType("expense");
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Manage Categories</h2>

      <div className="row g-2 align-items-end mb-4">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="col-md-2">
          <button onClick={handleAddCategory} className="btn btn-primary w-100">
            Add
          </button>
        </div>
      </div>

      <ul className="list-group">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {editingCategory?.id === cat.id ? (
              <div className="d-flex flex-wrap gap-2 w-100">
                <input
                  className="form-control me-2"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <select
                  className="form-select me-2"
                  value={editedType}
                  onChange={(e) => setEditedType(e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <button
                  onClick={handleUpdateCategory}
                  className="btn btn-success"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setEditedName("");
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>
                  {cat.name}{" "}
                  <span className="badge bg-secondary">{cat.type}</span>
                </span>
                <div>
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="btn btn-warning btn-sm me-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
