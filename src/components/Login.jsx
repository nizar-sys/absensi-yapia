import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../context/UserContext.jsx"
import axios from 'axios';

const Login = () => {
  const [noWa, setNoWa] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'no_wa') {
      setNoWa(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!noWa || !password) {
        throw new Error("Nomor WhatsApp dan password harus diisi");
      }
      
      const response = await axios.post(
        "http://api-backend-presensi.my.id/api/login",
        { no_wa: noWa, password }
      );
      
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setMessage("Login berhasil!");
      navigate("/dashboard");

    } catch(err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "Terjadi kesalahan saat login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-yellow-100">
      <form 
        onSubmit={handleLogin}
        className="p-8 w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black mb-2 border-b-4 border-black pb-2">
            LOGIN ABSENSI
          </h2>
          <p className="text-lg font-medium text-gray-800">
            Masukkan kredensial Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-200 text-red-900 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            ⚠️ {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-6 p-4 bg-green-200 text-green-900 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            ✓ {message}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="no_wa" className="block text-lg font-bold text-black mb-2">
            Nomor WhatsApp
          </label>
          <input
            id="no_wa"
            name="no_wa"
            type="text"
            value={noWa}
            onChange={handleChange}
            className="w-full px-5 py-3 text-lg border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            placeholder="Masukan Nomor WhatsApp Anda"
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="password" className="block text-lg font-bold text-black mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={handleChange}
            className="w-full px-5 py-3 text-lg border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 text-xl font-bold border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all
            ${loading 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-yellow-400 hover:bg-yellow-300 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              MEMPROSES...
            </span>
          ) : (
            'LOGIN →'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;