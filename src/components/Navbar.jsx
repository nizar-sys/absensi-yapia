import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser } from "../context/UserContext.jsx"; // Pastikan path-nya benar

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useUser();
  const role = user?.role;
  const navigate = useNavigate()

  // Sembunyikan navbar saat user data belum dimuat
  if (loading) return null;

  // Sembunyikan navbar di halaman login
  if (location.pathname === "/") return null;

  //TOMBOL LOGOUT
  const handleLogout = ()=>{
    localStorage.removeItem("user_data")
    localStorage.removeItem("token")
    navigate("/");

  }
  // Semua menu
  const allMenuItems = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "guru", "staf", "kepala_sekolah"] },
    { label: "Presensi", path: "/presensi", roles: ["admin", "guru", "staf"] },
    { label: "Perizinan", path: "/permission", roles: ["guru", "staf"] },
    { label: "Konfirmasi", path: "/confirm-permission", roles: ["kepala_sekolah"] }
  ];

  // Filter menu berdasarkan role user
  const menuItems = role ? allMenuItems.filter(item => item.roles.includes(role)) : [];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-yellow-400 border-b-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[70px]">
            {/* LOGO */}
            <div className="flex items-center">
              <img
                src="/logo-yapia.png"
                alt="Logo"
                className="h-10 w-10 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white"
              />
              <span className="ml-3 font-bold text-black text-xl tracking-wider">
                SMK Yapia Parung
              </span>
            </div>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex space-x-4 text-black font-bold">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all
                      ${isActive ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={handleLogout} className="px-3 py-1 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all bg-white hover:bg-black hover:text-white cursor-pointer">Logout</button>
            </div>

            {/* HAMBURGER MENU */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-black border-2 border-black p-2 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MENU MOBILE */}
        <div
          className={`md:hidden bg-yellow-300 border-t-4 border-black transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[300px] py-3" : "max-h-0"
          }`}
        >
          <div className="flex flex-col items-start px-6 space-y-4 font-bold text-black">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] w-full text-left transition-all
                    ${isActive ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="px-3 py-1 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all bg-white w-full text-start hover:bg-black hover:text-white cursor-pointer">Logout</button>
          </div>
        </div>
      </nav>

      {/* SPACER */}
      <div className="h-[70px]" />
    </>
  );
};

export default Navbar;
