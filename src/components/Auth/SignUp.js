import React, { useState } from 'react';
import { auth, db, googleProvider } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { email, password, firstName, lastName, phone } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        phone,
        email
      });

      navigate("/home");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMsg("An account with this email already exists.");
          break;
        case "auth/weak-password":
          setErrorMsg("Password should be at least 6 characters.");
          break;
        default:
          setErrorMsg("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          phone: user.phoneNumber || "",
          email: user.email
        });
      }

      navigate("/home");
    } catch (error) {
      setErrorMsg("Google signup failed. Please try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Sign Up</h3>

        {errorMsg && (
          <div className="alert alert-danger text-center py-2 mb-3" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <input className="form-control mb-3" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input className="form-control mb-3" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input className="form-control mb-3" type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          <input className="form-control mb-3" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="form-control mb-3" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="btn btn-success w-100 mb-2">Sign Up</button>
        </form>

        <button className="btn btn-outline-primary w-100 mb-3" onClick={handleGoogleSignup}>
          Sign up with Google
        </button>

        <p className="text-center mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
