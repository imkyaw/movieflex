import { useEffect, useState } from 'react';
import * as movieApi from '../api/movies';
import type { Movie } from '../api/movies';

export function MovieDetailPage({ movieId, onBack }: { movieId: string; onBack(): void }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    movieApi.getMovie(movieId)
      .then((result) => { setMovie(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load movie.'))
      .finally(() => setLoading(false));
  }, [movieId]);

  return <main className="store-shell">
    <header className="store-header detail-header">
      <button className="wordmark" type="button" onClick={onBack}>MovieFlex</button>
      <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    </header>
    <section className="catalog-content">
      {error ? <div className="page-message error">{error}</div>
        : loading || !movie ? <div className="page-message">Loading movie…</div>
        : <div className="detail-layout">
            <div className="poster-placeholder detail-poster">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <span>▧</span>}</div>
            <div className="detail-info">
              <h1>{movie.title}</h1>
              <div className="detail-meta">
                <span>{movie.releaseDate.slice(0, 4)}</span>
                <span>{movie.classification}</span>
                <span>{movie.runtimeMinutes} min</span>
                <span>{movie.genre}</span>
              </div>
              <p className="detail-description">{movie.description}</p>
              <dl className="detail-facts">
                <div><dt>Director</dt><dd>{movie.director}</dd></div>
                <div><dt>Release date</dt><dd>{movie.releaseDate}</dd></div>
                <div><dt>Stock</dt><dd>{movie.stock > 0 ? `${movie.stock} available` : 'Out of stock'}</dd></div>
              </dl>
              <div className="detail-price-row">
                <strong>${(movie.priceCents / 100).toFixed(2)}</strong>
                <button className="primary-button" type="button" disabled title="Ordering isn't available yet">Add to cart</button>
              </div>
            </div>
          </div>}
    </section>
  </main>;
}
