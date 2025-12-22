import styles from './RecentUsersCard.module.css';

interface User {
  id: number;
  name: string;
  description: string;
  time: string;
  status: 'approve' | 'reject';
}

const recentUsers: User[] = [
  {
    id: 1,
    name: 'Isabella Christensen',
    description: 'Lorem Ipsum is simply dummy text of...',
    time: '11 MAY 12:56',
    status: 'approve',
  },
  {
    id: 2,
    name: 'Mathilde Andersen',
    description: 'Lorem Ipsum is simply dummy text of...',
    time: '11 MAY 10:35',
    status: 'reject',
  },
];

export default function RecentUsersCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Recent Users</h3>
      <div className={styles.usersList}>
        {recentUsers.map((user) => (
          <div key={user.id} className={styles.userItem}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>👤</div>
              <div className={styles.details}>
                <p className={styles.name}>{user.name}</p>
                <p className={styles.description}>{user.description}</p>
              </div>
            </div>
            <div className={styles.userActions}>
              <span className={styles.time}>{user.time}</span>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.actionBtn} ${styles.reject}`}
                >
                  Reject
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.approve}`}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
