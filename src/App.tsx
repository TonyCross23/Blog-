import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import AdminPostPage from "./admiin/AdminPostPage";
import ProfilePage from "./admiin/ProfilePage";
import Home from "./pages/Home";

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Home />} />

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
  )
}