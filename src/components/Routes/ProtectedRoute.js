import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "../../services/API";
import { getCurrentUser } from "../../redux/features/auth/authActions";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  // Fetch the current user from API
  const getUser = async () => {
    try {
      // Update the endpoint to remove the extra '/api/v1' from the URL
      const { data } = await API.get("/auth/current-user");
      if (data?.success) {
        dispatch(getCurrentUser(data));
      } else {
        // If no user data is found, clear the token and redirect to login
        localStorage.clear();
        window.location.href = "/login";  // Redirect to login
      }
    } catch (error) {
      localStorage.clear();
      console.log(error);
      window.location.href = "/login";  // Redirect to login if error occurs
    }
  };
  

  useEffect(() => {
    getUser();
  }, []); // Empty dependency array ensures getUser() runs only once when component mounts

  if (localStorage.getItem("token")) {
    return children;  // If user is authenticated, render the protected component (children)
  } else {
    return <Navigate to="/login" />;  // Redirect to login if no token found in localStorage
  }
};

export default ProtectedRoute;
