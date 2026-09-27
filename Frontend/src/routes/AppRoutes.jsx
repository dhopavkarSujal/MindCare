import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Mood from "../pages/Mood";
import Journal from "../pages/Journal";
import Resources from "../pages/Resources";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Temporary backend test */}
      {/* Uncomment after creating BackendTest.jsx */}
      {/*
      <Route
        path="/backend-test"
        element={<BackendTest />}
      />
      */}

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mood"
        element={
          <ProtectedRoute>
            <Mood />
          </ProtectedRoute>
        }
      />

      <Route
        path="/journal"
        element={
          <ProtectedRoute>
            <Journal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Landing />}
      />

    </Routes>
  );
}