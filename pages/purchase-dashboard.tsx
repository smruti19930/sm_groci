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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PurchaseData {
  vendor_name: string;
  total_items: number;
  total_cost: number;
}

interface OverallData {
  total_items: number;
  total_cost: number;
}

export default function PurchaseDashboard() {
  const [byVendor, setByVendor] = useState<PurchaseData[]>([]);
  const [overall, setOverall] = useState<OverallData | null>(null);

  useEffect(() => {
    fetch('/api/purchases')
      .then((res) => res.json())
      .then((data) => {
        if (data.byVendor) {
          setByVendor(data.byVendor);
        }
        if (data.overall) {
          setOverall(data.overall);
        }
      });
  }, []);

  return (
    <div className="container-fluid bg-light p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Purchase Dashboard</h1>
        <Link href="/grocery" className="btn btn-primary">
          Back to GROCI
        </Link>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Overall Purchase Summary</h5>
              <div className="d-flex justify-content-around text-center">
                <div className="p-3">
                  <p className="h3">{overall?.total_items || 0}</p>
                  <p className="text-muted">Total Items Purchased</p>
                </div>
                <div className="p-3">
                  <p className="h3">₹{(overall?.total_cost || 0).toFixed(2)}</p>
                  <p className="text-muted">Total Purchase Cost</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Purchases by Vendor</h5>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: byVendor.map((v) => v.vendor_name),
                    datasets: [
                      {
                        label: 'Total Cost',
                        data: byVendor.map((v) => v.total_cost),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                      },
                      {
                        label: 'Total Items',
                        data: byVendor.map((v) => v.total_items),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
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
                        text: 'Purchase Data by Vendor',
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
              <h5 className="card-title">Vendor Breakdown</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Vendor</th>
                      <th>Total Items</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byVendor.map((v) => (
                      <tr key={v.vendor_name}>
                        <td>{v.vendor_name}</td>
                        <td>{v.total_items}</td>
                        <td>₹{v.total_cost.toFixed(2)}</td>
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
