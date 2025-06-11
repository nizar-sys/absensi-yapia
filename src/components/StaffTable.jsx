import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// const statusOptions = ['Hadir', 'Tidak Hadir', 'Belum Presensi' , 'Izin', 'Sakit'];

const TeacherTable = () => {
  const [teacherData, setTeacherData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const date = new Date()
  const [editingId, setEditingId] = useState(null);
  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const [editEntry, setEditEntry] = useState({
    nama: '',
    no_wa: '',
    email: ''
  });
  
  const [newEntry, setNewEntry] = useState({
    nama: '',
    nip: '',
    statusHariIni: 'Hadir',
    whatsapp: '',
    email: '',
    password: '',
    role: 'staff'
  });

  const token = localStorage.getItem('token');

  const fetchGuruData = useCallback(async () => {
    try {
      const res = await axios.get('http://api-backend-presensi.my.id/api/presensi/role/staf', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setTeacherData(res.data.data);
    } catch (error) {
      console.error("Gagal fetch data:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchGuruData();
  }, [fetchGuruData]);

  const handleAdd = async () => {
    if (!newEntry.nama || !newEntry.nip || !newEntry.whatsapp || !newEntry.email || !newEntry.password) {
      alert("Harap lengkapi semua data yang diperlukan.");
      return;
    }

    try {
      const waktu =
        newEntry.statusHariIni === 'Belum Presensi'
          ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-';

      const newData = {
        nama: newEntry.nama,
        nip: newEntry.nip,
        status: newEntry.statusHariIni,
        jam_masuk: waktu,
        total_absensi: 0,
        no_wa: newEntry.whatsapp,
        email: newEntry.email,
        password: newEntry.password,
        role: 'staf',
      };

      await axios.post('http://api-backend-presensi.my.id/api/users', newData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setNewEntry({
        nama: '',
        nip: '',
        statusHariIni: 'Belum Presensi',
        whatsapp: '',
        email: '',
        password: '',
        role: 'staf'
      });
      setShowForm(false);
      fetchGuruData();
      alert("Data berhasil ditambahkan!");
    } catch (error) {
      const err = error.response?.data || error;
      console.error('Gagal menambahkan data:', err);
    
      // Ambil pesan error yang paling informatif
      const message = err.error || err.message || 'Terjadi kesalahan';
    
      alert('Gagal menambahkan data:\n' + message);
    }
  };

  const handleEdit = (item) => {
    console.log('Edit clicked:', item); 
    if (!item?.id) {
      console.error("ID staff tidak ditemukan saat akan diedit:", item);
      return;
    }
  
    setEditingId(item.id);
    setEditEntry({
      nama: item.nama,
      no_wa: item.no_wa,
      email: item.email
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      try {
        await axios.delete(`http://api-backend-presensi.my.id/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        fetchGuruData();
        alert("Data berhasil dihapus!");
      } catch (error) {
        console.error('Gagal hapus data:', error.response?.data || error);
        alert('Gagal hapus data.');
      }
    }
  };
  
  

  const handleUpdate = async (id) => {
    if (!id) {
      console.error('ID pengguna tidak ditemukan.');
      alert('Gagal update data: ID tidak valid.');
      return;
    }
  
    try {
      await axios.put(`http://api-backend-presensi.my.id/api/users/${id}`, {
        nama: editEntry.nama,
        no_wa: editEntry.no_wa,
        email: editEntry.email
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      setEditingId(null);
      fetchGuruData();
      alert("Data berhasil diupdate!");
    } catch (error) {
      console.error('Gagal update data:', error.response?.data || error);
      alert('Gagal update data.');
    }
  };
  

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nama', 'NIP',   'Total Absensi', 'WhatsApp', 'Email']],
      body: teacherData.map((d) => [
        d.nama,
        d.nip,
        d.total_absensi,
        d.no_wa,
        d.email,
      ]),

    });
    doc.save(`data_absensi_staff_${formattedDate}.pdf`);
  };

  const exportExcel = () => {
    const excelData = teacherData.map(d => ({
      ...d,
      jam_keluar: d.jam_keluar || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataAbsensi');
    XLSX.writeFile(workbook, `data_absensi_staff_${formattedDate}.xlsx`);
  };

  const filteredData = teacherData
    .filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));
  let role = null
  const userData = JSON.parse(localStorage.getItem("user_data"));
  role = userData.role
  return (
    <div className="p-3">
      <div className="p-6 bg-yellow-200 border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
        <h1 className="text-2xl font-extrabold mb-4 text-black">📋 Data Absensi Guru</h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <input
            type="text"
            placeholder="Cari berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border-[3px] border-black bg-white text-black shadow-[4px_4px_0_rgba(0,0,0,1)] focus:outline-none"
          />
          <div className="flex gap-2">
          {role === 'admin' && (
            <div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-300 w-38 border-[3px] border-black text-black px-3 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-blue-200"
              >
                {showForm ? "x Batal" : "+ Tambah Data"}
              </button>
            </div>
          )}
                

            <button onClick={exportPDF} className="bg-pink-400 border-[3px] border-black text-black px-3 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-pink-300">Export PDF</button>
            <button onClick={exportExcel} className="bg-lime-400 border-[3px] border-black text-black px-3 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-lime-300">Export Excel</button>
          </div>
        </div>

        {showForm &&  (
          <div className="mb-5 p-4 bg-white border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold mb-2">📝 Form Tambah Data</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <input type="text" placeholder="Nama" value={newEntry.nama} onChange={(e) => setNewEntry({ ...newEntry, nama: e.target.value })} className="p-2 border-[2px] border-black" />
              <input type="text" placeholder="NIP" value={newEntry.nip} onChange={(e) => setNewEntry({ ...newEntry, nip: e.target.value })} className="p-2 border-[2px] border-black" />
              <input type="text" placeholder="No. WhatsApp" value={newEntry.whatsapp} onChange={(e) => setNewEntry({ ...newEntry, whatsapp: e.target.value })} className="p-2 border-[2px] border-black" />
              <input type="email" placeholder="Email" value={newEntry.email} onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })} className="p-2 border-[2px] border-black" />
              <input type="password" placeholder="Password" value={newEntry.password} onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })} className="p-2 border-[2px] border-black" />
            </div>
            <button onClick={handleAdd} className="mt-4 bg-green-400 border-[3px] border-black text-black px-4 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-green-300">Simpan Data</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,1)] bg-white">
            <thead className="bg-black text-white text-left">
              <tr>
                <th className="p-2">Nama</th>
                <th className="p-2">NIP</th>
                <th className="p-2">Status</th>
                <th className="p-2">Absensi Masuk</th>
                <th className="p-2">Absensi Keluar</th>
                <th className="p-2">Total</th>
                <th className="p-2">WA</th>
                <th className="p-2">Email</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
  {filteredData.map((item) => (
    <React.Fragment key={item.id || item.email}>
      <tr className="hover:bg-yellow-100 border-b-[2px] border-black">
        <td className="p-2">{item.nama}</td>
        <td className="p-2">{item.nip}</td>
        <td className="p-2">{item.status}</td>
        <td className="p-2">{item.jam_masuk}</td>
        <td className="p-2">{item.jam_keluar || '-'}</td>
        <td className="p-2 text-center">{item.total_absensi}</td>
        <td className="p-2">{item.no_wa}</td>
        <td className="p-2">{item.email}</td>
        {role === "admin" && (
        <td className="p-2">
          <button
            onClick={() => handleEdit(item)}
            className="px-3 py-1 bg-blue-300 border-[2px] border-black hover:bg-blue-200 font-bold"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="ml-2 px-3 py-1 bg-red-400 border-[2px] border-black hover:bg-red-300 font-bold"
          >
            Hapus
          </button>
        </td>
      )}

      </tr>
      {editingId === item.id && (
        <tr>
          <td colSpan="8" className="p-2 bg-yellow-50 border-t border-black">
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={editEntry.nama}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, nama: e.target.value })
                }
                className="p-2 border-[2px] border-black"
              />
              <input
                type="text"
                value={editEntry.no_wa}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, no_wa: e.target.value })
                }
                className="p-2 border-[2px] border-black"
              />
              <input
                type="email"
                value={editEntry.email}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, email: e.target.value })
                }
                className="p-2 border-[2px] border-black"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate(item.id)}
                className="px-4 py-2 bg-green-400 border-[2px] border-black hover:bg-green-300 font-bold"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-red-400 border-[2px] border-black hover:bg-red-300 font-bold"
              >
                Batal
              </button>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherTable;
