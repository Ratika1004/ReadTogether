import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function formatTime(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

const STATUS_LABEL = {
  reading:   "📖 started reading",
  wishlist:  "📝 added to wishlist",
  completed: "✅ finished reading",
};

function ActivityCard({ activity, onNavigate }) {
  const { type, userName, userId, bookTitle, bookId, bookCover,
          postText, reviewRating, reviewText, shelfStatus, createdAt } = activity;

  return (
    <div className="post-card activity-card">
      <div className="post-card-header">
        <div
          className="post-avatar activity-avatar"
          onClick={() => onNavigate(`/profile/${userId}`)}
          title={`View ${userName}'s profile`}
        >
          {userName?.[0]?.toUpperCase()}
        </div>
        <div className="post-meta">
          <span
            className="post-username activity-username"
            onClick={() => onNavigate(`/profile/${userId}`)}
          >
            {userName}
          </span>
          <span className="post-time">{formatTime(createdAt)}</span>
        </div>
      </div>

      {/* Post */}
      {type === "post" && (
        <div className="activity-body">
          <p className="activity-action">
            commented on{" "}
            <span className="activity-book-link" onClick={() => onNavigate(`/books/${bookId}`)}>
              {bookTitle || "a book"}
            </span>
          </p>
          <p className="activity-quote">"{postText}"</p>
        </div>
      )}

      {/* Shelf add / completed */}
      {(type === "shelf_add" || type === "completed") && (
        <div className="activity-body activity-shelf">
          {bookCover && (
            <img
              className="activity-cover"
              src={bookCover}
              alt={bookTitle}
              onClick={() => onNavigate(`/books/${bookId}`)}
            />
          )}
          <div>
            <p className="activity-action">
              {STATUS_LABEL[shelfStatus] || STATUS_LABEL[type === "completed" ? "completed" : "reading"]}
            </p>
            <p
              className="activity-book-link"
              onClick={() => onNavigate(`/books/${bookId}`)}
            >
              {bookTitle}
            </p>
          </div>
        </div>
      )}

      {/* Review */}
      {type === "review" && (
        <div className="activity-body">
          <p className="activity-action">
            reviewed{" "}
            <span className="activity-book-link" onClick={() => onNavigate(`/books/${bookId}`)}>
              {bookTitle || "a book"}
            </span>
          </p>
          <div className="activity-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < reviewRating ? "star filled" : "star"}>★</span>
            ))}
          </div>
          {reviewText && <p className="activity-quote">"{reviewText}"</p>}
        </div>
      )}

      {bookId && (
        <div className="post-card-footer">
          <button className="btn-ghost post-discuss-btn" onClick={() => onNavigate(`/books/${bookId}`)}>
            View Discussion →
          </button>
        </div>
      )}
    </div>
  );
}

function FriendFeed() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await API.get("/activity/friend-feed");
      setData(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">Following</span>
        <h1 className="page-title">Friend Feed</h1>
        <p className="page-subtitle">What your people are reading</p>
      </div>

      {loading && (
        <div className="page-loader">
          <span className="loader-dot" /><span className="loader-dot" /><span className="loader-dot" />
        </div>
      )}

      {!loading && data?.empty && (
        <div className="empty-feed">
          <p className="empty-feed-icon">📚</p>
          <p className="empty-feed-text">
            Follow some readers to see their activity here.
          </p>
          <button className="button" onClick={() => navigate("/search")}>
            Discover Books & Readers
          </button>
        </div>
      )}

      {!loading && data && !data.empty && (
        <div className="posts-list">
          {data.activities.map((a) => (
            <ActivityCard key={a._id} activity={a} onNavigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendFeed;