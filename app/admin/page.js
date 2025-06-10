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
    fetchStats();
  }, [loginData]);

  if (!loginData) {
    return <p>Loading login data...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {loginData.team_name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Issues</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.totalIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Issues</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.activeIssues}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Resolved Issues</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats.resolvedIssues}</p>
        </div>
      </div>
    </div>
  );
}
