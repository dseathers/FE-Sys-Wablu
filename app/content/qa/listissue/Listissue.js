import styles from '../../../style/listissue.module.css';

const ListIssue = () => {
  const issues = [
    { id: 1, requestor: "John Doe", title: "Bug UI Login", status: "Open", assignedTo: "Asep Basuki", priority: "High" },
    { id: 2, requestor: "Jane Smith", title: "Error API Response", status: "In Progress", assignedTo: "Budi Santoso", priority: "Medium" },
    { id: 3, requestor: "Ali Akbar", title: "Database Connection Issue", status: "Open", assignedTo: "Siti Aminah", priority: "Critical" },
    { id: 4, requestor: "Lisa Widodo", title: "Layout Overlap", status: "Resolved", assignedTo: "Dewi Lestari", priority: "Low" },
    { id: 5, requestor: "Doni Pratama", title: "Crash on Android", status: "Open", assignedTo: "Eko Saputra", priority: "High" },
    { id: 6, requestor: "Fajar Rahman", title: "Session Timeout", status: "In Progress", assignedTo: "Fajar Rahman", priority: "Medium" },
    { id: 7, requestor: "Gita Pratiwi", title: "Button Not Clickable", status: "Resolved", assignedTo: "Gita Pratiwi", priority: "Low" },
    { id: 8, requestor: "Hadi Sucipto", title: "404 Page Not Found", status: "Open", assignedTo: "Hadi Sucipto", priority: "High" },
    { id: 9, requestor: "Indah Permata", title: "Memory Leak Detected", status: "In Progress", assignedTo: "Indah Permata", priority: "Critical" },
    { id: 10, requestor: "Joko Widodo", title: "Email Not Sending", status: "Resolved", assignedTo: "Joko Widodo", priority: "Medium" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
        <select className={styles.dropdown}>
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select className={styles.dropdown}>
          <option value="">Assigned To</option>
          {[...new Set(issues.map(issue => issue.assignedTo))].map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <select className={styles.dropdown}>
          <option value="">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Requestor</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td>{issue.id}</td>
                <td>{issue.title}</td>
                <td>{issue.requestor}</td>
                <td>{issue.assignedTo}</td>
                <td><span className={`${styles.statusBadge} ${styles.statusOpen}`}>{issue.status}</span></td>
                <td><span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{issue.priority}</span></td>
                <td>
                  <button className={styles.actionButton}>View</button>
                  <button className={styles.actionButton}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className={styles.pagination}>
          <button className={styles.pageButton}>Previous</button>
          <button className={`${styles.pageButton} ${styles.active}`}>1</button>
          <button className={styles.pageButton}>2</button>
          <button className={styles.pageButton}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ListIssue;