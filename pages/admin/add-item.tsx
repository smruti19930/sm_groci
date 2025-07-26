import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Admin.module.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
  totalPrice: number;
  available_stock: number;
  barcode: string;
}

export default function AddItem() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState(0);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [updateStock, setUpdateStock] = useState(0);
  const [updateCategory, setUpdateCategory] = useState('');
  const [updateUnit, setUpdateUnit] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (!user) {
      router.push('/admin/login');
      return;
    }
    
    fetch('/api/items')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Network response was not ok: ${text}`);
        }
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error("Failed to parse JSON:", text);
          throw err;
        }
      })
      .then((data) => setItems(data))
      .catch((error) => {
        console.error('Error fetching items:', error);
      });

    fetch('/api/units')
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((error) => {
        console.error('Error fetching units:', error);
      });
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'qr-code-reader-add-item',
          { fps: 10, qrbox: 250 },
          false
        );
        const onScanSuccess = (decodedText: string, decodedResult: any) => {
          setNewItemBarcode(decodedText);
          setIsScannerOpen(false);
          scanner.clear();
        };
        scanner.render(onScanSuccess, onScanFailure);
      }, 0);
    }
  }, [isScannerOpen]);

  const onScanFailure = (error: any) => {
    // handle scan failure, usually better to ignore and keep scanning.
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newItemName,
        stock: newItemStock,
        price: newItemPrice,
        unit: newItemUnit,
        category: newItemCategory,
        barcode: newItemBarcode,
      }),
    });
    const newItem = await res.json();
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemStock(0);
    setNewItemPrice(0);
    setNewItemUnit('kg');
    setNewItemCategory('');
    setNewItemBarcode('');
    fetch('/api/units')
        .then((res) => res.json())
        .then((data) => setUnits(data));
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId === null) {
      alert('Please select an item to update.');
      return;
    }
    const res = await fetch('/api/items', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedItemId,
        stock: updateStock,
        category: updateCategory,
        unit: updateUnit,
      }),
    });
    if (res.ok) {
      alert('Item updated successfully!');
      fetch('/api/items')
        .then((res) => res.json())
        .then((data) => setItems(data));
    } else {
      alert('Item update failed.');
    }
  };

  const handleDeleteItem = async (id: number) => {
    const res = await fetch('/api/items', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      alert('Delete failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { "Item Name": "", "Quantity": "", "Price": "", "Unit": "", "Category": "", "Barcode": "" }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'template.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        handleBulkUpload(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    const items = data.map(row => ({
      name: row['Item Name'],
      stock: row['Quantity'],
      price: row['Price'],
      unit: row['Unit'],
      available_stock: row['Quantity'],
      category: row['Category'],
      barcode: row['Barcode'],
    }));

    const res = await fetch('/api/bulk-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      alert('Bulk upload successful!');
      fetch('/api/items')
        .then((res) => res.json())
        .then((data) => setItems(data));
      fetch('/api/units')
        .then((res) => res.json())
        .then((data) => setUnits(data));
    } else {
      alert('Bulk upload failed.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <h1>Add Item</h1>
        <Link href="/admin/purchase-from-vendor" passHref>
          <div className={styles.purchaseLink}>Purchase from Vendor</div>
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className={styles.topActions}>
        <div className={styles.bulkUpload}>
          <button onClick={handleDownloadTemplate}>Download Template</button>
          <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" />
        </div>
      </div>

      {isScannerOpen && (
        <div id="qr-code-reader-add-item"></div>
      )}

      <form onSubmit={handleAddItem} className={styles.form}>
        <h2>Add New Item</h2>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="itemName">Item Name</label>
            <input id="itemName" type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name" />
          </div>
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" value={newItemStock} onChange={(e) => setNewItemStock(Number(e.target.value))} placeholder="Quantity" />
          </div>
          <div>
            <label htmlFor="price">Price</label>
            <input id="price" type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} placeholder="Price" step="0.01" />
          </div>
        </div>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="unit">Unit</label>
            <select id="unit" value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)}>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <input id="category" type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category" />
          </div>
          <div>
            <label htmlFor="barcode">Barcode</label>
            <input id="barcode" type="text" value={newItemBarcode} onChange={(e) => setNewItemBarcode(e.target.value)} placeholder="Barcode" />
          </div>
        </div>
        <button type="button" onClick={() => setIsScannerOpen(true)}>Scan Barcode</button>
        <button type="submit">Add Item</button>
      </form>

      <form onSubmit={handleUpdateStock} className={styles.form}>
        <h2>Update Item</h2>
        <select value={selectedItemId ?? ''} onChange={(e) => setSelectedItemId(Number(e.target.value))}>
          <option value="" disabled>Select an item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <div className={styles.formRow}>
          <div>
            <label htmlFor="update-stock">Stock</label>
            <input id="update-stock" type="number" value={updateStock} onChange={(e) => setUpdateStock(Number(e.target.value))} placeholder="New Stock" />
          </div>
          <div>
            <label htmlFor="update-category">Category</label>
            <input id="update-category" type="text" value={updateCategory} onChange={(e) => setUpdateCategory(e.target.value)} placeholder="Category" />
          </div>
          <div>
            <label htmlFor="update-unit">Unit</label>
            <select id="update-unit" value={updateUnit} onChange={(e) => setUpdateUnit(e.target.value)}>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit">Update Item</button>
      </form>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span>{item.name} - Stock: {item.stock} - Price: ₹{item.price} - Barcode: {item.barcode}</span>
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
