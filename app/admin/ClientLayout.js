'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { ClipboardList, List, LogOut, Plus, Bell, Settings, User } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useEffect, useState, Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SIDEBAR_WIDTH = 320;

export default function ClientLayout({ children }) {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);



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
    if (!token || roleId !== 'admin') {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
  const fetchThumbnail = async () => {
    const token = Cookies.get('token');
    if (loginData?.file_id) {
      try {
        const res = await axios.post('http://127.0.0.1:8000/api/thumbnail', { file_id: loginData.file_id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setThumbnail(res.data.base64);
      } catch (err) {
        console.warn('Thumbnail not found, using default');
      }
    }
  };
  fetchThumbnail();
}, [loginData]);

const handleChangePassword = async () => {
  // Clear previous errors
  setPasswordErrors({});
  
  // Validation
  const errors = {};
  
  if (!passwordForm.current_password) {
    errors.current_password = 'Current password is required';
  }
  
  if (!passwordForm.new_password) {
    errors.new_password = 'Current password is required';
  } else if (passwordForm.new_password.length < 8) {
    errors.new_password = 'New password must be at least 8 characters';
  }
  
  if (!passwordForm.new_password_confirmation) {
    errors.new_password_confirmation = 'Password confirmation is required';
  } else if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    errors.new_password_confirmation = 'Password confirmation does not match';
  }
  
  if (Object.keys(errors).length > 0) {
    setPasswordErrors(errors);
    return;
  }

  const token = Cookies.get('token');
  try {
    const payload = {
      id: loginData?.id, // ID dari get-login-info
      ...passwordForm
    };

    const res = await axios.post('http://127.0.0.1:8000/api/change-password', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success('Change Password Success');
    setShowChangePassword(false);
    setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    setPasswordErrors({});
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal mengubah password');
  }
};


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
                src={thumbnail || "/default-profile.jpg"} 
                alt="User" 
              />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {isLoading ? 'Loading...' : loginData?.team_name || 'Team Name'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">Admin</p>
          </div>
        </div>

        <div className="w-full px-6 space-y-3 relative z-10">
          <Link href="/admin" className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 ${activeLink === 'task' ? 'bg-white/20 shadow-lg' : ''}`} onClick={() => setActiveLink('task')}>
            <div className="p-2 bg-pink-500/20 rounded-lg"><ClipboardList size={20} className="text-pink-400" /></div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/list-issue" className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 ${activeLink === 'list' ? 'bg-white/20 shadow-lg' : ''}`} onClick={() => setActiveLink('list')}>
            <div className="p-2 bg-purple-500/20 rounded-lg"><List size={20} className="text-purple-400" /></div>
            <span className="font-medium">All Issue</span>
          </Link>
          <Link href="/admin/user-list" className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 ${activeLink === 'user' ? 'bg-white/20 shadow-lg' : ''}`} onClick={() => setActiveLink('user')}>
            <div className="p-2 bg-purple-500/20 rounded-lg"><User size={20} className="text-purple-400" /></div>
            <span className="font-medium">User</span>
          </Link>
        </div>

        <div className="w-full px-6 space-y-3 mt-auto relative z-10">


          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10"
          >
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <Settings size={20} className="text-gray-400" />
            </div>
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
      {mounted && (
  <Transition appear show={showChangePassword} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => setShowChangePassword(false)}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white p-0 shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Settings size={24} className="text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold">Change Password</Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1">Change Your Acount Password</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordErrors.current_password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Insert Current Password"
                    value={passwordForm.current_password}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, current_password: e.target.value });
                      if (passwordErrors.current_password) {
                        setPasswordErrors({ ...passwordErrors, current_password: '' });
                      }
                    }}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {passwordErrors.current_password}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordErrors.new_password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Insert New Password"
                    value={passwordForm.new_password}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, new_password: e.target.value });
                      if (passwordErrors.new_password) {
                        setPasswordErrors({ ...passwordErrors, new_password: '' });
                      }
                    }}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {passwordErrors.new_password}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordErrors.new_password_confirmation 
                        ? 'border-red-300 bg-red-50' 
                        : passwordForm.new_password_confirmation && passwordForm.new_password === passwordForm.new_password_confirmation
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Confirm New Password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value });
                      if (passwordErrors.new_password_confirmation) {
                        setPasswordErrors({ ...passwordErrors, new_password_confirmation: '' });
                      }
                    }}
                  />
                  {passwordErrors.new_password_confirmation && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {passwordErrors.new_password_confirmation}
                    </p>
                  )}
                  {passwordForm.new_password_confirmation && passwordForm.new_password === passwordForm.new_password_confirmation && (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                      Password Match
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
                  setPasswordErrors({});
                }}
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)}

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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
