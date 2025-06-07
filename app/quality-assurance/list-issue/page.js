'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../../style/listissue.module.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const ListIssuePage = () => {
  const [loginData, setLoginData] = useState(null);
  const [issues, setIssues] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLoginInfo = async (email) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/get-login-info', { email });
      setLoginData(res.data.data[0]);
    } catch (err) {
      console.error('Failed to get login data:', err);
    }
  };

const fetchIssues = async (teamId, sortField = '', sortOrder = 'asc', size = pageSize, page = pageNumber) => {
  const token = Cookies.get('token');
  try {
    const res = await axios.post(
      'http://127.0.0.1:8000/api/get-transaction-by-requestor',
      {
        created_by_id: teamId,
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
    setIssues(res.data.data);
    setTotalItems(res.data.total || res.data.totalItems || 0); // pastikan backend mengembalikan total
  } catch (error) {
    console.error('Failed to fetch issues:', error);
  }
};

  const handleSort = (field) => {
    const newOrder = sortBy === field && orderBy === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setOrderBy(newOrder);
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, field, newOrder);
    }
  };

  const handlePageChange = (page) => {
    setPageNumber(page);
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, sortBy, orderBy, pageSize, page);
    }
  };

  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPageNumber(0);
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, sortBy, orderBy, size, 0);
    }
  };

  useEffect(() => {
    const email = Cookies.get('email');
    if (email) fetchLoginInfo(email);
  }, []);

  useEffect(() => {
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, sortBy, orderBy);
    }
  }, [loginData, sortBy, orderBy]);

  const handleView = async (createdById, issueId) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-transaction-by-requestor-dtl',
        {
          created_by_id: createdById,
          issueid: issueId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      setPopupData(res.data.data);
      setPopupOpen(true);
    } catch (err) {
      console.error('Gagal mengambil detail:', err);
      setPopupData(null);
      setPopupOpen(true);
    }
  };

    const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th><span className={styles.thContent}>Issue No
                <button 
                  className={`${styles.sortButton} ${sortBy === 'issue_no' ? styles.active : ''} ${sortBy === 'issue_no' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('issue_no')}
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
              <th><span className={styles.thContent}>Created By
                <button 
                  className={`${styles.sortButton} ${sortBy === 'created_by' ? styles.active : ''} ${sortBy === 'created_by' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('created_by')}
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
              <th><span className={styles.thContent}>Title
                <button 
                  className={`${styles.sortButton} ${sortBy === 'title' ? styles.active : ''} ${sortBy === 'title' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('title')}
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
              <th><span className={styles.thContent}>Requestor
                <button 
                  className={`${styles.sortButton} ${sortBy === 'requestor' ? styles.active : ''} ${sortBy === 'requestor' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('requestor')}
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
              <th><span className={styles.thContent}>Assigned To
                <button 
                  className={`${styles.sortButton} ${sortBy === 'acceptor' ? styles.active : ''} ${sortBy === 'acceptor' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('acceptor')}
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
              <th><span className={styles.thContent}>Status
                <button 
                  className={`${styles.sortButton} ${sortBy === 'status' ? styles.active : ''} ${sortBy === 'status' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('status')}
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
              <th><span className={styles.thContent}>Priority
                <button 
                  className={`${styles.sortButton} ${sortBy === 'priority' ? styles.active : ''} ${sortBy === 'priority' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('priority')}
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
                  className={`${styles.sortButton} ${sortBy === 'created_at' ? styles.active : ''} ${sortBy === 'created_at' && orderBy === 'desc' ? styles.desc : ''}`}
                  onClick={() => handleSort('created_at')}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {issues.map((issue, index) => (
              <tr key={index}>
                <td>{issue.issue_no}</td>
                <td>{issue.created_by}</td>
                <td>{issue.title}</td>
                <td>{issue.requestor}</td>
                <td>{issue.acceptor}</td>
                <td><span className={`${styles.statusBadge} ${styles.statusOpen}`}>{issue.status}</span></td>
                <td><span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{issue.priority}</span></td>
                <td>{issue.created_at}</td>
                <td>
                  <button className={styles.actionButton} onClick={() => handleView(issue.created_by_id, issue.issueid)}>View</button>
                  <button className={styles.actionButton}>Edit</button>
                </td>
              </tr>
            ))}
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
      {/* Popup can stay as-is or be added back */}
<Popup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        modal
        nested
        overlayStyle={{ background: 'rgba(0, 0, 0, 0.5)' }}
        contentStyle={{
          borderRadius: '16px',
          padding: '0',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div className="bg-white rounded-lg" style={{ height: '100%', overflow: 'auto' }}>
          <style>{`
            .popup-content::-webkit-scrollbar { display: none; }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: capitalize;
            }
            .status-open { background-color: #E3F2FD; color: #1976D2; }
            .status-in-progress { background-color: #FFF3E0; color: #F57C00; }
            .status-closed { background-color: #E8F5E9; color: #2E7D32; }
            .priority-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: capitalize;
            }
            .priority-high { background-color: #FFEBEE; color: #D32F2F; }
            .priority-medium { background-color: #FFF3E0; color: #F57C00; }
            .priority-low { background-color: #E8F5E9; color: #2E7D32; }
          `}</style>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Issue Details</h2>
              <button
                onClick={() => setPopupOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {popupData && popupData.length > 0 ? (
              <form className="space-y-8">
                {/* Field Requestor & Acceptor */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold mb-2">Requestor</label>
                    <input type="text" value={popupData[0].requestor || '-'} disabled className="w-full px-4 py-2.5 rounded-lg border" />
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold mb-2">Assigned To</label>
                    <input type="text" value={popupData[0].acceptor || '-'} disabled className="w-full px-4 py-2.5 rounded-lg border" />
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <div className={`status-badge ${popupData[0].status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {popupData[0].status || '-'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold mb-2">Priority</label>
                    <div className={`priority-badge ${popupData[0].priority?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {popupData[0].priority || '-'}
                    </div>
                  </div>
                </div>

                {/* Title, Content, Remarks */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input type="text" value={popupData[0].title || '-'} disabled className="w-full px-4 py-2.5 rounded-lg border" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Content</label>
                  <div
                    className="w-full bg-white border rounded-lg px-4 py-3 min-h-[150px] text-gray-700 prose"
                    dangerouslySetInnerHTML={{ __html: popupData[0].content || '-' }}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Remarks</label>
                  <textarea value={popupData[0].remarks || '-'} disabled className="w-full px-4 py-3 rounded-lg border" />
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => setPopupOpen(false)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-red-600 font-medium">Data tidak tersedia.</div>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default ListIssuePage;
