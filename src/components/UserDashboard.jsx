import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [absensi, setAbsensi] = useState([]);

  const fetchAbsensi = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://api-backend-presensi.my.id/api/presensi/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Pastikan ini diatur jika server memerlukan cookie
      });

      setAbsensi(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data absensi:', error);
    }
  };

  useEffect(() => {
    fetchAbsensi();
    const listener = () => {
      console.log("Event presensi-update diterima");
      fetchAbsensi();
    };

    window.addEventListener("presensi-update", listener);

    return () => {
      window.removeEventListener("presensi-update", listener);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'HADIR':
        return 'text-green-700 font-semibold';
      case 'IZIN':
        return 'text-yellow-600 font-semibold';
      case 'SAKIT':
        return 'text-orange-600 font-semibold';
      case 'TIDAK HADIR':
        return 'text-red-600 font-semibold';
      case 'BELUM PRESENSI':
        return 'text-gray-500 font-semibold';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#fefefe] font-mono">
      <h1 className="text-3xl font-black border-4 border-black bg-yellow-300 inline-block px-4 py-2 shadow-[4px_4px_0px_0px_#000]">
        Dashboard Absensi
      </h1>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-auto border-4 border-black shadow-[4px_4px_0px_0px_#000]">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-2 border border-black">Tanggal</th>
              <th className="px-4 py-2 border border-black">Absensi Masuk</th>
              <th className="px-4 py-2 border border-black">Absensi Keluar</th>
              <th className="px-4 py-2 border border-black">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {absensi.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Tidak ada data absensi.
                </td>
              </tr>
            ) : (
              absensi.map((data, index) => (
                <tr key={index} className="bg-white hover:bg-yellow-100 transition">
                  <td className="px-4 py-2 border border-black text-center">
                    {new Date(data.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-2 border border-black text-center">
                    {data.jam_masuk || '-'}
                  </td>
                  <td className="px-4 py-2 border border-black text-center">
                    {data.jam_keluar || '-'}
                  </td>
                  <td className={`px-4 py-2 border border-black text-center uppercase ${getStatusColor(data.status)}`}>
                    {data.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;
