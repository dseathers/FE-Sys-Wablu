'use client';

import styles from '../../../style/listissue.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ListIssue = ({ loginData }) => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('token');

      if (!loginData || !loginData.team_id || !token) {
        console.warn('Missing loginData or token.');
        return;
      }

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/get-transaction-by-requestor',
          { requestor_id: loginData.team_id },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        setIssues(response.data.data);
      } catch (error) {
        console.error('Failed to fetch transaction by requestor:', error.response?.data || error.message);
      }
    };

    fetchData();
  }, [loginData]);

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
        <select className={styles.dropdown}>
          <option value="">Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
        <select className={styles.dropdown}>
          <option value="">Assigned To</option>
          {[...new Set(issues.map(issue => issue.acceptor))].map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <select className={styles.dropdown}>
          <option value="">Priority</option>
          <option value="Low">Low</option>
          <option value="Mid">Mid</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
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
                <td>{issue.title}</td>
                <td>{issue.requestor}</td>
                <td>{issue.acceptor}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles.statusOpen}`}>{issue.status}</span>
                </td>
                <td>
                  <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{issue.priority}</span>
                </td>
                <td>
                  <button className={styles.actionButton}>View</button>
                  <button className={styles.actionButton}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button className={styles.pageButton}>Previous</button>
          <button className={`${styles.pageButton} ${styles.active}`}>1</button>
          <button className={styles.pageButton}>2</button>
          <button className={styles.pageButton}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ListIssue;
