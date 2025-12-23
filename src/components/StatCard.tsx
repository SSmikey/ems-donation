import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string;
  color: 'cyan' | 'purple' | 'red';
}

export default function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.valueSection}>
          <span className={styles.value}>{value}</span>
        </div>
      </div>
      <div className={`${styles.progressBar} ${styles[color]}`}></div>
    </div>
  );
}
