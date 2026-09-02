import { useEffect, useMemo, useState } from 'react';
import * as movieApi from '../api/movies';
import type { Movie } from '../api/movies';
import { useAuth } from '../context/AuthContext';

export function CatalogPage({ onSignIn, onAdmin }: { onSignIn(): void; onAdmin(): void }) {
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    movieApi.listMovies({ limit: 50 }).then((result) => {
      setGenres([...new Set(result.data.map((movie) => movie.genre))].sort());
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      movieApi.listMovies({ search, genre, page, limit: 8 })
        .then((result) => { setMovies(result.data); setTotalPages(result.meta.totalPages); setError(''); })
        .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load movies.'))
        .finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [genre, page, search]);

  const pages = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  return <main className="store-shell">
    <header className="store-header">
      <button className="wordmark" type="button" onClick={() => { setSearch(''); setGenre(''); setPage(1); }}>MovieFlex</button>
      <div className="search-box"><span>⌕</span><input aria-label="Search movies" placeholder="Search movies, directors, genres…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
      <div className="header-actions">
        {user?.role === 'ADMIN' && <button className="secondary-button" type="button" onClick={onAdmin}>Admin</button>}
        {user ? <><span className="user-name">{user.name}</span><button className="avatar-button" type="button" onClick={logout} title="Sign out">{user.name.charAt(0).toUpperCase()}</button></> : <button className="primary-button compact" type="button" onClick={onSignIn}>Sign in</button>}
      </div>
    </header>
    <nav className="genre-bar" aria-label="Movie genres">
      <button className={!genre ? 'active' : ''} type="button" onClick={() => { setGenre(''); setPage(1); }}>All</button>
      {genres.map((item) => <button className={genre === item ? 'active' : ''} type="button" key={item} onClick={() => { setGenre(item); setPage(1); }}>{item}</button>)}
    </nav>
    <section className="catalog-content" aria-live="polite">
      {error ? <div className="page-message error">{error}</div> : loading ? <div className="page-message">Loading catalogue…</div> : movies.length === 0 ? <div className="page-message">No movies match your filters.</div> : <div className="movie-grid">
        {movies.map((movie) => <article className="movie-card" key={movie.movieId}>
          <div className="poster-placeholder">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <span>▧</span>}</div>
          <div className="movie-card-body"><h2>{movie.title}</h2><p>{movie.releaseDate.slice(0, 4)} · {movie.classification}</p><strong>${(movie.priceCents / 100).toFixed(2)}</strong></div>
        </article>)}
      </div>}
    </section>
    {totalPages > 1 && <nav className="pagination" aria-label="Catalogue pages">{pages.map((item) => <button className={page === item ? 'active' : ''} type="button" key={item} onClick={() => setPage(item)}>{item}</button>)}</nav>}
  </main>;
}
