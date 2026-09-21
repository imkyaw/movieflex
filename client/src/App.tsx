import { useEffect, useState } from 'react';
import type { Movie } from './api/movies';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { AdminMovieDetailPage } from './components/AdminMovieDetailPage';
import { AdminMoviesPage } from './components/AdminMoviesPage';
import { AdminOrderDetailPage } from './components/AdminOrderDetailPage';
import { AdminOrdersPage } from './components/AdminOrdersPage';
import { AdminUserDetailPage } from './components/AdminUserDetailPage';
import { AdminUsersPage } from './components/AdminUsersPage';
import { AuthPage } from './components/AuthPage';
import { CartPage } from './components/CartPage';
import { CatalogPage } from './components/CatalogPage';
import { MovieFormPage } from './components/MovieFormPage';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './context/AuthContext';

type View = 'catalog' | 'auth' | 'admin-dashboard' | 'admin' | 'admin-users' | 'admin-user-detail' | 'admin-orders' | 'admin-order-detail' | 'admin-movie-detail' | 'movie-form' | 'cart' | 'profile';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('catalog');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [viewingMovieId, setViewingMovieId] = useState<string | null>(null);

  useEffect(() => {
    if (user && view === 'auth') setView(user.role === 'ADMIN' ? 'admin-dashboard' : 'catalog');
    if (!user && (view === 'admin-dashboard' || view === 'admin' || view === 'admin-users' || view === 'admin-user-detail' || view === 'admin-orders' || view === 'admin-order-detail' || view === 'admin-movie-detail' || view === 'movie-form' || view === 'profile')) setView('catalog');
  }, [user, view]);

  if (loading) return <main className="auth-shell"><p className="loading">Loading MovieFlex…</p></main>;
  if (view === 'auth') return <AuthPage onBack={() => setView('catalog')} />;
  if (view === 'cart') return <CartPage onBack={() => setView('catalog')} onSignIn={() => setView('auth')} />;
  if (user && view === 'profile') return <ProfilePage onBack={() => setView('catalog')} />;
  if (user?.role === 'ADMIN' && view === 'admin-dashboard') return <AdminDashboardPage onBack={() => setView('catalog')} onMovies={() => setView('admin')} onUsers={() => setView('admin-users')} onOrders={() => setView('admin-orders')} />;
  if (user?.role === 'ADMIN' && view === 'admin') return <AdminMoviesPage onBack={() => setView('catalog')} onDashboard={() => setView('admin-dashboard')} onUsers={() => setView('admin-users')} onOrders={() => setView('admin-orders')} onAdd={() => { setEditingMovie(null); setView('movie-form'); }} onEdit={(movie) => { setEditingMovie(movie); setView('movie-form'); }} />;
  if (user?.role === 'ADMIN' && view === 'admin-users') return <AdminUsersPage onBack={() => setView('catalog')} onDashboard={() => setView('admin-dashboard')} onMovies={() => setView('admin')} onOrders={() => setView('admin-orders')} onView={(userId) => { setViewingUserId(userId); setView('admin-user-detail'); }} />;
  if (user?.role === 'ADMIN' && view === 'admin-user-detail' && viewingUserId) return <AdminUserDetailPage userId={viewingUserId} onBack={() => setView('admin-users')} onDashboard={() => setView('admin-dashboard')} onMovies={() => setView('admin')} onOrders={() => setView('admin-orders')} />;
  if (user?.role === 'ADMIN' && view === 'admin-orders') return <AdminOrdersPage onBack={() => setView('catalog')} onDashboard={() => setView('admin-dashboard')} onMovies={() => setView('admin')} onUsers={() => setView('admin-users')} onView={(orderId) => { setViewingOrderId(orderId); setView('admin-order-detail'); }} />;
  if (user?.role === 'ADMIN' && view === 'admin-order-detail' && viewingOrderId) return <AdminOrderDetailPage orderId={viewingOrderId} onBack={() => setView('admin-orders')} onDashboard={() => setView('admin-dashboard')} onMovies={() => setView('admin')} onUsers={() => setView('admin-users')} onViewMovie={(movieId) => { setViewingMovieId(movieId); setView('admin-movie-detail'); }} />;
  if (user?.role === 'ADMIN' && view === 'admin-movie-detail' && viewingMovieId) return <AdminMovieDetailPage movieId={viewingMovieId} onBack={() => setView(viewingOrderId ? 'admin-order-detail' : 'admin')} onDashboard={() => setView('admin-dashboard')} onMovies={() => setView('admin')} onUsers={() => setView('admin-users')} onOrders={() => setView('admin-orders')} />;
  if (user?.role === 'ADMIN' && view === 'movie-form') return <MovieFormPage movie={editingMovie} onCancel={() => setView('admin')} onSaved={() => setView('admin')} onDashboard={() => setView('admin-dashboard')} onUsers={() => setView('admin-users')} onOrders={() => setView('admin-orders')} />;
  return <CatalogPage onSignIn={() => setView('auth')} onAdmin={() => setView('admin-dashboard')} onCart={() => setView('cart')} onProfile={() => setView('profile')} />;
}
