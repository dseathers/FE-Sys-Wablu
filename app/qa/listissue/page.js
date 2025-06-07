<tbody className={styles.tableBody}>
  {Array.isArray(issues) && issues.length > 0 ? (
    issues.map((issue, index) => (
      <tr key={index}>
        <td>{issue.created_by}</td>
        <td>{issue.title}</td>
        <td>{issue.requestor}</td>
        <td>{issue.acceptor}</td>
        <td><span className={`${styles.statusBadge} ${styles.statusOpen}`}>{issue.status}</span></td>
        <td><span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{issue.priority}</span></td>
        <td>{issue.created_at}</td>
        <td>
          <button className={styles.actionButton} onClick={() => handleView(issue.created_by_id, issue.issueid)}>View</button>
          <button className={styles.actionButton}>Edit</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={8} className="text-center py-8 text-gray-400">
        No data found
      </td>
    </tr>
  )}
</tbody> 