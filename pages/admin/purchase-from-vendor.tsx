import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CreatableSelect from 'react-select/creatable';
import styles from '../../styles/Admin.module.css';

interface PurchaseItem {
  itemId: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  price: number;
  unit: string;
  barcode: string;
  batchCode: string;
  expiryDate: string;
  vendorName: string;
}

type PurchaseType = 'new' | 'existing';

export default function PurchaseFromVendor() {
  const router = useRouter();
  const [vendors, setVendors] = useState<string[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('new');
  const [currentItem, setCurrentItem] = useState<PurchaseItem>({
    itemId: '',
    itemName: '',
    itemCategory: '',
    quantity: 0,
    price: 0,
    unit: '',
    barcode: '',
    batchCode: '',
    expiryDate: '',
    vendorName: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (!user) {
      router.push('/admin/login');
    }

    fetch('/api/vendors')
      .then((res) => res.json())
      .then((data) => setVendors(data));
    
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [router]);

  const handleAddItemToList = () => {
    setPurchaseItems(prevItems => [...prevItems, { ...currentItem }]);
    setCurrentItem({
      itemId: '',
      itemName: '',
      itemCategory: '',
      quantity: 0,
      price: 0,
      unit: '',
      barcode: '',
      batchCode: '',
      expiryDate: '',
      vendorName: currentItem.vendorName, // Keep vendor name for next item
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'itemId') {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        setCurrentItem({
          ...currentItem,
          itemId: value,
          itemName: selectedItem.name,
          itemCategory: selectedItem.category,
        });
      }
    } else {
      setCurrentItem({ ...currentItem, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purchaseItems }),
    });

    if (res.ok) {
      alert('Purchase successful!');
      setPurchaseItems([]);
    } else {
      alert('Purchase failed.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <h1>Purchase from Vendor</h1>
        <Link href="/grocery" className={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>

      <div className={styles.toggleSwitch}>
        <button onClick={() => setPurchaseType('new')} className={purchaseType === 'new' ? styles.active : ''}>New Item</button>
        <button onClick={() => setPurchaseType('existing')} className={purchaseType === 'existing' ? styles.active : ''}>Existing Item</button>
      </div>

      <div className={styles.form}>
        {purchaseType === 'new' ? (
          <>
            <div className={styles.formRow}>
              <div>
                <label htmlFor="itemName">Item Name</label>
                <input id="itemName" type="text" value={currentItem.itemName} onChange={handleInputChange} placeholder="Item Name" />
              </div>
              <div>
                <label htmlFor="itemCategory">Item Category</label>
                <input id="itemCategory" type="text" value={currentItem.itemCategory} onChange={handleInputChange} placeholder="Item Category" />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.formRow}>
            <div>
              <label htmlFor="itemId">Select Item</label>
              <select id="itemId" value={currentItem.itemId} onChange={handleInputChange}>
                <option value="">-- Select an item --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className={styles.formRow}>
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" value={currentItem.quantity} onChange={handleInputChange} placeholder="Quantity" />
          </div>
          <div>
            <label htmlFor="price">Price</label>
            <input id="price" type="number" value={currentItem.price} onChange={handleInputChange} placeholder="Price" step="0.01" />
          </div>
          <div>
            <label htmlFor="unit">Unit</label>
            <input id="unit" type="text" value={currentItem.unit} onChange={handleInputChange} placeholder="Unit" />
          </div>
        </div>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="barcode">Barcode</label>
            <input id="barcode" type="text" value={currentItem.barcode} onChange={handleInputChange} placeholder="Barcode" />
          </div>
          <div>
            <label htmlFor="batchCode">Batch Code</label>
            <input id="batchCode" type="text" value={currentItem.batchCode} onChange={handleInputChange} placeholder="Batch Code" />
          </div>
          <div>
            <label htmlFor="expiryDate">Expiry Date</label>
            <input id="expiryDate" type="date" value={currentItem.expiryDate} onChange={handleInputChange} placeholder="Expiry Date" />
          </div>
        </div>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="vendorName">Vendor Name</label>
            <CreatableSelect
              isClearable
              onChange={(newValue) => setCurrentItem({ ...currentItem, vendorName: newValue ? newValue.value : '' })}
              options={vendors.map(vendor => ({ value: vendor, label: vendor }))}
              value={currentItem.vendorName ? { value: currentItem.vendorName, label: currentItem.vendorName } : null}
            />
          </div>
        </div>
        <button type="button" onClick={handleAddItemToList}>Add Item</button>
      </div>

      <ul className={styles.list}>
        {purchaseItems.map((item, index) => (
          <li key={index} className={styles.item}>
            <span>{item.itemName} - {item.quantity} {item.unit}</span>
            <button onClick={() => handleRemoveItem(index)}>Remove</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className={styles.form}>
        <button type="submit" disabled={purchaseItems.length === 0}>Submit Purchase</button>
      </form>
    </div>
  );
}
