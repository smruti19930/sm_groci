import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import styles from '../styles/Admin.module.css';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.ok) {
      router.push('/grocery');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>GROCI</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Login</h1>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
