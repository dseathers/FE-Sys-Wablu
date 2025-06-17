'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function AdminDashboard() {
  const [loginData, setLoginData] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    activeIssues: 0,
    resolvedIssues: 0
  });
  const [issueStatusStats, setIssueStatusStats] = useState([]);

  const fetchLoginInfo = async (email) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/get-login-info', {
        email: email,
      });
      setLoginData(response.data.data[0]);
    } catch (error) {
      console.error('Error fetching login info:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const userEmail = Cookies.get('email');
    if (userEmail) {
      fetchLoginInfo(userEmail);
    } else {
      console.error('No email found in cookies.');
    }
  }, []);

  useEffect(() => {
    if (!loginData) return;
    const token = Cookies.get('token');

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin-dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    const fetchIssueStatus = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/get-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
        });
        setIssueStatusStats(res.data);
      } catch (err) {
        console.error('Failed to fetch issue status stats:', err);
      }
    };

    fetchStats();
    fetchIssueStatus();
  }, [loginData]);

  if (!loginData) {
    return <p>Loading login data...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {loginData.team_name}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {issueStatusStats.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{item.status_name}</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{item.actual_issue_count}</p>
            </div>
          ))}
        </div>

    </div>
  );
}
