import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const TYPE_META = {
  follow: { icon: "👤", label: (n) => `${n.senderName} followed you` },
  like:   { icon: "♥",  label: (n) => `${n.senderName} liked your post${n.bookTitle ? ` on ${n.bookTitle}` : ""}` },
  reply:  { icon: "💬", label: (n) => `${n.senderName} replied to your post${n.bookTitle ? ` on ${n.bookTitle}` : ""}` },
  review: { icon: "⭐", label: (n) => `${n.senderName} reviewed ${n.bookTitle || "a book you're reading"}` },
};

function formatTime(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
      // Mark all read after opening the page
      await API.patch("/notifications/read-all");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (n) => {
    if (n.bookId && (n.type === "like" || n.type === "reply" || n.type === "review")) {
      navigate(`/books/${n.bookId}`);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">Inbox</span>
        <h1 className="page-title">Notifications</h1>
      </div>

      {loading && (
        <div className="page-loader">
          <span className="loader-dot" /><span className="loader-dot" /><span className="loader-dot" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="empty-feed">
          <p className="empty-feed-icon">🔔</p>
          <p className="empty-feed-text">You're all caught up. Nothing new yet.</p>
        </div>
      )}

      <div className="notif-list">
        {notifications.map((n) => {
          const meta = TYPE_META[n.type] || {};
          const clickable = n.bookId && n.type !== "follow";
          return (
            <div
              key={n._id}
              className={`notif-item${!n.read ? " unread" : ""}${clickable ? " clickable" : ""}`}
              onClick={() => clickable && handleClick(n)}
            >
              <div className="notif-icon">{meta.icon}</div>
              <div className="notif-body">
                <p className="notif-text">{meta.label ? meta.label(n) : "New notification"}</p>
                <span className="notif-time">{formatTime(n.createdAt)}</span>
              </div>
              {!n.read && <span className="notif-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notifications;