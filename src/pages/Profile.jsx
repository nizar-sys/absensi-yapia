import React from "react";

const Profile = () => {
  // Contoh data pengguna
  const user = {
    name: "Rina Suryani",
    role: "Guru",
    dob: "12 Maret 1985",
    nip: "19850312 202001 2 001",
    photoUrl: "https://i.pravatar.cc/150?img=47", // Ganti dengan foto user
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="bg-yellow-200 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 max-w-md w-full rounded-none">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.photoUrl}
            alt="Foto User"
            className="w-32 h-32 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] mb-6 rounded-sm object-cover"
          />
          <h2 className="text-3xl font-extrabold text-black mb-1 border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white">
            {user.name}
          </h2>
          <p className="text-lg font-bold text-black mb-6">{user.role}</p>

          <div className="w-full border-t-4 border-black pt-6 text-left">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-black tracking-widest">
                  NIP
                </p>
                <p className="font-extrabold text-black text-lg">{user.nip}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-black tracking-widest">
                  TANGGAL LAHIR
                </p>
                <p className="font-extrabold text-black text-lg">{user.dob}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
