import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IzinForm = () => {
  const [tipe, setTipe] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [alasan, setAlasan] = useState("");
  const [buktiFoto, setBuktiFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTipeChange = (e) => {
    const selectedTipe = e.target.value;
    setTipe(selectedTipe);
    setAlasan("");
    setBuktiFoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user_data"));
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      setLoading(false);
      return;
    }

    if (!tanggal) {
      toast.error("Silakan pilih tanggal terlebih dahulu!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("tanggal", tanggal);
    formData.append("jenis", tipe);

    if (tipe === "izin") {
      formData.append("keterangan", alasan);
    } else if (tipe === "sakit") {
      if (!buktiFoto) {
        toast.error("Silakan unggah surat sakit!");
        setLoading(false);
        return;
      }
      formData.append("keterangan", "-");
      formData.append("bukti_sakit", buktiFoto);
    }

    try {
      const res = await fetch("http://api-backend-presensi.my.id/api/perizinan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Pengajuan berhasil dikirim!");
        setTipe("");
        setTanggal("");
        setAlasan("");
        setBuktiFoto(null);
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal mengirim pengajuan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengirim data atau anda sudah mengajukan izin pada tanggal tersebut");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-30 bg-yellow-200 border-4 border-black p-6 rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-extrabold mb-6 border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        Form Pengajuan Izin / Sakit
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <select
          className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          value={tipe}
          onChange={handleTipeChange}
          required
        >
          <option value="">Pilih Jenis Pengajuan</option>
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
        </select>

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          required
        />

        {tipe === "izin"  && (
          <textarea
            placeholder="Alasan izin..."
            className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            required
          ></textarea>
        )}

        {tipe === "sakit" && (
          <div>
            <label className="block mb-2 font-bold text-black tracking-wide">
              Upload Surat Sakit (jpg, png, pdf)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              onChange={(e) => setBuktiFoto(e.target.files[0])}
              required={tipe === "sakit"}
            />
          </div>
        )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center gap-2 ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black"
        } bg-yellow-300 font-extrabold px-4 py-3 rounded-none shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:text-yellow-300 transition-colors duration-200`}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {loading ? "Mengirim..." : "Kirim Pengajuan"}
      </button>

      </form>

      {/* Toast Container biar toast bisa tampil */}
      <ToastContainer />
    </div>
  );
};

export default IzinForm;
