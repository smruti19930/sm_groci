import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Grocery.module.css';
import Modal from '../components/Modal';

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
  totalPrice: number;
  unit: string;
  available_stock: number;
  category: string;
}

export default function Grocery() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchItems = () => {
    fetch('/api/items')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((error) => {
        console.error('Error fetching items:', error);
      });
  };

  useEffect(() => {
    fetchItems();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      await fetch('/api/items', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedItems }),
      });
      setItems(items.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setIsDeleteModalOpen(false);
    } else {
      alert('Invalid credentials');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || item.category === selectedCategory)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>GROCI</h1>
      </div>
      <div className={styles.nav}>
        <Link href="/admin/login">
          <button>Admin Login</button>
        </Link>
        <Link href="/sell-item">
          <button>Sell Item</button>
        </Link>
        <Link href="/sales">
          <button>Sales Dashboard</button>
        </Link>
        <button onClick={fetchItems}>Refresh</button>
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
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={selectedItems.length === 0}
          className={styles.deleteButton}
        >
          Delete Selected
        </button>
      </div>
      <div className={styles.dashboard}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${
              selectedItems.includes(item.id) ? styles.selected : ''
            } ${item.stock === 0 ? styles.outOfStock : ''}`}
          >
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelectItem(item.id)}
            />
            <h2>{item.name}</h2>
            <p>Stock: {item.stock}</p>
            <p>Available Stock: {item.available_stock}</p>
            <p>Price: ₹{item.price}/{item.unit}</p>
            <p>Total Price: ₹{item.totalPrice}</p>
          </div>
        ))}
      </div>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <form onSubmit={handleDeleteSelected}>
          <h2>Admin Login</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login & Delete</button>
        </form>
      </Modal>
    </div>
  );
}
