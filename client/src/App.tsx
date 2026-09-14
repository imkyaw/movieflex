import { useEffect, useState } from 'react';
import type { Movie } from './api/movies';
import { AdminMoviesPage } from './components/AdminMoviesPage';
import { AdminUsersPage } from './components/AdminUsersPage';
import { AuthPage } from './components/AuthPage';
import { CatalogPage } from './components/CatalogPage';
import { MovieDetailPage } from './components/MovieDetailPage';
import { MovieFormPage } from './components/MovieFormPage';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './context/AuthContext';

type View = 'catalog' | 'auth' | 'admin' | 'admin-users' | 'movie-form' | 'profile' | 'movie-detail';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('catalog');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    if (user && view === 'auth') setView(user.role === 'ADMIN' ? 'admin' : 'catalog');
    if (!user && (view === 'admin' || view === 'admin-users' || view === 'movie-form' || view === 'profile')) setView('catalog');
  }, [user, view]);

  if (loading) return <main className="auth-shell"><p className="loading">Loading MovieFlex…</p></main>;
  if (view === 'auth') return <AuthPage onBack={() => setView('catalog')} />;
  if (user && view === 'profile') return <ProfilePage onBack={() => setView('catalog')} />;
  if (view === 'movie-detail' && selectedMovieId) return <MovieDetailPage movieId={selectedMovieId} onBack={() => setView('catalog')} />;
  if (user?.role === 'ADMIN' && view === 'admin') return <AdminMoviesPage onBack={() => setView('catalog')} onAdd={() => { setEditingMovie(null); setView('movie-form'); }} onEdit={(movie) => { setEditingMovie(movie); setView('movie-form'); }} onUsers={() => setView('admin-users')} />;
  if (user?.role === 'ADMIN' && view === 'admin-users') return <AdminUsersPage onBack={() => setView('catalog')} onMovies={() => setView('admin')} />;
  if (user?.role === 'ADMIN' && view === 'movie-form') return <MovieFormPage movie={editingMovie} onCancel={() => setView('admin')} onSaved={() => setView('admin')} />;
  return <CatalogPage onSignIn={() => setView('auth')} onAdmin={() => setView('admin')} onProfile={() => setView('profile')} onSelectMovie={(movieId) => { setSelectedMovieId(movieId); setView('movie-detail'); }} />;
}
