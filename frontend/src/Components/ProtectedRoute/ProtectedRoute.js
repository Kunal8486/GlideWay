import { Navigate, useLocation } from "react-router-dom"

const PrivateRoute = ({ children }) => {
  const location = useLocation()
  const token = localStorage.getItem("token")
  const isAuthenticated = Boolean(token) // Ensures a valid token check

  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />
}

export default PrivateRoute
