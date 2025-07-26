import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/MapUserToStore.module.css';

interface Mapping {
  user_id: string;
  store_id: string;
}

interface User {
  id: string;
  username: string;
}

interface Store {
  id: string;
  name: string;
}

interface DisplayMapping {
  user_id: string;
  username: string;
  store_id: string;
  store_name: string;
}

const MapUserToStore = () => {
  const [mappings, setMappings] = useState<DisplayMapping[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchData = async () => {
    try {
      const [mappingsRes, usersRes, storesRes] = await Promise.all([
        fetch('/api/user-store-mappings'),
        fetch('/api/users'),
        fetch('/api/stores'),
      ]);

      const mappingsData = await mappingsRes.json();
      const usersData = await usersRes.json();
      const storesData = await storesRes.json();

      const displayMappings = mappingsData.map((mapping: Mapping) => {
        const user = usersData.find((u: User) => u.id === mapping.user_id);
        const store = storesData.find((s: Store) => s.id === mapping.store_id);
        return {
          user_id: mapping.user_id,
          username: user ? user.username : 'Unknown User',
          store_id: mapping.store_id,
          store_name: store ? store.name : 'Unknown Store',
        };
      });

      setMappings(displayMappings);
      setUsers(usersData);
      setStores(storesData);
    } catch (error) {
      setMessage('Error fetching data');
      setMessageType('error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMapUserToStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!selectedUser || selectedStores.length === 0) {
      setMessage('Please select a user and at least one store.');
      setMessageType('error');
      return;
    }

    try {
      const res = await fetch('/api/map-user-to-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUser, storeIds: selectedStores }),
      });

      const data = await res.json();
      setMessage(data.message);
      setMessageType(res.ok ? 'success' : 'error');
      fetchData();
    } catch (error) {
      setMessage('Error mapping user to store');
      setMessageType('error');
    }
  };

  const handleRemoveMapping = async (userId: string, storeId: string) => {
    try {
      const res = await fetch('/api/map-user-to-store', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, storeId }),
      });

      const data = await res.json();
      setMessage(data.message);
      setMessageType(res.ok ? 'success' : 'error');
      fetchData();
    } catch (error) {
      setMessage('Error removing mapping');
      setMessageType('error');
    }
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedStores(value);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>User-Store Mappings</h1>
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.h2}>Existing Mappings</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Store</th>
                <th>Action</th>
              </tr>
            </thead>
          <tbody>
            {mappings.length > 0 ? (
              mappings.map((mapping: DisplayMapping) => (
                <tr key={`${mapping.user_id}-${mapping.store_id}`}>
                  <td>{mapping.username}</td>
                  <td>{mapping.store_name}</td>
                  <td>
                    <button onClick={() => handleRemoveMapping(mapping.user_id, mapping.store_id)} className={styles.removeButton}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No mappings found</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
        <div className={styles.card}>
          <h2 className={styles.h2}>Map User to Store</h2>
          <form onSubmit={handleMapUserToStore} className={styles.form}>
            <div className={styles.formGroup}>
            <label htmlFor="user">User</label>
            <select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Select a user</option>
              {users.map((user: User) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="store">Store</label>
            <select
              id="store"
              multiple
              value={selectedStores}
              onChange={handleStoreChange}
              required
            >
              {stores.map((store: Store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.button}>
            Map User to Store
          </button>
        </form>
        {message && <p className={`${styles.message} ${styles[messageType]}`}>{message}</p>}
        </div>
      </div>
      <Link href="/grocery" className={styles.backButton}>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default MapUserToStore;
