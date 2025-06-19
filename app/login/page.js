'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../style/login.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/role-ddl');
        setRoles(response.data.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = { email, password, role_id: roleId };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/user-login', loginData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Login Response:', response.data);

      const token = response.data.token;

      Cookies.set('email', email);
      Cookies.set('token', token);
      Cookies.set('role_id', roleId);

      if (roleId === 'dev') {
        router.push('/developer');
      } else if (roleId === 'qa_tester') {
        router.push('/quality-assurance');
      } else if (roleId === 'admin') {
        router.push('/admin');
      }

      toast.success("Login successful!");

    } catch (error) {
      console.error('Error submitting login:', error.response?.data || error.message);

      toast.error("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.imageSection}>
        <Image
          src="/images/login-illustration.svg"
          alt="Login Illustration"
          width={500}
          height={500}
          priority
        />
      </div>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Welcome Back!</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={styles.input}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
