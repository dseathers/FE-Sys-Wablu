'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Popup = dynamic(() => import('reactjs-popup'), { ssr: false });

export default function DeveloperListIssue() {
  const [issues, setIssues] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('asc');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/issue-status-ddl')
      .then(res => setStatusList(res.data))
      .catch(err => console.error('Failed to fetch status list:', err));

    axios.get('http://127.0.0.1:8000/api/issue-priority-ddl')
      .then(res => setPriorityList(res.data))
      .catch(err => console.error('Failed to fetch priority list:', err));
  }, []);

  const fetchIssues = async (teamId) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/get-transaction-by-assignee',
        {
          assignee_id: teamId,
          search: searchTerm,
          status: selectedStatus,
          priority: selectedPriority,
          pageSize: pageSize,
          pageNumber: pageNumber,
          orderBy: orderBy,
          sortBy: sortBy,
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
    if (field === 'status') {
      setSelectedStatus(value);
    }
    if (field === 'priority') {
      setSelectedPriority(value);
    }

    const loginData = JSON.parse(Cookies.get('loginData'));
    if (loginData?.team_id) {
      fetchIssues(loginData.team_id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrderBy(orderBy === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrderBy('asc');
    }
  };

  const handleView = async (createdById, issueId, id) => {
    const token = Cookies.get('token');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/get-transaction-detail',
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
      // Handle the response data as needed
      console.log(response.data);
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">List Issue</h1>
        <button
          onClick={() => router.push('/developer/create-issue')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Issue
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            <select
              className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white min-w-[150px] transition"
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Status</option>
              {statusList.map(status => (
                <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
              ))}
            </select>
            <select
              className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white min-w-[150px] transition"
              value={selectedPriority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Priority</option>
              {priorityList.map(priority => (
                <option key={priority.priority_id} value={priority.priority_id}>{priority.priority_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('issueid')}
                >
                  Issue ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.issueid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.created_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => handleView(issue.created_by_id, issue.issueid, issue.id)}
                    >
                      View
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => router.push(`/developer/edit-issue?id=${issue.id}&issueid=${issue.issueid}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalItems)} of {totalItems} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                disabled={pageNumber === 1}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPageNumber(page => Math.min(totalPages, page + 1))}
                disabled={pageNumber === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 