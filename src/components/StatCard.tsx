import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string;
  percentage: number;
  trend: 'up' | 'down';
  color: 'cyan' | 'purple' | 'red';
}

export default function StatCard({
  title,
  value,
  percentage,
  trend,
  color,
}: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.valueSection}>
          <span className={styles.value}>{value}</span>
          <span className={`${styles.percentage} ${styles[trend]}`}>
            {trend === 'up' ? '↑' : '↓'} {percentage}%
          </span>
        </div>
      </div>
      <div className={`${styles.progressBar} ${styles[color]}`}></div>
    </div>
  );
}
