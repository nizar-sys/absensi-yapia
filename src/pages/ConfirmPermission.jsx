import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmPermission = () => {
  const [izinList, setIzinList] = useState([]);
  const [showImageId, setShowImageId] = useState(null);
  const [loadingId, setLoadingId] = useState(null); // 👉 Untuk loading per item

  const BASE_URL = "http://api-backend-presensi.my.id/uploads/";

  const handleShowImage = (izinId) => {
    if (showImageId === izinId) {
      setShowImageId(null);
    } else {
      setShowImageId(izinId);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://api-backend-presensi.my.id/api/perizinan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const pending = data.filter((izin) => izin.status_approval === "pending");
    setIzinList(pending);
  };

  const handleKonfirmasi = async (izinId, status) => {
    setLoadingId(izinId); // Mulai loading
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://api-backend-presensi.my.id/api/perizinan/${izinId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Pengajuan berhasil ${status}`);
        await fetchData();
        window.dispatchEvent(new CustomEvent("presensi-update"));
      } else {
        toast.error("Gagal memproses konfirmasi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.", error);
    } finally {
      setLoadingId(null); // Selesai loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-20 bg-yellow-200 border-4 border-black p-6 rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <h2 className="text-3xl font-extrabold mb-6 text-center border-4 border-black bg-white px-6 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        Konfirmasi Pengajuan Izin/Sakit
      </h2>

      <table className="w-full border-collapse border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <thead>
          <tr className="bg-white border-4 border-black">
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Nama</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Tanggal Pengajuan</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Alasan</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Bukti</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Status</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {izinList.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 font-bold text-black">
                Tidak ada pengajuan menunggu konfirmasi.
              </td>
            </tr>
          ) : (
            izinList.map((izin) => (
              <tr key={izin.id} className="bg-white border-4 border-black relative">
                <td className="border-4 border-black px-4 py-3 font-semibold">{izin.nama_guru}</td>
                <td className="border-4 border-black px-4 py-3">
                  {new Date(izin.tanggal).toLocaleDateString()}
                </td>
                <td className="border-4 border-black px-4 py-3">{izin.keterangan || "-"}</td>
                <td className="border-4 border-black px-4 py-3 text-center">
                  {izin.bukti_sakit ? (
                    <button
                      onClick={() => handleShowImage(izin.id)}
                      className="text-blue-600 underline"
                    >
                      {showImageId === izin.id ? "Tutup" : "Lihat"}
                    </button>
                  ) : (
                    "-"
                  )}

                  {showImageId === izin.id && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-50">
                      <img
                        src={`${BASE_URL}${izin.bukti_sakit}`}
                        alt="Bukti Sakit"
                        className="max-w-xs md:max-w-md lg:max-w-lg object-contain"
                      />
                      <button
                        onClick={() => handleShowImage(izin.id)}
                        className="block mt-4 bg-red-700 text-yellow-200 font-bold px-4 py-2 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-red-800 transition-colors w-full"
                      >
                        Tutup Gambar
                      </button>
                    </div>
                  )}
                </td>
                <td className="border-4 border-black px-4 py-3 text-center font-bold">
                  {izin.status_approval}
                </td>
                <td className="border-4 border-black px-4 py-3 text-center space-x-3">
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "disetujui")}
                    disabled={loadingId === izin.id}
                    className={`${
                      loadingId === izin.id
                        ? "bg-green-400 cursor-wait"
                        : "bg-green-700 hover:bg-green-800"
                    } text-yellow-200 font-bold px-5 py-2 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-colors`}
                  >
                    {loadingId === izin.id ? "Memproses..." : "Ya"}
                  </button>
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "ditolak")}
                    disabled={loadingId === izin.id}
                    className={`${
                      loadingId === izin.id
                        ? "bg-red-400 cursor-wait"
                        : "bg-red-700 hover:bg-red-800"
                    } text-yellow-200 font-bold px-5 py-2 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-colors`}
                  >
                    {loadingId === izin.id ? "Memproses..." : "Tidak"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
};

export default ConfirmPermission;
