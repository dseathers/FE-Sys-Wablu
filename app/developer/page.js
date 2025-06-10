'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function DeveloperDashboard() {
  const [loginData, setLoginData] = useState(null);
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    completedIssues: 0
  });

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
    const fetchStats = async () => {
      const token = Cookies.get('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/developer-dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          params: {
            team_id: loginData.team_id
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, [loginData]);

  if (!loginData) {
    return <p>Loading login data...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
      <p className="text-gray-600">Welcome, {loginData.team_name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Issues</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Open Issues</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.openIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.inProgressIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats.completedIssues}</p>
        </div>
      </div>
    </div>
  );
}
