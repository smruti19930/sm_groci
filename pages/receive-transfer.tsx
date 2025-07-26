import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '../styles/Admin.module.css';
import { Card, Button } from 'react-bootstrap';

interface Transfer {
  id: string;
  from_location_id: string;
  to_location_id: string;
  from_location_name: string;
  to_location_name: string;
  status: string;
  created_at: string;
  items: {
    item_name: string;
    quantity: number;
  }[];
}

export default function ReceiveTransfer() {
  const { data: session } = useSession();
  const [pendingTransfer, setPendingTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/pending-transfers?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPendingTransfer(data[0]);
          }
        });
    }
  }, [session]);

  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (itemName: string, quantity: number) => {
    setReceivedQuantities(prev => ({ ...prev, [itemName]: quantity }));
  };

  const handleReceiveTransfer = async (transferId: string) => {
    const res = await fetch('/api/receive-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transferId,
        username: session?.user?.name,
        receivedQuantities,
      }),
    });

    if (res.ok) {
      alert('Transfer received successfully!');
      setPendingTransfer(null);
    } else {
      alert('Failed to receive transfer.');
    }
  };

  const handleReturnTransfer = async (transferId: string) => {
    const res = await fetch('/api/return-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transferId,
        username: session?.user?.name,
      }),
    });

    if (res.ok) {
      alert('Transfer returned successfully!');
      setPendingTransfer(null);
    } else {
      alert('Failed to return transfer.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <h1>Receive Transfer</h1>
        <Link href="/grocery" className={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>

      {pendingTransfer ? (
        <Card className={styles.form}>
          <Card.Body>
            <Card.Title>Transfer Details</Card.Title>
            <Card.Text>
              <strong>From:</strong> {pendingTransfer.from_location_name}
            </Card.Text>
            <Card.Text>
              <strong>Status:</strong> {pendingTransfer.status}
            </Card.Text>
            <Card.Subtitle className="mb-2 text-muted">Items:</Card.Subtitle>
            {pendingTransfer.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ marginRight: '10px' }}>{item.item_name} - Quantity: {item.quantity}</span>
                <input
                  type="number"
                  defaultValue={item.quantity}
                  min="0"
                  max={item.quantity}
                  onChange={(e) => handleQuantityChange(item.item_name, Number(e.target.value))}
                  style={{ width: '70px' }}
                />
              </div>
            ))}
            <Button variant="primary" onClick={() => handleReceiveTransfer(pendingTransfer.id)} style={{ marginTop: '10px', marginRight: '10px' }}>
              Receive Transfer
            </Button>
            <Button variant="danger" onClick={() => handleReturnTransfer(pendingTransfer.id)} style={{ marginTop: '10px' }}>
              Not Accept
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <p>No pending transfers.</p>
      )}
    </div>
  );
}
