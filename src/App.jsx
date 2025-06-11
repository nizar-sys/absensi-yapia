import Login from "./components/Login"
import Dashboard from "./pages/Dashboard"
import {Route, Routes} from "react-router-dom"
import Presensi from "./pages/Presensi"
import Navbar from "./components/Navbar"
import Profile from "./pages/Profile"
import Permission from "./pages/Permission";
import ConfirmPermission from "./pages/ConfirmPermission"
function App() {

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/presensi" element={<Presensi />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/permission" element={<Permission />} />
        <Route path="/confirm-permission" element={<ConfirmPermission />} />
      </Routes>
    </>
  )
}

export default App
