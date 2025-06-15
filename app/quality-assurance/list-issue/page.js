'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../../style/listissue.module.css';
import 'reactjs-popup/dist/index.css';
import dynamic from 'next/dynamic';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react'

const Popup = dynamic(() => import('reactjs-popup'), { ssr: false });
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

  const [developerList, setDeveloperList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);

  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    setMounted(true);
  }, []);

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
        acceptor_id: teamId,
        search: searchTerm,
        status: selectedStatus,
        priority: selectedPriority,
        assignee: selectedDeveloper,
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
    setTotalItems(res.data.total || res.data.totalItems || 0);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
  }
};

const handleFilterChange = (field, value) => {
  let updatedStatus = selectedStatus;
  let updatedPriority = selectedPriority;
  let updatedAssignee = selectedDeveloper;

  if (field === 'status') {
    setSelectedStatus(value);
    updatedStatus = value;
  }
  if (field === 'priority') {
    setSelectedPriority(value);
    updatedPriority = value;
  }
  if (field === 'assignee') {
    setSelectedDeveloper(value);
    updatedAssignee = value;
  }

  if (loginData?.team_id) {
    fetchIssuesWithFilter(loginData.team_id, updatedStatus, updatedPriority, updatedAssignee);
  }
};

const fetchIssuesWithFilter = async (teamId, status, priority, assignee, sortField = '', sortOrder = 'asc', size = pageSize, page = pageNumber) => {
  const token = Cookies.get('token');
  try {
    const res = await axios.post(
      'http://127.0.0.1:8000/api/get-transaction-by-requestor',
      {
        created_by_id: teamId,
        acceptor_id: teamId,
        search: searchTerm,
        status,
        priority,
        assignee,
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
    setTotalItems(res.data.total || res.data.totalItems || 0);
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
  const delayDebounce = setTimeout(() => {
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, sortBy, orderBy);
    }
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [searchTerm]);

  useEffect(() => {
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id, sortBy, orderBy);
    }
  }, [loginData, sortBy, orderBy]);

    useEffect(() => {
      axios.get('http://127.0.0.1:8000/api/user-dev-ddl')
        .then(res => setDeveloperList(res.data))
        .catch(err => console.error('Failed to fetch developers:', err));
  
      axios.get('http://127.0.0.1:8000/api/issue-status-ddl')
        .then(res => setStatusList(res.data))
        .catch(err => console.error('Failed to fetch status list:', err));
  
      axios.get('http://127.0.0.1:8000/api/issue-priority-ddl')
        .then(res => setPriorityList(res.data))
        .catch(err => console.error('Failed to fetch priority list:', err));
    }, []);

  const handleView = async (createdById, issueId, id) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-transaction-by-requestor-dtl',
        {
          created_by_id: createdById,
          issueid: issueId,
          id: id
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
      <div className="flex flex-wrap gap-4 items-center bg-white rounded-xl shadow-md px-8 py-5 mb-6 mt-6 w-full">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
        />
        <select className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white min-w-[150px] transition"
          value={selectedStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">Status</option>
          {statusList.map(status => (
            <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
          ))}
    
        </select>
        <select className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white min-w-[150px] transition"
          value={selectedPriority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}>
          <option value="">Priority</option>
          {priorityList.map(priority => (
            <option key={priority.priority_id} value={priority.priority_id}>{priority.priority_name}</option>
          ))}

        </select>
        <select className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white min-w-[150px] transition"
          value={selectedDeveloper}
          onChange={(e) => handleFilterChange('assignee', e.target.value)}>
          <option value="">Assignee</option>
          {developerList.map(dev => (
            <option key={dev.team_id} value={dev.team_id}>{dev.team_name}</option>
          ))}
        </select>
      </div>

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
            {Array.isArray(issues) && issues.length > 0 ? (
              issues.map((issue, index) => (
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
                    <button className={styles.actionButton} onClick={() => handleView(issue.created_by_id, issue.issueid, issue.id)}>View</button>
                    <button className={styles.actionButton} onClick={() => router.push(`/quality-assurance/edit-issue?id=${issue.id}&issueid=${issue.issueid}`)}>Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500 font-medium">
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
      {/* Popup can stay as-is or be added back */}
   {mounted && (
        <Transition appear show={popupOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setPopupOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
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
                <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-0 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                      <Dialog.Title as="h2" className="text-2xl font-bold text-white">Issue Details</Dialog.Title>
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
                    {Array.isArray(popupData) && popupData.length > 0 ? (
                      <form className="space-y-8">
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
                        <div className="grid grid-cols-2 gap-8 mb-6">
                          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                            <label className="block text-sm font-semibold mb-2">Status</label>
                            <div className={`status-badge ${popupData[0].status?.toLowerCase().replace(/\s+/g, '-')}`}>{popupData[0].status || '-'}</div>
                          </div>
                          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                            <label className="block text-sm font-semibold mb-2">Priority</label>
                            <div className={`priority-badge ${popupData[0].priority?.toLowerCase().replace(/\s+/g, '-')}`}>{popupData[0].priority || '-'}</div>
                          </div>
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-2">Title</label>
                          <input type="text" value={popupData[0].title || '-'} disabled className="w-full px-4 py-2.5 rounded-lg border" />
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-2">Content</label>
                          <div className="w-full bg-white border rounded-lg px-4 py-3 min-h-[150px] text-gray-700 prose" dangerouslySetInnerHTML={{ __html: popupData[0].content || '-' }} />
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-2">Remarks</label>
                          <textarea value={popupData[0].remarks || '-'} disabled className="w-full px-4 py-3 rounded-lg border" />
                        </div>
                        <div className="flex justify-end">
                          <button type="button" onClick={() => setPopupOpen(false)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">Close</button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-8 text-red-600 font-medium">Data tidak tersedia.</div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default ListIssuePage;
