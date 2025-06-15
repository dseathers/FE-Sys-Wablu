'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../../style/listissue.module.css';

const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('asc');

  const fetchUserList = async (sortField = '', sortOrder = 'asc', size = pageSize, page = pageNumber) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-user-list',
        {
          search: searchTerm,
          pageSize: size,
          pageNumber: page,
          orderBy: sortOrder,
          sortBy: sortField,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      setUserList(res.data.data);
      setTotalItems(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch User List:', error);
    }
  };

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

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPageNumber(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
        </div>
    <div className="flex justify-end mb-4 px-8">
        <button
            onClick={() => router.push('/user/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow"
        >
            +
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
                  <td>{user.team_name}</td>
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
    </div>
  );
};

export default UserList;