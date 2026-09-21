import { useRef, useState, type DragEvent, type FormEvent } from 'react';
import * as movieApi from '../api/movies';
import type { Movie, MovieInput } from '../api/movies';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller'];
const RATINGS = ['G', 'PG', 'M', 'R13', 'R16', 'R18'];
const ACCEPTED_POSTER_TYPES = ['image/jpeg', 'image/png'];
const MAX_POSTER_BYTES = 5 * 1024 * 1024;

const emptyForm: MovieInput = { title: '', description: '', genre: '', director: '', releaseDate: '', classification: '', runtimeMinutes: 90, priceCents: 0, stock: 0, status: 'ACTIVE', posterUrl: '' };

export function MovieFormPage({ movie, onCancel, onSaved, onDashboard, onUsers, onOrders }: { movie: Movie | null; onCancel(): void; onSaved(): void; onDashboard(): void; onUsers(): void; onOrders(): void }) {
  const { token, user } = useAuth();
  const [form, setForm] = useState<MovieInput>(() => movie ? {
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    director: movie.director,
    releaseDate: movie.releaseDate,
    classification: movie.classification,
    runtimeMinutes: movie.runtimeMinutes,
    priceCents: movie.priceCents,
    stock: movie.stock,
    status: movie.status,
    posterUrl: movie.posterUrl ?? '',
  } : emptyForm);
  const [price, setPrice] = useState(() => (form.priceCents / 100).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [discontinuing, setDiscontinuing] = useState(false);
  const [discontinueError, setDiscontinueError] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterError, setPosterError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof MovieInput>(key: K, value: MovieInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadPoster(file: File) {
    if (!token) return;
    if (!ACCEPTED_POSTER_TYPES.includes(file.type)) { setPosterError('Only JPEG or PNG images are allowed.'); return; }
    if (file.size > MAX_POSTER_BYTES) { setPosterError('File exceeds the 5 MB limit.'); return; }
    setUploadingPoster(true);
    setPosterError('');
    try {
      const { url } = await movieApi.uploadPoster(file, token);
      set('posterUrl', url);
    } catch (caught) {
      setPosterError(caught instanceof Error ? caught.message : 'Unable to upload poster.');
    } finally {
      setUploadingPoster(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void uploadPoster(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    const payload = { ...form, priceCents: Math.round(Number(price) * 100) };
    try {
      if (movie) await movieApi.updateMovie(movie.movieId, payload, token);
      else await movieApi.createMovie(payload, token);
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save movie.');
    } finally {
      setSaving(false);
    }
  }

  async function discontinue() {
    if (!token || !movie || !window.confirm(`Discontinue “${movie.title}”? It will be hidden from the public catalogue, but its order history is kept.`)) return;
    setDiscontinuing(true);
    setDiscontinueError('');
    try {
      await movieApi.discontinueMovie(movie.movieId, token);
      onSaved();
    } catch (caught) {
      setDiscontinueError(caught instanceof Error ? caught.message : 'Unable to discontinue movie.');
    } finally {
      setDiscontinuing(false);
    }
  }

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onCancel}>MovieFlex <small>ADMIN</small></button>
      <nav><button type="button" onClick={onDashboard}>Dashboard</button><button className="active" type="button">Movies</button><button type="button" onClick={onOrders}>Orders</button><button type="button" onClick={onUsers}>Users</button></nav>
      <div className="admin-user"><span className="admin-avatar">{user?.name.charAt(0).toUpperCase()}</span>{user?.name}</div>
    </header>
    <section className="admin-content">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onCancel}>Movies</button>
        <span>›</span>
        <span>{movie ? movie.title : 'New movie'}</span>
        <span>›</span>
        <span>{movie ? 'Edit' : 'Add'}</span>
      </nav>
      <div className="admin-title-row">
        <div><h1>{movie ? 'Update movie' : 'Add movie'}</h1><span className="admin-badge">ADMIN</span></div>
      </div>
      <div className="movie-form-layout">
        <form className="movie-form" onSubmit={submit}>
          <div className="span-2">
            <label>Title
              <input value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="e.g. Burning Hours" required />
            </label>
          </div>
          <label>Genre
            <select value={form.genre} onChange={(event) => set('genre', event.target.value)} required>
              <option value="" disabled>Select genre</option>
              {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
          </label>

          <label>Director
            <input value={form.director} onChange={(event) => set('director', event.target.value)} placeholder="e.g. Maya Okonkwo" required />
          </label>
          <label>Release date
            <input type="date" value={form.releaseDate} onChange={(event) => set('releaseDate', event.target.value)} required />
          </label>
          <label>Rating
            <select value={form.classification} onChange={(event) => set('classification', event.target.value)} required>
              <option value="" disabled>Select rating</option>
              {RATINGS.map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </select>
          </label>

          <label>Screen time (min)
            <input type="number" min="1" value={form.runtimeMinutes} onChange={(event) => set('runtimeMinutes', Number(event.target.value))} required />
          </label>
          <label>Price (USD)
            <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </label>
          <label>Stock
            <input type="number" min="0" value={form.stock} onChange={(event) => set('stock', Number(event.target.value))} required />
          </label>

          <div className="span-2">
            <label>Poster URL
              <input type="url" value={form.posterUrl ?? ''} onChange={(event) => set('posterUrl', event.target.value)} placeholder="https://…/poster.jpg" />
            </label>
          </div>
          <label>Status
            <select value={form.status} onChange={(event) => set('status', event.target.value as MovieInput['status'])}>
              <option value="ACTIVE">Active</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </label>

          <div className="span-3">
            <label>Description
              <textarea rows={5} value={form.description} onChange={(event) => set('description', event.target.value)} placeholder="A short synopsis…" required />
            </label>
          </div>

          {error && <div className="form-error span-3">{error}</div>}
          <div className="form-actions span-3">
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save movie'}</button>
            <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>

        <div className="admin-sidebar">
          <aside className="poster-panel">
            <h2>Poster (Poster URL)</h2>
            {form.posterUrl ? <div className="poster-preview small"><img src={form.posterUrl} alt="Poster preview" /></div> : <div className="poster-preview small poster-preview-empty"><span>▧</span></div>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPoster(file); event.target.value = ''; }}
            />
            <div
              className={`poster-drop${dragging ? ' dragging' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click(); }}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <strong>↑</strong>
              <span>{uploadingPoster ? 'Uploading…' : 'Replace poster'}</span>
              <small>JPEG or PNG · max 5 MB</small>
            </div>
            {posterError && <div className="form-error">{posterError}</div>}
            <p>Or paste a URL in the Poster URL field.</p>
          </aside>

          {movie && <aside className="poster-panel danger-panel">
            <h2>Danger zone</h2>
            <p>Discontinuing hides this movie from the public catalogue and its order history is kept.</p>
            {discontinueError && <div className="form-error">{discontinueError}</div>}
            <button className="secondary-button danger" type="button" disabled={discontinuing} onClick={discontinue}>
              {discontinuing ? 'Discontinuing…' : 'Discontinue movie'}
            </button>
          </aside>}
        </div>
      </div>
    </section>
  </main>;
}
