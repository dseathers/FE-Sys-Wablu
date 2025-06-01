'use client';

import styles from '../../../style/listissue.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';


const ListIssue = ({ loginData }) => {
  const [issues, setIssues] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('token');
      if (!loginData || !loginData.team_id || !token) return;

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/get-transaction-by-requestor',
          { created_by_id: loginData.team_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        setIssues(response.data.data);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      }
    };

    fetchData();
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
      {/* Filter... (same as before) */}

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
    borderRadius: '12px',
    padding: '0',
    border: 'none',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'fadeIn 0.3s ease-out',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none' // IE 10+
  }}
>
  <div className="bg-white rounded-lg" style={{ height: '100%', overflow: 'auto' }}>
    <style>{`
      .popup-content::-webkit-scrollbar { display: none; }
    `}</style>
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-lg sticky top-0 z-10">
      <h2 className="text-2xl font-bold text-white">Issue Details</h2>
    </div>

    <div className="p-4">
      {popupData && popupData.length > 0 ? (
        <form className="space-y-4">
          {/* Row: Requestor & Acceptor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Requestor</label>
              <input
                type="text"
                value={popupData[0].requestor || '-'}
                disabled
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To (Developer)</label>
              <input
                type="text"
                value={popupData[0].acceptor || '-'}
                disabled
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row: Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={popupData[0].status || '-'}
                disabled
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <input
                type="text"
                value={popupData[0].priority || '-'}
                disabled
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Title */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={popupData[0].title || '-'}
              disabled
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
            <div
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 min-h-[100px] text-gray-700"
              dangerouslySetInnerHTML={{ __html: popupData[0].content || '-' }}
            />
          </div>

          {/* Remarks */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              value={popupData[0].remarks || '-'}
              disabled
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setPopupOpen(false)}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Close
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6">
          <p className="text-red-500 text-lg font-medium">Data tidak tersedia.</p>
        </div>
      )}
    </div>
  </div>
</Popup>

      </div>
    </div>
  );
};

export default ListIssue;
