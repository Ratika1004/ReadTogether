import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await API.get("/posts/feed");
      setPosts(res.data);
    } catch {
    } finally {
      setLoading(false);
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
    } catch {}
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {}
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">Community</span>
        <h1 className="page-title">Activity Feed</h1>
        <p className="page-subtitle">See what readers are saying</p>
      </div>

      {loading && (
        <div className="page-loader">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-feed">
          <p className="empty-feed-icon">📚</p>
          <p className="empty-feed-text">The feed is quiet. Search for a book and start a discussion!</p>
          <button className="button" onClick={() => navigate("/search")}>
            Find Books
          </button>
        </div>
      )}

      <div className="posts-list">
        {posts.map((p) => (
          <div key={p._id} className="post-card">
            <div className="post-card-header">
              <div className="post-avatar">{p.userName?.[0]?.toUpperCase()}</div>
              <div className="post-meta">
                <span className="post-username">{p.userName}</span>
                {p.bookTitle && (
                  <span
                    className="post-book-link"
                    onClick={() => navigate(`/books/${p.bookId}`)}
                  >
                    on <em>{p.bookTitle}</em>
                  </span>
                )}
                <span className="post-time">{formatTime(p.createdAt)}</span>
              </div>
              {user && p.userId === user.id && (
                <button className="post-delete" onClick={() => deletePost(p._id)}>
                  ✕
                </button>
              )}
            </div>

            <p className="post-text">{p.text}</p>

            <div className="post-card-footer">
              <button className="like-btn" onClick={() => likePost(p._id)}>
                ♥ {p.likes?.length || 0}
              </button>
              {p.bookId && (
                <button
                  className="btn-ghost post-discuss-btn"
                  onClick={() => navigate(`/books/${p.bookId}`)}
                >
                  View Discussion →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;