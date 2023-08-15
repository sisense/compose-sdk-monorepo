import styles from './AlertBox.module.scss';

interface Props {
  alerts: string[];
}

export const AlertBox = ({ alerts = [] }: Props) => {
  return (
    <div className={styles.alert_box}>
      <div className={styles.content}>
        {
          // prevents alert duplication
          [...new Set(alerts)].map((alert, i) => (
            <div className={styles.alert} key={`alert-${i}`}>
              {alert}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default AlertBox;
