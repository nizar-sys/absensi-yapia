import React from "react";
import { QRCode } from "react-qrcode-logo";

const ShowQR = () => {
  const today = new Date().toISOString().slice(0, 10); // format "YYYY-MM-DD"
  const macAddress = ["60:14:B3:D3:CD:C5"];
  const qrContent = JSON.stringify({
    type: "PRESENSI",
    date: today,
    mac: macAddress,
  });
  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 w-full max-w-sm text-center rounded-none">
      <h2 className="text-2xl font-extrabold text-black mb-4 border-4  bg-yellow-300 inline-block">
        QR Presensi Hari Ini
      </h2>
      <div className="inline-block border-4 border-black p-2 bg-white">
        <QRCode
          value={qrContent}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          eyeRadius={0}
        />
      </div>
      <p className="text-sm font-semibold text-black mt-4">
        Scan QR ini untuk melakukan presensi hari ini
      </p>
    </div>
  );
};

export default ShowQR;
