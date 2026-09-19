import { useEffect, useState } from 'react';
import type { Movie } from './api/movies';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { AdminMoviesPage } from './components/AdminMoviesPage';
import { AuthPage } from './components/AuthPage';
import { CartPage } from './components/CartPage';
import { CatalogPage } from './components/CatalogPage';
import { MovieFormPage } from './components/MovieFormPage';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './context/AuthContext';

type View = 'catalog' | 'auth' | 'admin-dashboard' | 'admin' | 'movie-form' | 'cart' | 'profile';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('catalog');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (user && view === 'auth') setView(user.role === 'ADMIN' ? 'admin-dashboard' : 'catalog');
    if (!user && (view === 'admin-dashboard' || view === 'admin' || view === 'movie-form' || view === 'profile')) setView('catalog');
  }, [user, view]);

  if (loading) return <main className="auth-shell"><p className="loading">Loading MovieFlex…</p></main>;
  if (view === 'auth') return <AuthPage onBack={() => setView('catalog')} />;
  if (view === 'cart') return <CartPage onBack={() => setView('catalog')} onSignIn={() => setView('auth')} />;
  if (user && view === 'profile') return <ProfilePage onBack={() => setView('catalog')} />;
  if (user?.role === 'ADMIN' && view === 'admin-dashboard') return <AdminDashboardPage onBack={() => setView('catalog')} onMovies={() => setView('admin')} />;
  if (user?.role === 'ADMIN' && view === 'admin') return <AdminMoviesPage onBack={() => setView('catalog')} onDashboard={() => setView('admin-dashboard')} onAdd={() => { setEditingMovie(null); setView('movie-form'); }} onEdit={(movie) => { setEditingMovie(movie); setView('movie-form'); }} />;
  if (user?.role === 'ADMIN' && view === 'movie-form') return <MovieFormPage movie={editingMovie} onCancel={() => setView('admin')} onSaved={() => setView('admin')} />;
  return <CatalogPage onSignIn={() => setView('auth')} onAdmin={() => setView('admin-dashboard')} onCart={() => setView('cart')} onProfile={() => setView('profile')} />;
}
