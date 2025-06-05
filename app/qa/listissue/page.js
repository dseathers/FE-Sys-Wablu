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

  const fetchLoginInfo = async (email) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/get-login-info', { email });
      setLoginData(res.data.data[0]);
    } catch (err) {
      console.error('Failed to get login data:', err);
    }
  };

  const fetchIssues = async (teamId) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-transaction-by-requestor',
        { created_by_id: teamId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      setIssues(res.data.data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  };

  useEffect(() => {
    const email = Cookies.get('email');
    if (email) fetchLoginInfo(email);
  }, []);

  useEffect(() => {
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id);
    }
  }, [loginData]);

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

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>Created By</th>
              <th>Title</th>
              <th>Requestor</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {issues.map((issue, index) => (
              <tr key={index}>
                <td>{issue.created_by}</td>
                <td>{issue.title}</td>
                <td>{issue.requestor}</td>
                <td>{issue.acceptor}</td>
                <td><span className={`${styles.statusBadge} ${styles.statusOpen}`}>{issue.status}</span></td>
                <td><span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{issue.priority}</span></td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleView(issue.created_by_id, issue.issueid)}
                  >
                    View
                  </button>
                  <button className={styles.actionButton}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup View */}
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
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
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Requestor</label>
                      <input
                        type="text"
                        value={popupData[0].requestor || '-'}
                        disabled
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={popupData[0].acceptor || '-'}
                        disabled
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <div className={`status-badge ${popupData[0].status?.toLowerCase().replace(' ', '-')}`}
                        style={{marginTop: '4px', marginBottom: '2px'}}>
                        {popupData[0].status || '-'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <div className={`priority-badge ${popupData[0].priority?.toLowerCase().replace(' ', '-')}`}
                        style={{marginTop: '4px', marginBottom: '2px'}}>
                        {popupData[0].priority || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={popupData[0].title || '-'}
                      disabled
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                    <div
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 min-h-[150px] text-gray-700 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: popupData[0].content || '-' }}
                    />
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                    <textarea
                      value={popupData[0].remarks || '-'}
                      disabled
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={() => setPopupOpen(false)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      Close
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-red-500 text-lg font-medium bg-red-50 p-4 rounded-lg border border-red-200">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p>Data tidak tersedia.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default ListIssuePage;
