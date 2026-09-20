import { useEffect, useState } from 'react';
import * as reviewApi from '../api/reviews';
import type { Movie } from '../api/movies';
import type { Review } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

function stars(rating: number) {
  const rounded = Math.round(rating);
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(rounded);
}

function StarPicker({ value, onChange }: { value: number; onChange(rating: number): void }) {
  return <div className="star-picker" role="radiogroup" aria-label="Your rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        role="radio"
        aria-checked={value === star}
        aria-label={`${star} star${star === 1 ? '' : 's'}`}
        className={star <= value ? 'filled' : ''}
        onClick={() => onChange(star)}
      >★</button>
    ))}
  </div>;
}

export function MovieDetailModal({ movie, onClose, onAddToCart }: { movie: Movie; onClose(): void; onAddToCart(quantity: number): Promise<void> }) {
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState('');
  const outOfStock = movie.stock <= 0;

  async function handleAddToCart() {
    setAddingToCart(true);
    setCartError('');
    try {
      await onAddToCart(quantity);
    } catch (caught) {
      setCartError(caught instanceof Error ? caught.message : 'Unable to add to cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState({ count: 0, average: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    setReviewsLoading(true);
    reviewApi.listReviews(movie.movieId)
      .then((result) => { setReviews(result.data); setReviewMeta(result.meta); setReviewsError(''); })
      .catch((caught: unknown) => setReviewsError(caught instanceof Error ? caught.message : 'Unable to load reviews.'))
      .finally(() => setReviewsLoading(false));
  }, [movie.movieId]);

  useEffect(() => {
    if (prefilled || !user) return;
    const own = reviews.find((review) => review.userId === user.userId);
    if (own) { setRating(own.rating); setComment(own.comment); setPrefilled(true); }
  }, [reviews, user, prefilled]);

  const ownReview = user ? reviews.find((review) => review.userId === user.userId) : undefined;

  async function submitReview() {
    if (!token) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const saved = await reviewApi.submitReview(movie.movieId, { rating, comment }, token);
      setReviews((current) => {
        const withoutOwn = current.filter((review) => review.userId !== saved.userId);
        const next = [saved, ...withoutOwn];
        const average = Math.round((next.reduce((sum, review) => sum + review.rating, 0) / next.length) * 10) / 10;
        setReviewMeta({ count: next.length, average });
        return next;
      });
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Unable to submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={movie.title} onClick={onClose}>
    <div className="movie-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
      <div className="modal-poster">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <span>▧</span>}</div>
      <div className="modal-body">
        <h2>{movie.title}</h2>
        <p className="modal-meta">{movie.releaseDate.slice(0, 4)} · {movie.classification} · {movie.runtimeMinutes} min · {movie.genre}</p>
        <p className="modal-director">Directed by {movie.director}</p>
        <p className="modal-description">{movie.description}</p>
        <div className="modal-footer">
          <div>
            <strong className="modal-price">${(movie.priceCents / 100).toFixed(2)}</strong>
            <span className={outOfStock ? 'stock zero' : 'stock'}>{outOfStock ? 'Out of stock' : `${movie.stock} in stock`}</span>
          </div>
          {!outOfStock && <div className="qty-stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => Math.min(movie.stock, q + 1))} disabled={quantity >= movie.stock}>+</button>
          </div>}
        </div>
        {cartError && <div className="form-error">{cartError}</div>}
        <button className="primary-button" type="button" disabled={outOfStock || addingToCart} onClick={handleAddToCart}>
          {outOfStock ? 'Out of stock' : addingToCart ? 'Adding…' : user ? 'Add to Cart' : 'Sign in to add to cart'}
        </button>

        <section className="reviews-section">
          <div className="reviews-heading">
            <h3>Reviews</h3>
            {reviewMeta.count > 0 && <span className="reviews-average"><span className="stars">{stars(reviewMeta.average)}</span> {reviewMeta.average.toFixed(1)} · {reviewMeta.count} review{reviewMeta.count === 1 ? '' : 's'}</span>}
          </div>

          {reviewsLoading ? <p className="reviews-empty">Loading reviews…</p>
            : reviewsError ? <div className="form-error">{reviewsError}</div>
            : reviews.length === 0 ? <p className="reviews-empty">No reviews yet. Be the first to share your thoughts.</p>
            : <ul className="review-list">
              {reviews.map((review) => <li className="review-item" key={review.reviewId}>
                <div className="review-item-head">
                  <span className="review-author">{review.userName}{user && review.userId === user.userId ? ' (you)' : ''}</span>
                  <span className="stars">{stars(review.rating)}</span>
                </div>
                <p>{review.comment}</p>
              </li>)}
            </ul>}

          {user ? <div className="review-form">
            <p className="review-form-label">{ownReview ? 'Update your review' : 'Write a review'}</p>
            <StarPicker value={rating} onChange={setRating} />
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="What did you think of this movie?"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {submitError && <div className="form-error">{submitError}</div>}
            <button className="secondary-button" type="button" disabled={submitting || !comment.trim()} onClick={submitReview}>
              {submitting ? 'Saving…' : ownReview ? 'Update review' : 'Submit review'}
            </button>
          </div> : <p className="reviews-empty">Sign in to leave a review.</p>}
        </section>
      </div>
    </div>
  </div>;
}
