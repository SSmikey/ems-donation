import styles from './RatingCard.module.css';

export default function RatingCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Rating</h3>
      <div className={styles.ratingContainer}>
        <div className={styles.ratingValue}>4.7</div>
        <div className={styles.stars}>
          {'⭐'.repeat(5)}
        </div>
      </div>
      <div className={styles.ratingDetails}>
        <span>0.4</span>
        <span className={styles.trend}>▲</span>
      </div>
    </div>
  );
}
