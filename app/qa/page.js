'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function TaskPage() {
  const [loginData, setLoginData] = useState(null);

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
      console.error("No email found in cookies.");
    }
  }, []);

  if (!loginData) {
    return <p>Loading login data...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Tasks</h1>
      <p className="text-gray-600">Welcome, {loginData.team_name}</p>
      <p className="text-gray-500">Your tasks will appear here.</p>
    </div>
  );
}
