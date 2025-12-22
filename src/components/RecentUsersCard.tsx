import styles from './RecentUsersCard.module.css';

interface DonationActivity {
  id: number;
  donorName: string;
  item: string;
  time: string;
  status: 'อนุมัติ' | 'ตรวจสอบ';
}

const recentActivities: DonationActivity[] = [
  {
    id: 1,
    donorName: 'สุขรอม มีศธร',
    item: 'บริจาคข้าวสาร 500 กก.',
    time: '22 ธ.ค. 14:30',
    status: 'อนุมัติ',
  },
  {
    id: 2,
    donorName: 'คาเหบ บัญลาองค์',
    item: 'บริจาคคชุดเวชภัณฑ์ 100 กล่อง',
    time: '22 ธ.ค. 13:15',
    status: 'ตรวจสอบ',
  },
  {
    id: 3,
    donorName: 'ลายอัด เต็มลึก',
    item: 'บริจาคน้ำดื่ม 1,000 แพ็ค',
    time: '22 ธ.ค. 12:45',
    status: 'อนุมัติ',
  },
];

export default function RecentUsersCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>กิจกรรมการบริจาคล่าสุด</h3>
      <div className={styles.usersList}>
        {recentActivities.map((activity) => (
          <div key={activity.id} className={styles.userItem}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>📦</div>
              <div className={styles.details}>
                <p className={styles.name}>{activity.donorName}</p>
                <p className={styles.description}>{activity.item}</p>
              </div>
            </div>
            <div className={styles.userActions}>
              <span className={styles.time}>{activity.time}</span>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.actionBtn} ${activity.status === 'อนุมัติ' ? styles.approve : styles.reject}`}
                >
                  {activity.status}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
