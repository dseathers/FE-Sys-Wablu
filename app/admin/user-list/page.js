'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../../style/listissue.module.css';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  useEffect(() => setMounted(true), []);

  const fetchUserList = async (sortField = '', sortOrder = 'asc', size = pageSize, page = pageNumber) => {
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
                <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-2xl font-bold mb-4 text-blue-700">Tambah User</Dialog.Title>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Nama" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border" required />
                    <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border" required />
                    <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-lg border" required />
                    <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-white" required>
                      <option value="">Pilih Role</option>
                      {roleList.map((r) => (
                        <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-4">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full" />
                      {preview && <img src={preview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={() => setPopupOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Batal</button>
                      <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
    </div>
  );
};

export default UserList;