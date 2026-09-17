import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as watchlistApi from '../api/watchlist';
import type { Movie } from '../api/movies';
import { useAuth } from './AuthContext';

type WatchlistContextValue = {
  movies: Movie[];
  loading: boolean;
  isSaved(movieId: string): boolean;
  toggle(movie: Movie): Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setMovies([]); return; }
    setLoading(true);
    watchlistApi.listWatchlist(token)
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<WatchlistContextValue>(() => ({
    movies,
    loading,
    isSaved(movieId) { return movies.some((movie) => movie.movieId === movieId); },
    async toggle(movie) {
      if (!token) return;
      const saved = movies.some((item) => item.movieId === movie.movieId);
      if (saved) {
        setMovies((current) => current.filter((item) => item.movieId !== movie.movieId));
        await watchlistApi.removeFromWatchlist(movie.movieId, token).catch(() => {
          setMovies((current) => [movie, ...current]);
        });
      } else {
        setMovies((current) => [movie, ...current]);
        await watchlistApi.addToWatchlist(movie.movieId, token).catch(() => {
          setMovies((current) => current.filter((item) => item.movieId !== movie.movieId));
        });
      }
    },
  }), [movies, loading, token]);

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used inside WatchlistProvider.');
  return context;
}
