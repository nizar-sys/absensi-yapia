// DataGuru.js
import axios from "axios";
import { useEffect, useState } from "react";

const DataGuru = ({ onDataLoaded }) => {
  useEffect(() => {
    const fetchDataGuru = async () => {
      try {
        const response = await axios.get('localhost:5000/api/role/guru', {
          withCredentials: true, // Pastikan ini diatur jika server memerlukan cookie
        }); // pastikan endpoint valid
        // Jika datanya sudah dalam bentuk JSON, tidak perlu .json()
        onDataLoaded(response.data);
      } catch (error) {
        console.error("Gagal mengambil data guru:", error);
      }
    };

    fetchDataGuru();
  }, [onDataLoaded]);

  return null; // Tidak perlu render apa-apa
};

export default DataGuru;
