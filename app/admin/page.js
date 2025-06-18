'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Bar,  Pie  } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement 
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [loginData, setLoginData] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    activeIssues: 0,
    resolvedIssues: 0
  });
  const [issueStatusStats, setIssueStatusStats] = useState([]);
  const [userSummaryStats, setUserSummaryStats] = useState([]);

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

     const fetchUserSummary = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/get-dashboard-user-summary', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
        });
        setUserSummaryStats(res.data);
      } catch (err) {
        console.error('Failed to fetch user summary:', err);
      }
    };

    fetchUserSummary();
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
          <div 
            key={index} 
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{item.status_name}</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {item.actual_issue_count}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
        {/* <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Issue Status Distribution</span>
        </h3> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] bg-white/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <Bar
              data={{
                labels: issueStatusStats.map(item => item.status_name),
                datasets: [
                  {
                    label: 'Number of Issues',
                    data: issueStatusStats.map(item => item.actual_issue_count),
                    backgroundColor: [
                      '#3B82F6',
                      '#EC4899',
                      '#10B981',
                      '#F59E0B',
                      '#8B5CF6',
                      '#06B6D4',
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40,
                    maxBarThickness: 45,
                    hoverBackgroundColor: [
                      '#2563EB',
                      '#BE185D',
                      '#047857',
                      '#B45309',
                      '#6D28D9',
                      '#0E7490',
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1F2937',
                    bodyColor: '#4B5563',
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                      family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                      size: 13,
                      family: "'Inter', sans-serif"
                    },
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                      label: function(context) {
                        return `Issues: ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                      lineWidth: 1
                    },
                    ticks: {
                      stepSize: 1,
                      font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                      },
                      padding: 10,
                      color: '#6B7280'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: '600',
                        family: "'Inter', sans-serif"
                      },
                      padding: 10,
                      color: '#4B5563'
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart',
                  onProgress: function(animation) {
                    const chart = animation.chart;
                    const ctx = chart.ctx;
                    const dataset = chart.data.datasets[0];
                    const meta = chart.getDatasetMeta(0);

                    meta.data.forEach((bar, index) => {
                      const data = dataset.data[index];
                      const x = bar.x;
                      const y = bar.y;
                      
                      ctx.save();
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'bottom';
                      ctx.font = 'bold 12px Inter';
                      ctx.fillStyle = '#1F2937';
                      ctx.fillText(data, x, y - 5);
                      ctx.restore();
                    });
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                layout: {
                  padding: {
                    top: 20
                  }
                }
              }}
            />
          </div>
          <div className="h-[400px] bg-white/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
            {/* <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">User Role Distribution</span>
            </h3> */}
            <Pie
              data={{
                labels: userSummaryStats.map(item => item.role_name),
                datasets: [
                  {
                    label: 'Jumlah',
                    data: userSummaryStats.map(item => item.summary),
                    backgroundColor: [
                      '#3B82F6',
                      '#EC4899',
                      '#10B981',
                      '#F59E0B',
                      '#8B5CF6',
                      '#06B6D4',
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 20,
                    hoverBorderWidth: 4,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: {
                        size: 13,
                        family: "'Inter', sans-serif",
                        weight: '500'
                      },
                      color: '#4B5563',
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1F2937',
                    bodyColor: '#4B5563',
                    titleFont: { 
                      size: 14,
                      family: "'Inter', sans-serif",
                      weight: 'bold'
                    },
                    bodyFont: { 
                      size: 13,
                      family: "'Inter', sans-serif"
                    },
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.raw} users (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true,
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
