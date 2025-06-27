import React, { useState } from 'react';
import { auth, googleProvider, db } from '../../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMsg("No account found with this email.");
          break;
        case "auth/wrong-password":
          setErrorMsg("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          setErrorMsg("Invalid login credentials.");
          break;
        default:
          setErrorMsg("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email,
          phone: user.phoneNumber || ""
        });
      }

      navigate("/home");
    } catch (error) {
      setErrorMsg("Google login failed. Please try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Login</h3>

        {errorMsg && (
          <div className="alert alert-danger text-center py-2 mb-3" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success w-100 mb-2">
            Login
          </button>
        </form>

        <button
          className="btn btn-outline-primary w-100 mb-3"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </button>

        <p className="text-center mb-0">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
