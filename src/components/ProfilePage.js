import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), form);
      setUserData(form);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      alert("Failed to update profile");
      console.error(error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert("Password reset email sent");
    } catch (error) {
      alert("Failed to send reset email");
      console.error(error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h3 className="mb-4">My Profile</h3>
      <div className="card p-4 shadow-sm" style={{ maxWidth: "500px" }}>
        {userData ? (
          <>
            {isEditing ? (
              <>
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <button className="btn btn-success me-2" onClick={handleSave}>Save</button>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Full Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Phone:</strong> {userData.phone || "Not Provided"}</p>

                <button className="btn btn-primary me-2" onClick={() => setIsEditing(true)}>Edit Info</button>
                <button className="btn btn-outline-danger" onClick={handlePasswordReset}>Reset Password</button>
              </>
            )}
          </>
        ) : (
          <p>No profile data found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
