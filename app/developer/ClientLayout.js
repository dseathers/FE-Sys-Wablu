'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { ClipboardList, List, LogOut, Plus, Bell, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useEffect, useState, Fragment } from 'react';

const SIDEBAR_WIDTH = 320;

export default function ClientLayout({ children }) {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoginInfo = async (email) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/get-login-info', { email });
      setLoginData(res.data.data[0]);
    } catch (err) {
      console.error('Failed to get login data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const email = Cookies.get('email');
    if (email) fetchLoginInfo(email);
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    const roleId = Cookies.get('role_id');
    if (!token || roleId !== 'dev') {
      router.push('/login');
    }
  }, []);

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
      <aside
        className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-[#1a2341] via-[#2d3656] to-[#1a2341] text-white flex flex-col items-center py-8 space-y-8 shadow-2xl z-30"
        style={{ width: SIDEBAR_WIDTH }}
      >
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {isLoading ? 'Loading...' : loginData?.team_name || 'Team Name'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">Developer Team</p>
          </div>
        </div>

        <div className="w-full px-6 space-y-3 relative z-10">
          <Link href="/developer" className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 ${activeLink === 'task' ? 'bg-white/20 shadow-lg' : ''}`} onClick={() => setActiveLink('task')}>
            <div className="p-2 bg-pink-500/20 rounded-lg"><ClipboardList size={20} className="text-pink-400" /></div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/developer/list-issue" className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 ${activeLink === 'list' ? 'bg-white/20 shadow-lg' : ''}`} onClick={() => setActiveLink('list')}>
            <div className="p-2 bg-purple-500/20 rounded-lg"><List size={20} className="text-purple-400" /></div>
            <span className="font-medium">Task</span>
          </Link>
        </div>

        <div className="w-full px-6 space-y-3 mt-auto relative z-10">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10">
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

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10">
            <div className="p-2 bg-gray-500/20 rounded-lg"><Settings size={20} className="text-gray-400" /></div>
            <span className="font-medium">Settings</span>
          </button>

          <button onClick={() => setLogoutOpen(true)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="h-screen overflow-y-auto px-0 py-8" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-6 min-h-[calc(100vh-4rem)] border border-gray-100">
          {children}
        </div>
      </main>

      <Transition appear show={logoutOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setLogoutOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-0 shadow-2xl mx-auto relative">
                <div className="flex flex-col items-center p-8">
                  <div className="bg-red-100 rounded-full p-4 mb-4 shadow-lg animate-pop">
                    <LogOut size={48} className="text-red-500" />
                  </div>
                  <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-2 text-center">Keluar dari Akun?</Dialog.Title>
                  <p className="text-gray-600 mb-6 text-center">Apakah kamu yakin ingin logout?<br />Kamu harus login kembali untuk mengakses dashboard QA.</p>
                  <div className="flex justify-end space-x-4 w-full mt-2">
                    <button onClick={() => setLogoutOpen(false)} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700">Batal</button>
                    <button onClick={() => { handleLogout(); setLogoutOpen(false); }} className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600">Ya, Logout</button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
