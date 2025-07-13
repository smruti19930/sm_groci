import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Grocery.module.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  month: string;
  total_revenue: number;
  total_sales: number;
}

export default function Sales() {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    fetch('/api/sales')
      .then((res) => res.json())
      .then((data) => {
        const monthlySales: { [key: string]: SalesData } = {};
        data.forEach((sale: any) => {
          const month = new Date(sale.created_at).toLocaleString('default', { month: 'long' });
          if (!monthlySales[month]) {
            monthlySales[month] = {
              month,
              total_revenue: 0,
              total_sales: 0,
            };
          }
          monthlySales[month].total_revenue += sale.total;
          monthlySales[month].total_sales += sale.quantity;
        });
        const salesData = Object.values(monthlySales);
        setSales(salesData);
        const totalRevenue = salesData.reduce((acc, sale) => acc + sale.total_revenue, 0);
        const totalSales = salesData.reduce((acc, sale) => acc + sale.total_sales, 0);
        setTotalRevenue(totalRevenue);
        setTotalSales(totalSales);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <Link href="/grocery">
          <button>Back to GROCI</button>
        </Link>
      </div>
      <h1>Sales Dashboard</h1>
      <div className={styles.dashboard}>
        <div className={styles.card}>
          <h2>Total Revenue</h2>
          <p>₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h2>Total Sales</h2>
          <p>{totalSales}</p>
        </div>
      </div>
      <div className={styles.card}>
        <h2>Monthly Sales</h2>
        <Bar
          data={{
            labels: sales.map((sale) => sale.month),
            datasets: [
              {
                label: 'Total Revenue',
                data: sales.map((sale) => sale.total_revenue),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
              },
              {
                label: 'Total Sales',
                data: sales.map((sale) => sale.total_sales),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Monthly Sales Data',
              },
            },
          }}
        />
      </div>
      <div className={styles.card}>
        <h2>Recent Sales</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Revenue</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.month}>
                <td>{sale.month}</td>
                <td>₹{sale.total_revenue.toFixed(2)}</td>
                <td>{sale.total_sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
