import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { useSession, signIn } from 'next-auth/react';

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
  revenue: number;
  sales: number;
}

export default function Sales() {
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<SalesData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetch(`/api/sales?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setTotalRevenue(data.totalRevenue);
          setTotalSales(data.totalSales);
          setSales(data.monthlyData);
        });
    }
  }, [session]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <div className="container-fluid bg-light p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Sales Dashboard</h1>
        <Link href="/grocery" className="btn btn-primary">
          Back to GROCI
        </Link>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Overall Sales Summary</h5>
              <div className="d-flex justify-content-around text-center">
                <div className="p-3">
                  <p className="h3">₹{totalRevenue.toFixed(2)}</p>
                  <p className="text-muted">Total Revenue</p>
                </div>
                <div className="p-3">
                  <p className="h3">{totalSales}</p>
                  <p className="text-muted">Total Sales</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Monthly Sales</h5>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: sales.map((sale) => sale.month),
                    datasets: [
                      {
                        label: 'Total Revenue',
                        data: sales.map((sale) => sale.revenue),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      },
                      {
                        label: 'Total Sales',
                        data: sales.map((sale) => sale.sales),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Recent Sales</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
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
                        <td>₹{sale.revenue.toFixed(2)}</td>
                        <td>{sale.sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
