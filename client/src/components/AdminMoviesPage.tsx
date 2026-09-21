import { useEffect, useMemo, useState } from 'react';
import * as movieApi from '../api/movies';
import type { Movie } from '../api/movies';
import { useAuth } from '../context/AuthContext';

const LOW_STOCK_THRESHOLD = 5;

function stockClass(stock: number) {
  if (stock === 0) return 'stock zero';
  if (stock <= LOW_STOCK_THRESHOLD) return 'stock low';
  return 'stock';
}

export function AdminMoviesPage({ onBack, onEdit, onAdd, onDashboard, onUsers, onOrders }: { onBack(): void; onEdit(movie: Movie): void; onAdd(): void; onDashboard(): void; onUsers(): void; onOrders(): void }) {
  const { token, user, logout } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [error, setError] = useState('');

  function load() {
    movieApi.listMovies({ limit: 50 })
      .then((result) => { setMovies(result.data); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load movies.'));
  }
  useEffect(load, []);

  const genres = useMemo(() => [...new Set(movies.map((movie) => movie.genre))].sort(), [movies]);
  const ratings = useMemo(() => [...new Set(movies.map((movie) => movie.classification))].sort(), [movies]);
  const filtered = useMemo(() => movies.filter((movie) => {
    const term = search.toLowerCase();
    return (!genre || movie.genre === genre)
      && (!status || movie.status === status)
      && (!rating || movie.classification === rating)
      && (!term || `${movie.title} ${movie.director}`.toLowerCase().includes(term));
  }), [genre, status, rating, movies, search]);

  async function discontinue(movie: Movie) {
    if (!token || !window.confirm(`Discontinue "${movie.title}"?`)) return;
    try {
      await movieApi.discontinueMovie(movie.movieId, token);
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to discontinue movie.');
    }
  }

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button className="active" type="button">Movies</button>
        <button type="button" onClick={onOrders}>Orders</button>
        <button type="button" onClick={onUsers}>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Movies</h1><span className="admin-badge">ADMIN</span><span className="count-badge">{filtered.length} titles</span></div>
        <button className="primary-button" type="button" onClick={onAdd}>+ Add movie</button>
      </div>
      <div className="admin-filters">
        <input aria-label="Search admin movies" placeholder="Search by title or director…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by genre" value={genre} onChange={(event) => setGenre(event.target.value)}>
          <option value="">Genre</option>
          {genres.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
        <select aria-label="Filter by rating" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="">Rating</option>
          {ratings.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {error && <div className="page-message error">{error}</div>}
      <div className="movie-table-wrap">
        <table className="movie-table">
          <thead><tr><th>Title</th><th>Genre</th><th>Director</th><th>Release date</th><th>Rating</th><th>Min</th><th>Stock</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((movie) => <tr key={movie.movieId}>
              <td>
                <div className="table-title">
                  <span className="mini-poster">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : '▧'}</span>
                  <strong>{movie.title}</strong>
                </div>
              </td>
              <td>{movie.genre}</td>
              <td>{movie.director}</td>
              <td>{movie.releaseDate}</td>
              <td>{movie.classification}</td>
              <td>{movie.runtimeMinutes}</td>
              <td><span className={stockClass(movie.stock)}>{movie.stock}</span></td>
              <td><strong>${(movie.priceCents / 100).toFixed(2)}</strong></td>
              <td><span className={`status${movie.status === 'ACTIVE' ? ' active' : ' inactive'}`}>{movie.status === 'ACTIVE' ? 'Active' : 'Discontinued'}</span></td>
              <td>
                <div className="row-actions">
                  <button type="button" onClick={() => onEdit(movie)} aria-label={`Edit ${movie.title}`}>✎</button>
                  <button className="danger" type="button" onClick={() => discontinue(movie)} aria-label={`Discontinue ${movie.title}`}>🗑</button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="page-message">No movies match your filters.</div>}
      </div>
    </section>
  </main>;
}
