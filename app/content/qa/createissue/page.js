import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from '../../../style/createissue.module.css';
import TiptapEditor from '../../../components/tiptapeditor/page';

const CreateIssue = ({ loginData }) => {
  const [developerList, setDeveloperList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);

  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [remarks, setRemarks] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://127.0.0.1:8000/api/user-transaction', {
        title: title,
        requestor: loginData?.team_id,
        acceptor: selectedDeveloper,
        status: selectedStatus,
        priority_id: selectedPriority,
        content: content,
        remarks: remarks,
        created_by: loginData?.team_id
      });

      alert('Issue submitted successfully');
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1 className={styles.heading}>Create Issue</h1>

        {/* Row: Team Name & Developer */}
        <div className={styles.formRow}>
          <div className={styles.formColumn}>
            <label className={styles.label}>Team Name</label>
            <input type="text" value={loginData?.team_name || 'Loading...'} disabled className={styles.input}/>
          </div>
          <div className={styles.formColumn}>
            <label className={styles.label}>Assign To (Developer)</label>
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select Developer</option>
              {developerList.map(dev => (
                <option key={dev.team_id} value={dev.team_id}>{dev.team_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Status & Priority */}
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
            >
              <option value="">Select Priority</option>
              {priorityList.map(priority => (
                <option key={priority.priority_id} value={priority.priority_id}>{priority.priority_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
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

        {/* Content (Tiptap) */}
<div>
  <label className={styles.label}>Content</label>
  <TiptapEditor content={content} onChange={setContent} />
</div>

        {/* Remarks */}
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
    </div>
  );
};

export default CreateIssue;
