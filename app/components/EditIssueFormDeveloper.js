'use client'


import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../style/createissue.module.css';
import TiptapEditor from './tiptapeditor/page';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditIssueFormDeveloper = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const issueid = searchParams.get('issueid');

  const [loginData, setLoginData] = useState(null);
  const [developerList, setDeveloperList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);

  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [title, setTitle] = useState('');
  const [issueNo, setIssueNo] = useState('');
  const [issueId, setIssueId] = useState('');
  const [content, setContent] = useState('');
  const [remarks, setRemarks] = useState('');
  const [requestor, setRequestor] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [path, setPath] = useState('');

  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchIssueDtl = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.post(
          'http://127.0.0.1:8000/api/get-transaction-dtl',
          { id, issueid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        const d = res.data.data[0];
        setData(d);

        // Set nilai awal form
        setIssueId(d.issueid);
        setIssueNo(d.issue_no);
        setRequestor(d.requestor_id || '');
        setSelectedDeveloper(d.acceptor_id || '');
        setSelectedStatus(d.status_id || '');
        setSelectedPriority(d.priority_id || '');
        setTitle(d.title || '');
        setContent(d.content || '');
        setRemarks(d.remarks || '');
        setPath(d.path || '');
        setCreatedBy(d.created_by_id || '');
      } catch (error) {
        console.error('Gagal mengambil detail:', error);
      }
    };
    fetchIssueDtl();
  }, [id, issueid]);

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

  useEffect(() => {
    const email = Cookies.get('email');
    if (email) {
      axios.post('http://127.0.0.1:8000/api/get-login-info', { email })
        .then(res => setLoginData(res.data.data[0]))
        .catch(err => console.error('Failed to get login data:', err));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData) {
      toast.error('Login data not loaded.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/user-transaction', {
        id,
        issueid: issueId,
        issue_no: issueNo,
        title,
        requestor: selectedDeveloper,
        acceptor: requestor,
        status: selectedStatus,
        priority_id: selectedPriority,
        content,
        remarks,
        path,
        created_by: selectedDeveloper
      });

      toast.success('Submitted successfully! 🎉');
      setTimeout(() => {
        router.push('/developer/list-issue');
      }, 2000);
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error('Failed to submit issue 😢');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1 className={styles.heading}>Edit Issue</h1>

        <div className={styles.formRow}>
          <div className={styles.formColumn}>
            <label className={styles.label}>Team Name</label>
            <input
              type="text"
              value={data?.requestor || ''}
              disabled
              className={styles.input}
            />
          </div>
          <div className={styles.formColumn}>
            <label className={styles.label}>Assign To (Developer)</label>
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              required
              className={styles.select}
              disabled
            >
              <option value="">Select Developer</option>
              {developerList.map(dev => (
                <option key={dev.team_id} value={dev.team_id}>{dev.team_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formColumn}>
            <label className={styles.label}>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select Status</option>
              {statusList.map(status => (
                <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formColumn}>
            <label className={styles.label}>Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              required
              className={styles.select}
              disabled
            >
              <option value="">Select Priority</option>
              {priorityList.map(priority => (
                <option key={priority.priority_id} value={priority.priority_id}>{priority.priority_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label}>Content</label>
          <div className={styles.editorContainer}>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div>
          <label className={styles.label}>Link</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label}>Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className={styles.textarea}
          />
        </div>

        <button type="submit" className={styles.button}>Submit Issue</button>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default EditIssueFormDeveloper;
