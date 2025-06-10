import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../services/API";  // Make sure to import the correct API instance
import { toast } from "react-toastify";

// Login
export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ role, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", { role, email, password });
      
      // Store token
      if (data.success) {
        alert(data.message);
        localStorage.setItem("token", data.token);
        window.location.replace("/");
      }
      
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Register
export const userRegister = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      role,
      email,
      password,
      phone,
      organisationName,
      address,
      hospitalName,
      website,
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await API.post("http://localhost:8080/api/v1/auth/register", {
        name,
        role,
        email,
        password,
        phone,
        organisationName,
        address,
        hospitalName,
        website,
      });
      
      if (data?.success) {
        alert("User Registered Successfully");
        window.location.replace("/login");  // Navigate to login page after successful registration
        // toast.success("User Registered Successfully");
      }
      
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Get Current User
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("http://localhost:8080/api/v1/auth/current-user");
      if (res.data) {
        return res.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
