import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/SellItem.module.css';
import Modal from '../components/Modal';
import { generateInvoicePDF } from '../lib/invoice';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
  barcode: string;
  quantity: number;
}

export default function SellItem() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Item[]>([]);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedItemForQuantity, setSelectedItemForQuantity] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        return fetch('/api/categories');
      })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

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

  const openQuantityModal = (item: Item) => {
    const itemInCart = cart.find((cartItem) => cartItem.id === item.id);
    if (itemInCart && itemInCart.quantity >= item.stock) {
      alert('Not enough stock');
      return;
    }
    setSelectedItemForQuantity(item);
    setIsQuantityModalOpen(true);
  };

  const addToCart = () => {
    if (selectedItemForQuantity) {
      const itemInCart = cart.find(
        (item) => item.id === selectedItemForQuantity.id
      );
      if (itemInCart) {
        if (itemInCart.quantity + quantity > selectedItemForQuantity.stock) {
          alert('Not enough stock');
          return;
        }
        setCart(
          cart.map((cartItem) =>
            cartItem.id === selectedItemForQuantity.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
        );
      } else {
        if (quantity > selectedItemForQuantity.stock) {
          alert('Not enough stock');
          return;
        }
        setCart([...cart, { ...selectedItemForQuantity, quantity }]);
      }
      setIsQuantityModalOpen(false);
      setQuantity(1);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || item.category === selectedCategory)
  );

  const handleCheckout = async () => {
    const invoiceNumber = Math.floor(Math.random() * 1000000);

    const res = await fetch('/api/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cart, invoiceNumber }),
    });

    if (res.ok) {
      generateInvoicePDF(cart);
      alert('Sale successful!');
      setCart([]);
      // Refresh items to show updated stock
      fetch('/api/items')
        .then((res) => res.json())
        .then((data) => setItems(data));
    } else {
      alert('Sale failed.');
    }
  };

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
          {filteredItems.map((item) => (
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
      <div className={styles.cart}>
        <h2>Cart</h2>
        {cart.map((item, index) => (
          <div key={index} className={styles.cartItem}>
            <span>{item.name} (x{item.quantity})</span>
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
      <Modal isOpen={isQuantityModalOpen} onClose={() => setIsQuantityModalOpen(false)}>
        <h2>Enter Quantity</h2>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const newQuantity = Number(e.target.value);
            if (selectedItemForQuantity) {
              const itemInCart = cart.find(
                (item) => item.id === selectedItemForQuantity.id
              );
              if (itemInCart) {
                if (newQuantity > selectedItemForQuantity.stock - itemInCart.quantity) {
                  setQuantity(selectedItemForQuantity.stock - itemInCart.quantity);
                } else {
                  setQuantity(newQuantity);
                }
              } else {
                if (newQuantity > selectedItemForQuantity.stock) {
                  setQuantity(selectedItemForQuantity.stock);
                } else {
                  setQuantity(newQuantity);
                }
              }
            }
          }}
          min="1"
          max={
            selectedItemForQuantity
              ? selectedItemForQuantity.stock -
                (cart.find((item) => item.id === selectedItemForQuantity.id)?.quantity || 0)
              : 1
          }
        />
        <button onClick={addToCart}>Add to Cart</button>
      </Modal>
    </div>
  );
}
