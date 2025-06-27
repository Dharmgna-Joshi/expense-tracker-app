import React, { useEffect, useState, useContext, createContext } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CategoryContext = createContext([]);

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for user login/logout
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribeAuth(); // cleanup
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(cats);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  );
};
