import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import IncomePage from "./components/IncomePage";
import ExpensePage from "./components/ExpensePage";
import CategoryPage from "./components/CategoryPage";
import HomePage from "./components/HomePage";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import ProfilePage from "./components/ProfilePage";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <Link className="navbar-brand fw-bold" to={user ? "/home" : "/login"}>Expense Tracker</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/home">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/income">Income</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/expenses">Expenses</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/categories">Categories</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-3" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </>
  );
}

export default App;
