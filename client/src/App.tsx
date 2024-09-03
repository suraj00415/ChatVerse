import { Route, Routes } from "react-router-dom"
import './App.css'
import Layout from "./myComponents/Layout.tsx"
import NotFound from "./myComponents/NotFound.tsx"
import ProtectedRoute from "./myComponents/ProtectedRoutes.tsx"
import LoginPage from "./pages/LoginPage.tsx"
import RegisterPage from "./pages/RegisterPage.tsx"
import ChatPage from "./pages/ChatPage.tsx"
import AddPage from "./pages/AddPage.tsx"
import VerifyPage from "./pages/VerifyPage.tsx"
import SchedulePage from "./pages/SchedulePage.tsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/verify/:token" element={<VerifyPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
