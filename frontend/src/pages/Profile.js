import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileId = id || user?.id;
  const isOwnProfile = !id || id === user?.id;

  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [tab, setTab] = useState("reading");
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);


// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (profileId) {
      fetchBooks();
      fetchProfileUser();
      fetchReviews();
    }
  }, [profileId]);

  const fetchProfileUser = async () => {
    try {
      const res = await API.get(`/users/${profileId}`);
      setProfileUser(res.data);
      if (user) {
        setFollowing(res.data.followers?.some((f) => f._id === user.id));
      }
    } catch { }
  };

  const fetchBooks = async () => {
    try {
      const res = await API.get("/reading/my-books");
      setBooks(res.data);
    } catch { }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/user/${profileId}`);
      setReviews(res.data);
    } catch { }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await API.patch(`/users/${profileId}/follow`);
      setFollowing(res.data.following);
      setProfileUser((prev) => ({
        ...prev,
        followers: Array(res.data.followerCount).fill(null),
      }));
    } catch { }
    setFollowLoading(false);
  };

  const removeBook = async (bookId) => {
    try {
      await API.delete(`/reading/${bookId}`);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    } catch { }
  };

  const byStatus = (status) => books.filter((b) => b.status === status);

  const renderBookShelf = (list) => {
    if (list.length === 0)
      return <p className="empty-state">Nothing here yet.</p>;
    return (
      <div className="shelf-grid">
        {list.map((book) => (
          <div key={book._id} className="shelf-book">
            {book.cover ? (
              <img src={book.cover} alt={book.title} className="shelf-cover" />
            ) : (
              <div className="shelf-cover-placeholder">📖</div>
            )}
            <div className="shelf-book-info">
              <p className="shelf-book-title">{book.title}</p>
              <p className="shelf-book-author">{book.author}</p>
              <div className="shelf-book-actions">
                <button className="btn-ghost" onClick={() => navigate(`/books/${book.bookId}`)}>
                  Discuss
                </button>
                {isOwnProfile && (
                  <button className="btn-danger" onClick={() => removeBook(book._id)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const displayName = isOwnProfile ? user?.name : profileUser?.name;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {displayName?.[0]?.toUpperCase()}
        </div>
        <div className="profile-meta">
          <h1 className="page-title">{displayName}</h1>
          {profileUser?.bio && <p className="profile-bio">{profileUser.bio}</p>}
          <div className="profile-stats">
            <span><strong>{books.length}</strong> books</span>
            <span><strong>{profileUser?.followers?.length || 0}</strong> followers</span>
            <span><strong>{profileUser?.following?.length || 0}</strong> following</span>
          </div>
          {!isOwnProfile && user && (
            <button
              className={following ? "btn-outline" : "button profile-follow-btn"}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        {["reading", "completed", "wishlist", "reviews"].map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "reading" && `📖 Reading (${byStatus("reading").length})`}
            {t === "completed" && `✅ Finished (${byStatus("completed").length})`}
            {t === "wishlist" && `📝 Want to Read (${byStatus("wishlist").length})`}
            {t === "reviews" && `⭐ Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {tab !== "reviews" && renderBookShelf(byStatus(tab))}

      {tab === "reviews" && (
        <div className="posts-list">
          {reviews.length === 0 && <p className="empty-state">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r._id} className="post-card">
              <div className="post-card-header">
                <span className="post-username">{r.bookTitle || "Unknown Book"}</span>
                <div className="review-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < r.rating ? "star filled" : "star"}>★</span>
                  ))}
                </div>
              </div>
              <p className="post-text">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;