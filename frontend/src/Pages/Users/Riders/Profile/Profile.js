import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token); // Log the token for debugging

        if (!token) {
          console.error("No token found");
          setError("No authentication token found");
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rider-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        console.log("Response:", response.data); // Log full response

        // Check if user data exists in the response
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          console.error("No user data in response", response.data);
          setError("No user data found");
        }
      } catch (err) {
        console.error("Full error details:", err);
        
        // More detailed error handling
        if (err.response) {
          // The request was made and the server responded with a status code
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          
          if (err.response.status === 401) {
            setError("Unauthorized. Please log in again.");
            navigate("/login");
          } else {
            setError(`Error: ${err.response.data.message || 'Failed to fetch user profile'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error("No response received:", err.request);
          setError("No response from server. Please check your network connection.");
        } else {
          // Something happened in setting up the request
          console.error("Error setting up request:", err.message);
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name || 'N/A'}</p>
        <p><strong>Email:</strong> {user.email || 'N/A'}</p>
        <p><strong>Phone Number:</strong> {user.phone_number || 'N/A'}</p>
        <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  );
};

export default Profile;