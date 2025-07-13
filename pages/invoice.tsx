import { useRouter } from 'next/router';
import styles from '../styles/Invoice.module.css';

interface Item {
  id: number;
  name: string;
  stock: number;
}

export default function Invoice() {
  const router = useRouter();
  const { items: itemsQuery } = router.query;
  const items: Item[] = itemsQuery ? JSON.parse(itemsQuery as string) : [];

  return (
    <div className={styles.container}>
      <h1>Invoice</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.name}</td>
              <td className={styles.td}>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
