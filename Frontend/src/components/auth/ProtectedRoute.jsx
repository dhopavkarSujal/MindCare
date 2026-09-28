import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    loading,
    authError,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#DFF5F1] border-t-[#0F766E]" />

          <p className="text-sm text-slate-500">
            Loading MindCare...
          </p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-slate-800">
            Unable to connect
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {authError}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}