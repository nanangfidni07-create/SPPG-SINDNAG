import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  LayoutDashboard,
  Utensils,
  ShieldCheck,
  School,
  Search,
  LogOut
} from 'lucide-react';

const appId = import.meta.env.VITE_APP_ID || window.__app_id || 'monitoring-gizi-vercel';

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
  const [view, setView] = useState('dashboard');
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [nutLogs, setNutLogs] = useState([]);
  const [qcLogs, setQcLogs] = useState([]);
  const [syncError, setSyncError] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const [nutForm, setNutForm] = useState({ school: LIST_SEKOLAH[0], menu: '', porsi: '' });
  const [qcForm, setQcForm] = useState({ school: LIST_SEKOLAH[0], rasa: 5, suhu: 5, bersih: 5, catatan: '' });

  useEffect(() => {
    const storedSession = localStorage.getItem('sppg_session_id');
    const id = storedSession || crypto.randomUUID?.() || `guest-${Math.random().toString(36).slice(2)}`;
    if (!storedSession) {
      localStorage.setItem('sppg_session_id', id);
    }
    setSessionId(id);

    const initAuth = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setSyncError(null);

        const { data: nutData, error: nutError } = await supabase
          .from('nutrition')
          .select('*')
          .eq('app_id', appId)
          .order('timestamp', { ascending: false });

        const { data: qcData, error: qcError } = await supabase
          .from('quality')
          .select('*')
          .eq('app_id', appId)
          .order('timestamp', { ascending: false });

        if (!isMounted) return;
        if (nutError || qcError) {
          throw nutError || qcError;
        }

        setNutLogs(nutData || []);
        setQcLogs(qcData || []);
      } catch (err) {
        console.error('Supabase sync error:', err);
        setSyncError(err.message || 'Gagal menyinkronkan data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLogs();

    const channel = supabase
      .channel(`sppg-sync-${appId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nutrition', filter: `app_id=eq.${appId}` },
        () => {
          loadLogs();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quality', filter: `app_id=eq.${appId}` },
        () => {
          loadLogs();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) throw error;
      setView('dashboard');
    } catch (err) {
      console.error('Sign in error:', err);
      setAuthError(err.message || 'Gagal masuk. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('dashboard');
  };

  const handleAction = async (type, data) => {
    if (!sessionId) {
      alert('Silakan tunggu sinkronisasi terlebih dahulu.');
      return;
    }

    try {
      const colName = type === 'nut' ? 'nutrition' : 'quality';
      const payload = {
        app_id: appId,
        ...data,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        auth_user_id: user?.id || null
      };

      const { error } = await supabase.from(colName).insert([payload]);
      if (error) throw error;

      alert('Data berhasil disimpan!');
      setView('dashboard');
      setNutForm({ school: LIST_SEKOLAH[0], menu: '', porsi: '' });
      setQcForm({ school: LIST_SEKOLAH[0], rasa: 5, suhu: 5, bersih: 5, catatan: '' });
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-500 font-medium">Menghubungkan ke Supabase...</p>
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
          <div className="flex items-center gap-4">
            {user ? (
              <span className="text-sm text-slate-500">{user.email}</span>
            ) : (
              <span className="text-sm text-slate-500">Guest</span>
            )}
            <button
              type="button"
              onClick={user ? handleSignOut : () => setView('login')}
              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:border-red-300 hover:text-red-500 transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {syncError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
            Terjadi masalah sinkronisasi dengan Supabase: {syncError}
          </div>
        )}
        {view === 'login' && (
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Masuk dengan Supabase</h2>
              <p className="mt-2 text-sm text-slate-500">
                Gunakan email dan password untuk masuk sebagai authenticated user.
              </p>
            </div>
            {authError && (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {authError}
              </div>
            )}
            <div className="grid gap-4">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSignIn}
                className="rounded-3xl bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700 transition"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-slate-600 hover:bg-slate-50 transition"
              >
                Lanjutkan sebagai Guest
              </button>
            </div>
          </section>
        )}
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
