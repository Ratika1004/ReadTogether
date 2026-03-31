import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function BookFeed() {
  const { bookId } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [text, setText] = useState("");
  const [tab, setTab] = useState("discussion");
  const [postLoading, setPostLoading] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    fetchBook();
    fetchPosts();
    fetchReviews();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const res = await API.get(`/books/${bookId}`);
      setBook(res.data);
    } catch { /* book info is optional */ }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get(`/posts/${bookId}`);
      setPosts(res.data);
    } catch { }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/book/${bookId}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
    } catch { }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPostLoading(true);
    try {
      await API.post("/posts", {
        bookId,
        bookTitle: book?.title || "",
        text,
      });
      setText("");
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Error posting");
    } finally {
      setPostLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const res = await API.patch(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: Array(res.data.likes).fill(null) }
            : p
        )
      );
    } catch { }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch { }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewLoading(true);
    try {
      await API.post("/reviews", {
        bookId,
        bookTitle: book?.title || "",
        rating: reviewForm.rating,
        text: reviewForm.text,
      });
      setReviewForm({ rating: 5, text: "" });
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Error submitting review");
    } finally {
      setReviewLoading(false);
    }
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));

  return (
    <div className="page">
      {book && (
        <div className="book-hero">
          {book.cover && <img className="book-hero-cover" src={book.cover} alt={book.title} />}
          <div className="book-hero-info">
            <span className="page-eyebrow">Discussion</span>
            <h1 className="page-title">{book.title}</h1>
            <p className="book-hero-author">{book.authors?.join(", ")}</p>
            {avgRating > 0 && (
              <div className="book-hero-rating">
                {renderStars(Math.round(avgRating))}
                <span className="rating-value">{avgRating} / 5</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab${tab === "discussion" ? " active" : ""}`}
          onClick={() => setTab("discussion")}
        >
          Discussion ({posts.length})
        </button>
        <button
          className={`tab${tab === "reviews" ? " active" : ""}`}
          onClick={() => setTab("reviews")}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {tab === "discussion" && (
        <div className="feed-section">
          <form onSubmit={createPost} className="post-form">
            <textarea
              className="post-textarea"
              placeholder="Share your thoughts on this book…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <div className="post-form-footer">
              <button type="submit" className="button post-btn" disabled={postLoading || !text.trim()}>
                {postLoading ? "Posting…" : "Post"}
              </button>
            </div>
          </form>

          <div className="posts-list">
            {posts.length === 0 && (
              <p className="empty-state">No posts yet. Be the first to start the discussion!</p>
            )}
            {posts.map((p) => (
              <div key={p._id} className="post-card">
                <div className="post-card-header">
                  <div className="post-avatar">{p.userName?.[0]?.toUpperCase()}</div>
                  <div>
                    <span className="post-username">{p.userName}</span>
                    <span className="post-time">{formatTime(p.createdAt)}</span>
                  </div>
                  {user && p.userId === user.id && (
                    <button className="post-delete" onClick={() => deletePost(p._id)}>✕</button>
                  )}
                </div>
                <p className="post-text">{p.text}</p>
                <div className="post-card-footer">
                  <button className="like-btn" onClick={() => likePost(p._id)}>
                    ♥ {p.likes?.length || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="feed-section">
          <form onSubmit={submitReview} className="review-form">
            <div className="review-rating-row">
              <label className="input-label">Your Rating</label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`star-pick${reviewForm.rating >= n ? " selected" : ""}`}
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="post-textarea"
              placeholder="Write your review…"
              value={reviewForm.text}
              onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
              rows={3}
            />
            {reviewError && <p className="form-error">{reviewError}</p>}
            <div className="post-form-footer">
              <button type="submit" className="button post-btn" disabled={reviewLoading || !reviewForm.text.trim()}>
                {reviewLoading ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>

          <div className="posts-list">
            {reviews.length === 0 && (
              <p className="empty-state">No reviews yet. Be the first!</p>
            )}
            {reviews.map((r) => (
              <div key={r._id} className="post-card">
                <div className="post-card-header">
                  <div className="post-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                  <div>
                    <span className="post-username">{r.userName}</span>
                    <span className="post-time">{formatTime(r.createdAt)}</span>
                  </div>
                  <div className="review-stars">{renderStars(r.rating)}</div>
                </div>
                <p className="post-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookFeed;