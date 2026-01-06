import styles from './SocialCard.module.css';

interface SocialCardProps {
  platform: 'facebook' | 'twitter' | 'google';
  likes: number;
  percentage: number;
  target: number;
  duration: number;
}

export default function SocialCard({
  likes,
  percentage,
  target,
  duration,
}: SocialCardProps) {

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.likes}>{likes.toLocaleString()}</div>
          <div className={styles.likeLabel}>
            +{percentage.toFixed(1)}% Total Likes
          </div>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Target:{target.toLocaleString()}</span>
          <span>Duration:{duration}</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
}
