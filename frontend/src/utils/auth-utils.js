// utils/auth-utils.js
export const isLoggedIn = () => {
    return !!localStorage.getItem("authToken"); // Returns true if token is present
  };
  