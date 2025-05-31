'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { ClipboardList, List, LogOut, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CreateIssue from '../content/qa/createissue/page';
import ListIssue from '../content/qa/listissue/Listissue';
import styles from '../style/qa.module.css';

const Qa = () => {
  const [activePage, setActivePage] = useState("task");
  const [loginData, setLoginData] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    const roleId = Cookies.get('role_id');
  
    if (!token || roleId !== 'qa_tester') {
      router.push('/login');
    }
  }, []);

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

  useEffect(() => {
    if (activePage === "createissue" && loginData) {
      setSelectedComponent(<CreateIssue loginData={loginData} />);
    } else if (activePage === "listissue") {
      setSelectedComponent(<ListIssue loginData={loginData}/>);
    } else if (activePage === "task") {
      setSelectedComponent(
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">My Tasks</h1>
          <p className="text-gray-600">Your tasks will appear here</p>
        </div>
      );
    }
  }, [activePage, loginData]);

  const handleLogout = async () => {
    const token = Cookies.get('token');
    try {
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Cookies.remove('token');
      Cookies.remove('email');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.profileSection}>
          <img 
            className={styles.profileImage} 
            src="/profile.jpg" 
            alt="User Profile" 
          />
          <button 
            className={`${styles.menuButton} ${activePage === 'createissue' ? styles.active : ''}`}
            onClick={() => setActivePage('createissue')} 
            title="Create Issue"
          >
            <Plus size={24} />
          </button>
          <button 
            className={`${styles.menuButton} ${activePage === 'listissue' ? styles.active : ''}`}
            onClick={() => setActivePage('listissue')} 
            title="List Issue"
          >
            <List size={24} />
          </button>
          <button 
            className={`${styles.menuButton} ${activePage === 'task' ? styles.active : ''}`}
            onClick={() => setActivePage('task')} 
            title="My Task"
          >
            <ClipboardList size={24} />
          </button>
        </div>

        <Popup
          trigger={
            <button className={styles.logoutButton} title="Logout">
              <LogOut size={24} />
            </button>
          }
          modal
          nested
          contentStyle={{
            borderRadius: '0px',
            padding: '0px',
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            overflow: 'visible',
          }}
          overlayStyle={{
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          {close => (
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Are you sure you want to logout?</h2>
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={close}
                >
                  No
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={() => {
                    handleLogout();
                    close();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          )}
        </Popup>
      </div>

      <div className={styles.mainContent}>
        {selectedComponent}
      </div>
    </div>
  );
};

export default Qa;
