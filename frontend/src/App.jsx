import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { axiosInstance } from "./utils/axios.js";
function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          return null;
        }
        toast.error(err.response.data.message || "Something went wrong");
      }
    },
  });

  if (isLoading) return null;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signup"
          element={authUser ? <Navigate to={"/"} /> : <SignupPage />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to={"/"} /> : <LoginPage />}
        />
      </Routes>
      <Toaster />
    </Layout>
  );
}

export default App;
