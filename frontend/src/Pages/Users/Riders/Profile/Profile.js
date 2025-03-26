"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token
        if (!token) {
          setError("Unauthorized. Please log in.");
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
          withCredentials: true,
        });

        setUser(response.data.user);
      } catch (err) {
        setError("You are not authenticated or an error occurred.");
        console.error("Error fetching user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) return <Navigate to="/login" replace />;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone Number:</strong> {user?.phone_number}</p>
        <p><strong>Gender:</strong> {user?.gender}</p>
        <p><strong>Date of Birth:</strong> {new Date(user?.dob).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Profile;
