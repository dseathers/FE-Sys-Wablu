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
<Popup open={popupOpen} onClose={() => setPopupOpen(false)} modal nested>
  <div className="p-6 bg-white rounded shadow max-w-3xl w-full">
    <h2 className="text-2xl font-semibold mb-6">View Issue</h2>

    {popupData && popupData.length > 0 ? (
      <form className="space-y-4">
        {/* Row: Requestor & Acceptor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Requestor</label>
            <input
              type="text"
              value={popupData[0].requestor || '-'}
              disabled
              className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Assign To (Developer)</label>
            <input
              type="text"
              value={popupData[0].acceptor || '-'}
              disabled
              className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Row: Status & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <input
              type="text"
              value={popupData[0].status || '-'}
              disabled
              className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Priority</label>
            <input
              type="text"
              value={popupData[0].priority || '-'}
              disabled
              className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={popupData[0].title || '-'}
            disabled
            className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium">Content</label>
          <div
            className="w-full mt-1 border rounded px-3 py-2 bg-gray-100 min-h-[100px]"
            dangerouslySetInnerHTML={{ __html: popupData[0].content || '-' }}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium">Remarks</label>
          <textarea
            value={popupData[0].remarks || '-'}
            disabled
            className="w-full mt-1 border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div className="text-right mt-4">
          <button
            type="button"
            onClick={() => setPopupOpen(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </form>
    ) : (
      <p className="text-red-500">Data tidak tersedia.</p>
    )}
  </div>
</Popup>

      </div>
    </div>
  );
};

export default ListIssue;
