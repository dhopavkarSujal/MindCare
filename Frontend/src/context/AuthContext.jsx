import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/auth/me");

      const backendUser =
        response.data?.data?.user;

      setUser(backendUser || null);

      return backendUser;
    } catch (error) {
      console.error(
        "Failed to fetch user profile:",
        error.response?.data || error.message
      );

      setUser(null);

      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);

        if (session) {
          await fetchUserProfile();
        }
      } catch (error) {
        console.error(
          "Auth initialization error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);

      if (data.session) {
        const backendUser =
          await fetchUserProfile();

        if (!backendUser) {
          throw new Error(
            "Unable to load application user profile."
          );
        }
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (
    email,
    password,
    fullName
  ) => {
    setLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      setSession(data.session);

      if (data.session) {
        const backendUser =
          await fetchUserProfile();

        if (!backendUser) {
          throw new Error(
            "Unable to create application user profile."
          );
        }
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error(
        "Logout error:",
        error.message
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,

        login,
        register,
        logout,

        isAuthenticated:
          !!session && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};