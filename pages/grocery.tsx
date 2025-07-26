import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Dropdown } from 'react-bootstrap';
import styles from '../styles/Grocery.module.css';
import Modal from '../components/Modal';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Item {
  id: number;
  name: string;
  stock: number;
  price: number;
  totalPrice: number;
  unit: string;
  category: string;
}

export default function Grocery() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchItems = (userId: string) => {
    fetch(`/api/items?userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Network response was not ok: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((error) => {
        console.error('Error fetching items:', error);
      });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchItems(session.user.id);
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => setCategories(data));
    }
  }, [status, session, router]);

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.ok) {
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

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>Welcome, {session?.user?.name}</div>
      <div className={styles.nav}>
        <Dropdown>
          <Dropdown.Toggle className={styles.gradientButton} id="dropdown-basic">
            Sales
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="/sell-item">Sell Item</Dropdown.Item>
            <Dropdown.Item href="/sales">Sales Dashboard</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {session?.user?.name !== 'sm' && (
            <Dropdown>
              <Dropdown.Toggle className={styles.gradientButton} id="dropdown-basic">
                Purchase
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/purchase-dashboard">Purchase Dashboard</Dropdown.Item>
                <Dropdown.Item href="/admin/purchase-from-vendor">Purchase from Vendor</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
        )}
        <Dropdown>
          <Dropdown.Toggle className={styles.gradientButton} id="dropdown-basic">
            Inventory
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="/transfer-dashboard">Transfer Dashboard</Dropdown.Item>
            {session?.user?.name !== 'sm' && (
              <Dropdown.Item href="/admin/transfer">Transfer</Dropdown.Item>
            )}
            <Dropdown.Item href="/receive-transfer">Receive Transfer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.gradientButton}>Logout</button>
        {session?.user?.name === 'anda' && (
          <Dropdown>
            <Dropdown.Toggle className={styles.gradientButton} id="dropdown-basic">
              Admin
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="/admin/map-user-to-store">Map User to Store</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search for an item"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <Dropdown>
          <Dropdown.Toggle className={styles.gradientButton} id="dropdown-basic">
            {selectedCategory || 'All Categories'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSelectedCategory(null)}>All Categories</Dropdown.Item>
            {categories.map((category) => (
              <Dropdown.Item key={category} onClick={() => setSelectedCategory(category)}>
                {category}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={selectedItems.length === 0}
          className={styles.deleteButton}
        >
          Delete Selected
        </button>
      </div>
      <div className={styles.dashboard}>
        <div className={styles.cardGrid}>
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
              <p>Price: ₹{item.price}/{item.unit}</p>
            </div>
          ))}
        </div>
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
