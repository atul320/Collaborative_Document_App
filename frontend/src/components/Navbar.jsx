import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const NavBar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <a href="/" style={{ marginRight: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
          MyApp
        </a>
        <a href="/" style={{ marginRight: '1rem' }}>
          Home
        </a>
        {!user && (
          <>
            <a href="/login" style={{ marginRight: '1rem' }}>
              Login
            </a>
            <a href="/register" style={{ marginRight: '1rem' }}>
              Register
            </a>
          </>
        )}
      </div>
      <div>
        {user && (
          <>
            <span style={{ marginRight: '1rem' }}>Hello, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};
