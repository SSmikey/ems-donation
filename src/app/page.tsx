'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', { username, password, rememberMe });
  };

  return (
    <div className={styles.container}>
      {/* Decorative elements */}
      <div className={styles.decoration + ' ' + styles.decorationTL}></div>
      <div className={styles.decoration + ' ' + styles.decorationBL}></div>
      <div className={styles.decoration + ' ' + styles.decorationBR}></div>
      <div className={styles.decorationDot + ' ' + styles.dotTR}></div>
      <div className={styles.decorationDot + ' ' + styles.dotML}></div>

      {/* Login Card */}
      <div className={styles.card}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>🎯</div>
          <h1 className={styles.appName}>ems-donation</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <h2 className={styles.loginTitle}>Login</h2>

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberCheckbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me?</span>
            </label>
            <a href="#" className={styles.forgotLink}>
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <div className={styles.signupSection}>
          <span>Don't have an Account? </span>
          <a href="#" className={styles.signupLink}>
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
