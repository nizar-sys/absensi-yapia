import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShowQR from "../components/ShowQR";

const qrRegionId = "reader";

const Presensi = () => {
  const [scanning, setScanning] = useState(false);
  const [role, setRole] = useState(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [qrResultData, setQrResultData] = useState(null);

  const html5QrCodeRef = useRef(null);
  const qrContainerRef = useRef(null);
  const token = localStorage.getItem("token")
  useEffect(() => {
    const userData = localStorage.getItem("user_data");

    if (!userData) {
      toast.error("User belum login!");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setRole(parsedData.role);
    } catch (error) {
      console.error("Gagal parsing user_data:", error);
      toast.error("Data pengguna tidak valid.");
    }
  }, []);

  const calculateDistance = (lat, lng) => {
    // Lokasi sekolah YAPIA -6.420186639609793, 106.70786352481606
    const schoolLat = -6.420186639609793;
    const schoolLng = 106.70786352481606;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // meter
    const φ1 = toRad(lat);
    const φ2 = toRad(schoolLat);
    const Δφ = toRad(schoolLat - lat);
    const Δλ = toRad(schoolLng - lng);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return parseFloat((R * c).toFixed(2)); // dalam meter
  };
  
  //60-14-B3-D3-CD-C5
  const validMacAddresses = ["60:14:B3:D3:CD:C5"];

  const startScanning = async () => {
    try {
      const containerWidth = qrContainerRef.current.offsetWidth;
      const config = {
        fps: 10,
        qrbox: { width: containerWidth * 0.8, height: containerWidth * 0.8 },
      };
  
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
  
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {  // ini penting, decodedText adalah isi QR code
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
          setScanning(false);
  
          // ✅ Validasi isi QR code (MAC address)
          let qrData;
            try {
              qrData = JSON.parse(decodedText);

              //TAMBAHKAN || !validMacAddresses.includes(qrData.mac)   UNTUK VALIDASI WIFI
              if (qrData.type !== "PRESENSI" ) {
                toast.error("QR tidak valid atau WiFi tidak dikenali." );
                return;
              }
            } catch (err) {
              toast.error("QR Code tidak dikenali.", err);
              return;
            }

            
            setQrResultData(qrData); // simpan QR data
            setShowChoiceModal(true); // tampilkan modal pilihan
        },
        (err) => console.warn("Scan error:", err)
      );
  
      setScanning(true);
    } catch (error) {
      toast.error(error.message || "Gagal memulai scanner.");
    }
  };
  
  const kirimPresensi = async (tipe) => {
    setShowChoiceModal(false); // tutup modal
    if (!qrResultData) return;
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const distance = calculateDistance(latitude, longitude);
  
          // if (distance > 100) {
          //   toast.error("Anda terlalu jauh dari sekolah.");
          //   return;
          // }
  
        const now = new Date();
        const presensiPayload = {
          tanggal: now.toISOString().split("T")[0],
          hari: now.toLocaleDateString("id-ID", { weekday: "long" }),
          created_at: now.toISOString(),
          latitude,
          longitude,
          distance_from_school: distance,
          location_status: "valid",
          wifi_mac_address: qrResultData.mac,
        };
  
        if (tipe === "masuk") {
          presensiPayload.jam_masuk = now.toTimeString().split(" ")[0];
        } else {
          presensiPayload.jam_keluar = now.toTimeString().split(" ")[0];
        }
  
        try {
          const toastId = toast.loading("Mengirim presensi...");
          const url = tipe === "masuk"
            ? "http://api-backend-presensi.my.id/api/presensi"
            : "http://api-backend-presensi.my.id/api/absen-keluar";

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(presensiPayload),
        });

  
          const data = await res.json();
  
          if (res.ok) {
            toast.update(toastId, {
              render: `Presensi ${tipe} berhasil!`,
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            localStorage.setItem("last_presensi", JSON.stringify(presensiPayload));
            window.dispatchEvent(new Event("presensi-update"));
          } else {
            toast.update(toastId, {
              render: data.message || "Gagal presensi.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error(error);
          toast.error("Gagal mengirim data ke server.");
        }
      },
      (error) => {
        console.error("Lokasi gagal diambil:", error);
        toast.error("Tidak dapat mengambil lokasi.");
      }
    );
  };
  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setScanning(false);
      });
    }
  };

  if (!role) {
    return (
      
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-yellow-200 text-black flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold border-4 border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white inline-block">
          Presensi Guru & Staff
        </h1>
        <p className="text-base mt-2 font-bold">
          Arahkan kamera ke QR Code untuk presensi
        </p>
      </div>

      {role === "admin" ? (
        <div className="mt-6 w-full max-w-md ms-4 p-4">
          <ShowQR />
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 w-full max-w-md space-y-4 rounded-none">
          <div
            id={qrRegionId}
            ref={qrContainerRef}
            className="w-full aspect-square bg-gray-200 border-4 h-[295px] border-black shadow-inner"
          ></div>

          <div className="flex justify-between items-center gap-4">
            <button
              onClick={startScanning}
              disabled={scanning}
              className={`w-1/2 py-3 border-4 border-black font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all duration-150 ${
                scanning
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-400 hover:bg-green-500"
              }`}
            >
              Mulai Scan
            </button>
            <button
              onClick={stopScanning}
              disabled={!scanning}
              className={`w-1/2 py-3 border-4 border-black font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all duration-150 ${
                !scanning
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-red-400 hover:bg-red-500"
              }`}
            >
              Stop Scan
            </button>
          </div>
        </div>
      )}
      {/* ✅ Modal Pilihan Presensi */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white border-4 border-black p-6 shadow-lg text-center space-y-4">
            <h2 className="text-xl font-bold">Pilih Jenis Presensi</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => kirimPresensi("masuk")}
                className="px-4 py-2 bg-green-500 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                Absen Masuk
              </button>
              <button
                onClick={() => kirimPresensi("keluar")}
                className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              >
                Absen Keluar
              </button>
            </div>
            <button
              onClick={() => setShowChoiceModal(false)}
              className="mt-4 underline text-sm text-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Presensi;
