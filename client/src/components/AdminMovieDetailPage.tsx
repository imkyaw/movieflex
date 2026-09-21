import { useEffect, useState } from 'react';
import * as moviesApi from '../api/movies';
import type { Movie } from '../api/movies';
import { useAuth } from '../context/AuthContext';

export function AdminMovieDetailPage({ movieId, onBack, onDashboard, onMovies, onUsers, onOrders }: { movieId: string; onBack(): void; onDashboard(): void; onMovies(): void; onUsers(): void; onOrders(): void }) {
  const { user, logout } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    moviesApi.getMovie(movieId)
      .then((result) => { setMovie(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load this movie.'))
      .finally(() => setLoading(false));
  }, [movieId]);

  const outOfStock = !!movie && movie.stock <= 0;

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button className="active" type="button" onClick={onMovies}>Movies</button>
        <button type="button" onClick={onOrders}>Orders</button>
        <button type="button" onClick={onUsers}>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onMovies}>Movies</button>
        <span>›</span>
        <span>{movie ? movie.title : 'Movie'}</span>
      </nav>
      {loading ? <div className="page-message">Loading movie…</div> : error ? <div className="page-message error">{error}</div> : movie && <>
        <div className="admin-title-row">
          <div><h1>{movie.title}</h1><span className={`status${movie.status === 'ACTIVE' ? ' active' : ' inactive'}`}>{movie.status === 'ACTIVE' ? 'Active' : 'Discontinued'}</span></div>
        </div>
        <div className="movie-form-layout">
          <div>
            <p className="modal-meta">{movie.releaseDate.slice(0, 4)} · {movie.classification} · {movie.runtimeMinutes} min · {movie.genre}</p>
            <p className="modal-director">Directed by {movie.director}</p>
            <p className="modal-description">{movie.description}</p>

            <div className="stat-grid compact">
              <div className="stat-card">
                <span className="stat-label">Price</span>
                <strong className="stat-value">${(movie.priceCents / 100).toFixed(2)}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Stock</span>
                <strong className="stat-value"><span className={outOfStock ? 'stock zero' : 'stock'}>{outOfStock ? 'Out of stock' : movie.stock}</span></strong>
              </div>
            </div>
          </div>

          <aside className="poster-panel">
            <div className="poster-preview">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <div className="poster-preview-empty"><span>▧</span></div>}</div>
          </aside>
        </div>
      </>}
    </section>
  </main>;
}
