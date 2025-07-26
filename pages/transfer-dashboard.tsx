import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';
import { Row, Col, Table } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TransferDashboard() {
  const [data, setData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetch('/api/transfer-dashboard', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  const getStatusClass = (status: string) => {
    if (status === 'in_transit') return styles['status-in_transit'];
    if (status === 'returned') return styles['status-returned'];
    if (status === 'received') return styles['status-received'];
    return '';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Transfer Dashboard</h1>
        <Link href="/grocery" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      <Row>
        <Col>
          <div className={styles.card}>
            <h3>Total Transfers</h3>
            <div className={styles.value}>{data.totalTransfers}</div>
          </div>
        </Col>
        <Col>
          <div className={styles.card}>
            <h3>In-Transit</h3>
            <div className={styles.value}>{data.inTransit}</div>
          </div>
        </Col>
        <Col>
          <div className={styles.card}>
            <h3>Completed Transfers</h3>
            <div className={styles.value}>{data.completedTransfers}</div>
          </div>
        </Col>
        <Col>
          <div className={styles.card}>
            <h3>Items Moved</h3>
            <div className={styles.value}>{data.itemsMoved}</div>
          </div>
        </Col>
        <Col>
          <div className={styles.card}>
            <h3>Total Value</h3>
            <div className={styles.value}>${data.totalValue}</div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <div className={styles.card}>
            <h3>Recent Transfers</h3>
            <Table striped bordered hover responsive className={styles.table}>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>From Location</th>
                  <th>To Location</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransfers.map((t: any) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.from_location_name}</td>
                    <td>{t.to_location_name}</td>
                    <td>{t.items}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col md={4}>
          <div className={styles.card}>
            <h3>Transfers by Type</h3>
            <div className={styles.chartContainer}>
              {isClient && (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.transfersByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                      {data.transfersByType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className={styles.card}>
            <h3>Item Transfer Report</h3>
            <Table striped bordered hover responsive className={styles.table}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Total Qty Moved</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {data.itemTransferReport.map((item: any) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.from}</td>
                    <td>{item.to}</td>
                    <td>${item.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
}
