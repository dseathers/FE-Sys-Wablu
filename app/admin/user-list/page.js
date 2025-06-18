'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../../style/listissue.module.css';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil } from 'lucide-react';

const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('desc');

  const [popupOpen, setPopupOpen] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    file_id: ''
  });
  const [fileId, setFileId] = useState('');
  const [preview, setPreview] = useState('');
  const [mounted, setMounted] = useState(false);
  const [thumbnails, setThumbnails] = useState({});

  const [popupEdit, setPopupEdit] = useState(null);
  const [popupEditOpen, setPopupEditOpen] = useState(false);

  const [editUserId, setEditUserId] = useState(null);

  useEffect(() => setMounted(true), []);

  const fetchUserList = async (sortField = '', sortOrder = 'desc', size = pageSize, page = pageNumber) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-user-list',
        { search: searchTerm, pageSize: size, pageNumber: page, orderBy: sortOrder, sortBy: sortField },
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
      );
      setUserList(res.data.data);
      setTotalItems(res.data.total || 0);

      const thumbnailMap = {};
      await Promise.all(res.data.data.map(async (user) => {
        if (user.file_id) {
          try {
            const thumb = await axios.post('http://127.0.0.1:8000/api/thumbnail', { file_id: user.file_id }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            thumbnailMap[user.file_id] = thumb.data.base64;
          } catch {
            thumbnailMap[user.file_id] = null;
          }
        }
      }));
      setThumbnails(thumbnailMap);
    } catch (error) {
      console.error('Failed to fetch User List:', error);
    }
  };


  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/role-ddl')
      .then(res => setRoleList(res.data.data))
      .catch(err => console.error('Failed to fetch roles:', err));
  }, []);

  useEffect(() => {
    fetchUserList(sortBy, orderBy);
  }, [sortBy, orderBy, pageSize, pageNumber]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUserList(sortBy, orderBy);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSort = (field) => {
    const newOrder = sortBy === field && orderBy === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setOrderBy(newOrder);
  };

  const handlePageChange = (page) => setPageNumber(page);

  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPageNumber(0);
  };

 const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = Cookies.get('token');
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const uploadRes = await axios.post('http://127.0.0.1:8000/api/upload', formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });
      const fileId = uploadRes.data.file_id;
      setFormData(prev => ({ ...prev, file_id: fileId }));

      const thumbRes = await axios.post('http://127.0.0.1:8000/api/thumbnail', { file_id: fileId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setPreview(thumbRes.data.base64);
    } catch (err) {
      console.error('Upload or thumbnail fetch failed:', err);
      toast.error('Upload foto gagal');
    }
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');
    try {
      await axios.post('http://127.0.0.1:8000/api/user-register', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      toast.success('User berhasil ditambahkan!');
      setPopupOpen(false);
      fetchUserList();
      setFormData({ name: '', email: '', password: '', role_id: '', file_id: '' });
      setPreview('');
    } catch (err) {
      toast.error('Gagal menambahkan user');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).replace(',', '');
  };

const handleEditPopup = async (teamId) => {
  const token = Cookies.get('token');
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/get-user-dtl', {
      team_id: teamId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const d = res.data.data[0];
    setEditUserId(teamId);
    setFormData({
      name: d.team_name,
      email: d.email,
      password: '',
      role_id: d.role_id, // Mapping role_name ke role_id kalau diperlukan
      file_id: d.file_id || ''
    });
    if (d.file_id) {
      const thumb = await axios.post('http://127.0.0.1:8000/api/thumbnail', { file_id: d.file_id }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPreview(thumb.data.base64);
    } else {
      setPreview('');
    }
    setPopupEditOpen(true);
  } catch (err) {
    toast.error('Gagal mengambil detail user');
    console.error(err);
  }
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
  const token = Cookies.get('token');
  try {
    await axios.post('http://127.0.0.1:8000/api/update-user-dtl', {
      team_id: editUserId,
      role_id: formData.role_id,
      file_id: formData.file_id
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    toast.success('User berhasil diupdate!');
    setPopupEditOpen(false);
    fetchUserList();
  } catch (err) {
    toast.error('Gagal mengupdate user');
    console.error(err);
  }
};

  

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className={styles.container}>
        <div className="flex gap-4 items-center bg-white rounded-xl shadow-md px-8 py-5 mb-3 mt-6 w-full">
            <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[180px] px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            <button
                onClick={() => setPopupOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow hover:shadow-lg transition-all duration-200 flex items-center justify-center min-w-[40px] h-[40px]"
            >
                <span className="text-xl">+</span>
            </button>
    </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th><span className={styles.thContent}>Team Name
                <button 
                  className={`${styles.sortButton} ${sortBy === 'team_name' ? styles.active : ''} ${sortBy === 'team_name' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('team_name')}
                >
                  <span className={styles.sortIcon}>
                    <svg className={styles.upArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    <svg className={styles.downArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
              </span></th>
              <th><span className={styles.thContent}>Email
                <button 
                  className={`${styles.sortButton} ${sortBy === 'email' ? styles.active : ''} ${sortBy === 'email' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('email')}
                >
                  <span className={styles.sortIcon}>
                    <svg className={styles.upArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    <svg className={styles.downArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
              </span></th>
              <th><span className={styles.thContent}>Role
                <button 
                  className={`${styles.sortButton} ${sortBy === 'role_name' ? styles.active : ''} ${sortBy === 'role_name' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('role_name')}
                >
                  <span className={styles.sortIcon}>
                    <svg className={styles.upArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    <svg className={styles.downArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
              </span></th>
              <th><span className={styles.thContent}>Created Date
                <button 
                  className={`${styles.sortButton} ${sortBy === 'created_date' ? styles.active : ''} ${sortBy === 'created_date' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('created_date')}
                >
                  <span className={styles.sortIcon}>
                    <svg className={styles.upArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    <svg className={styles.downArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
              </span></th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {Array.isArray(userList) && userList.length > 0 ? (
              userList.map((user, index) => (
                <tr key={index}>
                  <td className="flex items-center gap-3">
                    {user.file_id && thumbnails[user.file_id] && (
                      <img
                        src={(user.file_id && thumbnails[user.file_id]) || '/default-profile.JPG'}
                        alt="Foto Profil"
                        className="w-15 h-15 rounded-full object-cover"
                      />
                    )}
                    {user.team_name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role_name}</td>
                  <td>{formatDate(user.created_date)}</td>
                  <td>
                      <button className={styles.actionButton} onClick={() => handleEditPopup(user.team_id)}><Pencil size={17}/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500 font-medium">
                  No Data Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <span>
            {totalItems > 0
              ? `${pageNumber * pageSize + 1}-${Math.min((pageNumber + 1) * pageSize, totalItems)} of ${totalItems} items`
              : 'No items'}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 0}
          >
            &#x3c;
          </button>
          <span className={styles.pageButton}>{pageNumber + 1}</span>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber + 1 >= totalPages}
          >
            &#x3e;
          </button>
          <select
            className={styles.pageButton}
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{`${size} / page`}</option>
            ))}
          </select>
        </div>
      </div>
      {mounted && (
        <Transition appear show={popupOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setPopupOpen(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            </Transition.Child>
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl transform transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <Dialog.Title className="text-2xl font-bold text-gray-800">Tambah User</Dialog.Title>
                    <button 
                      onClick={() => setPopupOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input 
                          type="text" 
                          placeholder="Masukkan nama" 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                          type="email" 
                          placeholder="Masukkan email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                          type="password" 
                          placeholder="Masukkan password" 
                          value={formData.password} 
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select 
                          value={formData.role_id} 
                          onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          required
                        >
                          <option value="">Pilih Role</option>
                          {roleList.map((r) => (
                            <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileUpload} 
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                            />
                          </div>
                          {preview && (
                            <div className="relative group">
                              <img 
                                src={preview} 
                                alt="Preview" 
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm transition-transform group-hover:scale-105" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => setPopupOpen(false)} 
                        className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm hover:shadow flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
            {mounted && (
        <Transition appear show={popupEditOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setPopupEditOpen(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            </Transition.Child>
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl transform transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <Dialog.Title className="text-2xl font-bold text-gray-800">Edit User</Dialog.Title>
                    <button 
                      onClick={() => setPopupEditOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form className="space-y-6" onSubmit={handleEditSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input 
                          type="text" 
                          placeholder="Masukkan nama" 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          disabled 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                          type="email" 
                          placeholder="Masukkan email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                          type="password" 
                          placeholder="Masukkan password" 
                          value="**********"
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select 
                          value={formData.role_id} 
                          onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white" 
                          required
                        >
                          <option value="">Pilih Role</option>
                          {roleList.map((r) => (
                            <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileUpload} 
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                            />
                          </div>
                          {preview && (
                            <div className="relative group">
                              <img 
                                src={preview} 
                                alt="Preview" 
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm transition-transform group-hover:scale-105" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => setPopupEditOpen(false)} 
                        className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm hover:shadow flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default UserList;