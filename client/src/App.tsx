import { useEffect, useState } from 'react';
import type { Movie } from './api/movies';
import { AdminMoviesPage } from './components/AdminMoviesPage';
import { AuthPage } from './components/AuthPage';
import { CatalogPage } from './components/CatalogPage';
import { MovieFormPage } from './components/MovieFormPage';
import { useAuth } from './context/AuthContext';

type View = 'catalog' | 'auth' | 'admin' | 'movie-form';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('catalog');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (user && view === 'auth') setView(user.role === 'ADMIN' ? 'admin' : 'catalog');
    if (!user && (view === 'admin' || view === 'movie-form')) setView('catalog');
  }, [user, view]);

  if (loading) return <main className="auth-shell"><p className="loading">Loading MovieFlex…</p></main>;
  if (view === 'auth') return <AuthPage onBack={() => setView('catalog')} />;
  if (user?.role === 'ADMIN' && view === 'admin') return <AdminMoviesPage onBack={() => setView('catalog')} onAdd={() => { setEditingMovie(null); setView('movie-form'); }} onEdit={(movie) => { setEditingMovie(movie); setView('movie-form'); }} />;
  if (user?.role === 'ADMIN' && view === 'movie-form') return <MovieFormPage movie={editingMovie} onCancel={() => setView('admin')} onSaved={() => setView('admin')} />;
  return <CatalogPage onSignIn={() => setView('auth')} onAdmin={() => setView('admin')} />;
}
