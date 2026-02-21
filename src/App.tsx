import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import AdminPostPage from "./admiin/AdminPostPage";
import ProfilePage from "./admiin/ProfilePage";
import Home from "./pages/Home";
import { Navbar } from "./components/Navbar";
import PostDetails from "./pages/PostDetails";
import { GuestRoute } from "./routes/GuestRoute";

export const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-300">
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPostPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}