import React, { useState, useEffect } from 'react';
import {
  signInUser,
  getCurrentUser,
  addNutritionLog,
  addQualityLog,
  getNutritionLogs,
  getQualityLogs,
  signOut
} from './supabaseClient';
import {
  Utensils,
  ShieldCheck,
  School,
  Search,
  LogOut
} from 'lucide-react';

const LIST_SEKOLAH = [
  'SDN Dermayu',
  'TK Gandasari',
  'Al Maadi',
  'Al Wasliyah',
  'MTS Al-Wasliyah',
  'SMP Al-Irsyad',
  'KB Ushafa',
  'TK Ushafa',
  'SD Al-Khoir',
  'SDN 1 Sindang',
  'SDN 2 Sindang',
  'SD Al-Irsyad',
  'SMA PGRI 2 Sindang'
].sort();

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nutLogs, setNutLogs] = useState([]);
  const [qcLogs, setQcLogs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [nutForm, setNutForm] = useState({ school: LIST_SEKOLAH[0], menu: '', porsi: '' });
  const [qcForm, setQcForm] = useState({ school: LIST_SEKOLAH[0], rasa: 5, suhu: 5, bersih: 5, catatan: '' });

  // Auto-login on load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user);
          setView('dashboard');
        }
      } catch (err) {
        console.error('[v0] Session check error:', err);
      }
    };

    checkExistingSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signInUser();
      if (user) {
        setUser(user.user);
        setUsername('');
        setPassword('');
        setView('dashboard');
      }
    } catch (err) {
      console.error('[v0] Login error:', err);
      alert('Login gagal: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [nutData, qcData] = await Promise.all([
          getNutritionLogs(),
          getQualityLogs()
        ]);
        setNutLogs(nutData);
        setQcLogs(qcData);
      } catch (err) {
        console.error('[v0] Load data error:', err);
      }
    };

    loadData();

    // Set up polling for real-time updates
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleAction = async (type, data) => {
    if (!user) {
      alert('Silakan tunggu autentikasi terlebih dahulu.');
      return;
    }

    try {
      if (type === 'nut') {
        await addNutritionLog(data);
      } else {
        await addQualityLog(data);
      }
      alert('Data berhasil disimpan!');
      setView('dashboard');
      setNutForm({ school: LIST_SEKOLAH[0], menu: '', porsi: '' });
      setQcForm({ school: LIST_SEKOLAH[0], rasa: 5, suhu: 5, bersih: 5, catatan: '' });
      
      // Reload data after a short delay
      setTimeout(async () => {
        const [nutData, qcData] = await Promise.all([
          getNutritionLogs(),
          getQualityLogs()
        ]);
        setNutLogs(nutData);
        setQcLogs(qcData);
      }, 500);
    } catch (err) {
      console.error('[v0] Action error:', err);
      alert('Gagal menyimpan data: ' + (err.message || 'Unknown error'));
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex justify-center mb-8">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-md">
                <School size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">SPPG Sindang</h1>
            <p className="text-center text-slate-500 mb-8">Sistem Monitoring Gizi Sekolah</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengautentikasi...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-4">Atau masuk sebagai guest</p>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const user = await signInUser();
                    if (user) {
                      setUser(user.user);
                      setView('dashboard');
                    }
                  } catch (err) {
                    console.error('[v0] Guest login error:', err);
                    alert('Guest login gagal');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-100 text-slate-700 px-5 py-3 font-semibold hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login Sebagai Guest
              </button>
            </div>
          </div>

          <p className="text-center text-white text-xs mt-8 opacity-80">
            © 2026 SPPG Sindang. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  const filteredSchools = LIST_SEKOLAH.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-200 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md">
              <School size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg">SPPG Sindang</h1>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monitoring Gizi</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                await signOut();
                setUser(null);
              } catch (err) {
                console.error('[v0] Logout error:', err);
              }
            }}
            className="text-slate-500 hover:text-red-500 transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setView('input-makan')}
                className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-4">
                  <Utensils size={24} />
                </div>
                <h3 className="font-bold text-slate-900">Distribusi</h3>
                <p className="mt-1 text-sm text-slate-500">Input porsi makanan</p>
              </button>

              <button
                type="button"
                onClick={() => setView('input-qc')}
                className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:border-purple-300 hover:shadow-md transition"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-slate-900">Kualitas</h3>
                <p className="mt-1 text-sm text-slate-500">Uji kelayakan makanan</p>
              </button>
            </div>

            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Monitoring Lokasi</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {LIST_SEKOLAH.length} Sekolah
                </span>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari sekolah atau jenjang..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-3">
                {filteredSchools.map((school) => {
                  const totalPortions = nutLogs
                    .filter((log) => log.school === school)
                    .reduce((acc, curr) => acc + Number(curr.porsi || 0), 0);

                  return (
                    <div
                      key={school}
                      className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <School size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{school}</p>
                          <p className="text-sm text-slate-500">{totalPortions} porsi terdistribusi</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">Lihat</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {view === 'input-makan' && (
          <section className="space-y-6">
            <button type="button" onClick={() => setView('dashboard')} className="text-sm text-blue-600">
              &larr; Kembali ke dashboard
            </button>
            <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
              <h2 className="font-bold text-xl mb-4">Input Distribusi Makanan</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Sekolah</span>
                  <select
                    value={nutForm.school}
                    onChange={(e) => setNutForm({ ...nutForm, school: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  >
                    {LIST_SEKOLAH.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Menu</span>
                  <input
                    type="text"
                    value={nutForm.menu}
                    onChange={(e) => setNutForm({ ...nutForm, menu: e.target.value })}
                    placeholder="Masukkan menu"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Jumlah Porsi</span>
                  <input
                    type="number"
                    value={nutForm.porsi}
                    onChange={(e) => setNutForm({ ...nutForm, porsi: e.target.value })}
                    placeholder="Jumlah porsi"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleAction('nut', nutForm)}
                  className="w-full rounded-3xl bg-blue-600 px-5 py-4 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Simpan Distribusi
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'input-qc' && (
          <section className="space-y-6">
            <button type="button" onClick={() => setView('dashboard')} className="text-sm text-blue-600">
              &larr; Kembali ke dashboard
            </button>
            <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
              <h2 className="font-bold text-xl mb-4">Input Penilaian Kualitas</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Sekolah</span>
                  <select
                    value={qcForm.school}
                    onChange={(e) => setQcForm({ ...qcForm, school: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-purple-400"
                  >
                    {LIST_SEKOLAH.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['rasa', 'suhu', 'bersih'].map((field) => (
                    <label key={field} className="block">
                      <span className="text-sm font-semibold text-slate-700">{field === 'bersih' ? 'Kebersihan' : field.charAt(0).toUpperCase() + field.slice(1)}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={qcForm[field]}
                        onChange={(e) => setQcForm({ ...qcForm, [field]: Number(e.target.value) })}
                        className="mt-3 w-full"
                      />
                      <div className="mt-2 text-sm text-slate-500">{qcForm[field]}</div>
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Catatan</span>
                  <textarea
                    value={qcForm.catatan}
                    onChange={(e) => setQcForm({ ...qcForm, catatan: e.target.value })}
                    rows="4"
                    placeholder="Tambahkan catatan..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-purple-400"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleAction('qc', qcForm)}
                  className="w-full rounded-3xl bg-purple-600 px-5 py-4 text-white font-semibold hover:bg-purple-700 transition"
                >
                  Simpan Kualitas
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
