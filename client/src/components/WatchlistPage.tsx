import { useState } from 'react';
import type { Movie } from '../api/movies';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieDetailModal } from './MovieDetailModal';

export function WatchlistPage({ onBack, embedded }: { onBack?(): void; embedded?: boolean }) {
  const { movies, loading } = useWatchlist();
  const { addItem } = useCart();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const content = <>
    {loading ? <div className="page-message">Loading your watchlist…</div>
      : movies.length === 0 ? <div className="cart-empty">You haven't saved any movies yet. Open a movie and tap “Save” to add it here.</div>
      : <div className="movie-grid watchlist-grid">
        {movies.map((movie) => {
          const outOfStock = movie.stock <= 0;
          return <article
            className={`movie-card clickable${outOfStock ? ' out-of-stock' : ''}`}
            key={movie.movieId}
            role="button"
            tabIndex={0}
            title={`View ${movie.title}`}
            onClick={() => setSelectedMovie(movie)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedMovie(movie); } }}
          >
            <div className="poster-placeholder">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <span>▧</span>}</div>
            <div className="movie-card-body">
              <h2>{movie.title}</h2>
              <p>{movie.releaseDate.slice(0, 4)} · {movie.classification}</p>
              <strong>${(movie.priceCents / 100).toFixed(2)}</strong>
              {outOfStock && <span className="out-of-stock-badge">Out of stock</span>}
            </div>
          </article>;
        })}
      </div>}
    {selectedMovie && <MovieDetailModal
      movie={selectedMovie}
      onClose={() => setSelectedMovie(null)}
      onAddToCart={(quantity) => { addItem(selectedMovie, quantity); setSelectedMovie(null); }}
    />}
  </>;

  if (embedded) return content;

  return <main className="cart-shell">
    <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    <h1>My watchlist</h1>
    {content}
  </main>;
}
