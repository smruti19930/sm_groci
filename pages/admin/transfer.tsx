import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';
import Modal from '../../components/Modal';

interface Location {
  id: string;
  name: string;
  type: 'store' | 'warehouse';
}

interface ItemWithBatch {
  item_id: string;
  item_name: string;
  category: string;
  item_stock_id: string;
  stock: number;
  price: number;
  unit: string;
  batch_code: string;
  batch_date: string;
  expiry_date: string;
}

interface TransferItem {
  item: ItemWithBatch;
  quantity: number;
}

export default function Transfer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

  // State for the modal
  const [modalItems, setModalItems] = useState<ItemWithBatch[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemWithBatch | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  useEffect(() => {
    if (session) {
      fetch('/api/locations')
        .then((res) => res.json())
        .then((data) => {
          setLocations(data);
          if (data.length > 0) {
            setFromLocation(data[0].id);
            if (data.length > 1) {
              setToLocation(data[1].id);
            }
          }
        });
    }
  }, [session]);

  // Effect for fetching modal items
  useEffect(() => {
    if (isModalOpen && fromLocation) {
      setSelectedItem(null);
      setModalQuantity(1);
      fetch(`/api/items-with-batches?locationId=${fromLocation}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setModalItems(data);
            setSelectedItem(data[0]);
          } else {
            setModalItems([]);
          }
        });
    }
  }, [isModalOpen, fromLocation]);


  useEffect(() => {
    if (fromLocation && toLocation && fromLocation === toLocation) {
      alert('From and To locations cannot be the same.');
    }
  }, [fromLocation, toLocation]);

  const handleAddItem = () => {
    if (selectedItem && modalQuantity > 0) {
      setTransferItems([...transferItems, { item: selectedItem, quantity: modalQuantity }]);
      setIsModalOpen(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...transferItems];
    newItems.splice(index, 1);
    setTransferItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation || !toLocation) {
      alert('Please select both a from and to location.');
      return;
    }
    if (fromLocation === toLocation) {
      alert('From and To locations cannot be the same.');
      return;
    }

    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromLocation,
        toLocation,
        transferItems,
        username: session?.user?.name,
      }),
    });

    if (res.ok) {
      alert('Transfer successful!');
      setTransferItems([]);
      setFromLocation('');
      setToLocation('');
    } else {
      alert('Transfer failed.');
    }
  };

  const handleModalSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const item = modalItems.find(i => String(i.item_stock_id) === selectedId) || null;
    setSelectedItem(item);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <h1>Inventory Transfer</h1>
        <Link href="/grocery" className={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="fromLocation">From Store</label>
            <select id="fromLocation" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)}>
              <option value="">-- Select a location --</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="toLocation">To Store</label>
            <select id="toLocation" value={toLocation} onChange={(e) => setToLocation(e.target.value)}>
              <option value="">-- Select a location --</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button type="button" onClick={() => setIsModalOpen(true)}>Add Item</button>

        <ul className={styles.list}>
          {transferItems.map((item, index) => (
            <li key={index} className={styles.item}>
              <span>{item.item.item_name} (Batch: {item.item.batch_code}) - {item.quantity}</span>
              <button type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
            </li>
          ))}
        </ul>

        <button type="submit" disabled={transferItems.length === 0}>Submit Transfer</button>
      </form>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Add Item to Transfer</h2>
        <div className={styles.form}>
          <select
            onChange={handleModalSelectChange}
            value={selectedItem?.item_stock_id || ''}
          >
            <option value="">-- Select an item --</option>
            {modalItems.map((item) => (
              <option key={item.item_stock_id} value={item.item_stock_id}>
                {item.item_name} (Batch: {item.batch_code}, Stock: {item.stock})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={modalQuantity}
            onChange={(e) => setModalQuantity(Number(e.target.value))}
            min="1"
            max={selectedItem?.stock || 1}
          />
          <button type="button" onClick={handleAddItem}>Add Item</button>
        </div>
      </Modal>
    </div>
  );
}
