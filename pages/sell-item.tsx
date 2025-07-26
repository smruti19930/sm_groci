import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/SellItem.module.css';
import Modal from '../components/Modal';
import { generateInvoicePDF } from '../lib/invoice';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useSession, signIn } from 'next-auth/react';

interface Batch {
  batch_code: string;
  price: number;
  stock: number;
}

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
  barcode: string;
  quantity: number;
  batch_code?: string;
}

export default function SellItem() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Item[]>([]);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedItemForQuantity, setSelectedItemForQuantity] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetch(`/api/items?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          return fetch('/api/categories');
        })
        .then((res) => res.json())
        .then((data) => {
          setCategories(data);
        });
    }
  }, [session]);

  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        'qr-code-reader',
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(onScanSuccess, onScanFailure);
    }
  }, [isScannerOpen]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    const item = items.find((item) => item.barcode === decodedText);
    if (item) {
      addToCartFromScan(item);
    } else {
      alert('Item not found');
    }
    setIsScannerOpen(false);
  };

  const onScanFailure = (error: any) => {
    // handle scan failure, usually better to ignore and keep scanning.
  };

  const handleManualBarcodeAdd = () => {
    const item = items.find((item) => item.barcode === barcode);
    if (item) {
      addToCartFromScan(item);
    } else {
      alert('Item not found');
    }
    setBarcode('');
  };

  const addToCartFromScan = (item: Item) => {
    const itemInCart = cart.find((cartItem) => cartItem.id === item.id);
    if (itemInCart) {
      if (itemInCart.quantity + 1 > item.stock) {
        alert('Not enough stock');
        return;
      }
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      if (1 > item.stock) {
        alert('Not enough stock');
        return;
      }
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const openQuantityModal = async (item: Item) => {
    if (!session) {
      alert('You must be logged in to perform this action.');
      return;
    }
    try {
      const res = await fetch(`/api/items-with-batches?itemId=${item.id}&userId=${session.user.id}`);
      if (res.ok) {
        const batchData: Batch[] = await res.json();
        if (Array.isArray(batchData) && batchData.length > 0) {
          setBatches(batchData);
          setSelectedBatch(batchData[0]);
          setSelectedItemForQuantity(item);
          setIsQuantityModalOpen(true);
        } else {
          alert('This item is out of stock or has no batches.');
        }
      } else {
        console.error('Failed to fetch batches');
        alert('Could not fetch batch information for this item.');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      alert('An error occurred while fetching batch information.');
    }
  };

  const addToCart = () => {
    if (selectedItemForQuantity && selectedBatch) {
      const itemInCart = cart.find(
        (item) => item.id === selectedItemForQuantity.id && item.batch_code === selectedBatch.batch_code
      );

      const availableStock = selectedBatch.stock - (itemInCart?.quantity || 0);
      if (quantity > availableStock) {
        alert('Not enough stock in this batch.');
        return;
      }

      if (itemInCart) {
        setCart(
          cart.map((cartItem) =>
            cartItem.id === selectedItemForQuantity.id && cartItem.batch_code === selectedBatch.batch_code
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
        );
      } else {
        setCart([
          ...cart,
          { 
            ...selectedItemForQuantity, 
            quantity, 
            price: selectedBatch.price, // Use batch price
            batch_code: selectedBatch.batch_code 
          }
        ]);
      }
      setIsQuantityModalOpen(false);
      setQuantity(1);
      setBatches([]);
      setSelectedBatch(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || item.category === selectedCategory)
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const { category } = item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const handleCheckout = async () => {
    const invoiceNumber = Math.floor(Math.random() * 1000000);

    const res = await fetch('/api/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cart, invoiceNumber, userId: session?.user?.id }),
    });

    if (res.ok) {
      generateInvoicePDF(cart);
      alert('Sale successful!');
      setCart([]);
      // Refresh items to show updated stock
      if (session) {
        fetch(`/api/items?userId=${session.user.id}`)
          .then((res) => res.json())
          .then((data) => setItems(data));
      }
    } else {
      alert('Sale failed.');
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Sell Items</h1>
          <Link href="/grocery">
            <button>Back to GROCI</button>
          </Link>
        </div>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search for an item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            className={styles.categorySelect}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button onClick={() => setIsScannerOpen(true)}>Scan Barcode</button>
        </div>
        {isScannerOpen && (
          <div id="qr-code-reader"></div>
        )}
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onBlur={handleManualBarcodeAdd}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.itemList}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h2 className={styles.categoryHeader}>{category}</h2>
              <div className={styles.cardGrid}>
                {items.map((item) => (
                  <div key={item.id} className={styles.card}>
                    <h2>{item.name}</h2>
                    <p>Stock: {item.stock}</p>
                    <p>Price: ₹{item.price}</p>
                    <button
                      onClick={() => openQuantityModal(item)}
                      disabled={item.stock <= 0}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.cart}>
        <h2>Cart</h2>
        {cart.map((item, index) => (
          <div key={index} className={styles.cartItem}>
            <span>{item.name} ({item.batch_code}) (x{item.quantity})</span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className={styles.cartTotal}>
          Total: ₹{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
        </div>
        <button className={styles.checkoutButton} onClick={handleCheckout}>
          Checkout
        </button>
      </div>
      <Modal isOpen={isQuantityModalOpen} onClose={() => {
        setIsQuantityModalOpen(false);
        setBatches([]);
        setSelectedBatch(null);
      }}>
        <h2>Enter Quantity</h2>
        <div className={styles.modalBatchContainer}>
          {batches.length > 0 && (
            <>
              <span className={styles.modalBatchLabel}>Batch Number:</span>
              <select
                value={selectedBatch?.batch_code || ''}
                onChange={(e) => {
                  const newSelectedBatch = batches.find(b => b.batch_code === e.target.value) || null;
                  setSelectedBatch(newSelectedBatch);
                }}
                className={styles.modalBatchSelect}
              >
                {batches.map((batch) => (
                  <option key={batch.batch_code} value={batch.batch_code}>
                    Batch: {batch.batch_code} (Price: ₹{batch.price}, Stock: {batch.stock})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          max={selectedBatch ? selectedBatch.stock - (cart.find(item => item.batch_code === selectedBatch.batch_code)?.quantity || 0) : 1}
        />
        <button 
          onClick={addToCart} 
          className={styles.addToCartButton}
        >
          Add to Cart
        </button>
      </Modal>
    </div>
  );
}
