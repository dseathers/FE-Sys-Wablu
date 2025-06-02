'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ClipboardList, List, LogOut, Plus, Bell, Settings } from 'lucide-react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useEffect, useState } from 'react';

const SIDEBAR_WIDTH = 320; // px, sesuai w-80

export default function QaLayout({ children }) {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('');
  const [notifications, setNotifications] = useState(3); // Example notification count

  // Cek token dan role
  useEffect(() => {
    const token = Cookies.get('token');
    const roleId = Cookies.get('role_id');
    if (!token || roleId !== 'qa_tester') {
      router.push('/login');
    }
  }, []);

  // Logout
  const handleLogout = async () => {
    const token = Cookies.get('token');
    try {
      await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      Cookies.remove('token');
      Cookies.remove('email');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Sidebar - fixed */}
      <aside
        className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-[#1a2341] via-[#2d3656] to-[#1a2341] text-white flex flex-col items-center py-8 space-y-8 shadow-2xl z-30"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <img 
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-all duration-300 relative" 
              src="/profile.jpg" 
              alt="User" 
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">QA Tester</h2>
            <p className="text-gray-300 text-sm mt-1">Quality Assurance Team</p>
          </div>
        </div>

        <div className="w-full px-6 space-y-3 relative z-10">
          <Link 
            href="/qa/createissue" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm ${activeLink === 'create' ? 'bg-white/20 shadow-lg' : ''}`}
            onClick={() => setActiveLink('create')}
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plus size={20} className="text-blue-400" />
            </div>
            <span className="font-medium">Create Issue</span>
          </Link>
          <Link 
            href="/qa/listissue" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm ${activeLink === 'list' ? 'bg-white/20 shadow-lg' : ''}`}
            onClick={() => setActiveLink('list')}
          >
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <List size={20} className="text-purple-400" />
            </div>
            <span className="font-medium">List Issue</span>
          </Link>
          <Link 
            href="/qa" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm ${activeLink === 'task' ? 'bg-white/20 shadow-lg' : ''}`}
            onClick={() => setActiveLink('task')}
          >
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <ClipboardList size={20} className="text-pink-400" />
            </div>
            <span className="font-medium">My Task</span>
          </Link>
        </div>

        <div className="w-full px-6 space-y-3 mt-auto relative z-10">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
            <div className="p-2 bg-yellow-500/20 rounded-lg relative">
              <Bell size={20} className="text-yellow-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {notifications}
                </span>
              )}
            </div>
            <span className="font-medium">Notifications</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <Settings size={20} className="text-gray-400" />
            </div>
            <span className="font-medium">Settings</span>
          </button>

          <Popup
            trigger={
              <button 
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            }
            modal
            nested
            overlayStyle={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            contentStyle={{ background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
          >
            {close => (
              <div className="animate-fade-in-up scale-95 animate-in duration-300 bg-gradient-to-br from-white via-gray-50 to-white p-0 rounded-2xl shadow-2xl max-w-sm mx-auto relative">
                <div className="flex flex-col items-center p-8">
                  <div className="bg-red-100 rounded-full p-4 mb-4 shadow-lg animate-pop">
                    <LogOut size={48} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Keluar dari Akun?</h2>
                  <p className="text-gray-600 mb-6 text-center">Apakah kamu yakin ingin logout?<br />Kamu harus login kembali untuk mengakses dashboard QA.</p>
                  <div className="flex justify-end space-x-4 w-full mt-2">
                    <button 
                      onClick={close} 
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold shadow transition-all duration-300 border border-gray-200"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={() => { handleLogout(); close(); }} 
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:to-red-600 transition-all duration-300 border border-red-400"
                    >
                      Ya, Logout
                    </button>
                  </div>
                </div>
                {/* Animasi garis bawah */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-1 bg-gradient-to-r from-red-400 via-fuchsia-400 to-cyan-400 rounded-full blur-sm opacity-80 animate-pulse"></div>
              </div>
            )}
          </Popup>
        </div>
      </aside>

      {/* Main Content - margin left sesuai sidebar */}
      <main
        className="h-screen overflow-y-auto p-8"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 min-h-[calc(100vh-4rem)] border border-gray-100">
          {children}
        </div>
      </main>
    </div>
  );
}
