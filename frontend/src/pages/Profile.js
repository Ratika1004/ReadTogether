import { useEffect, useState, useCallback } from "react";
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

  const fetchProfileUser = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await API.get(`/users/${profileId}`);
      setProfileUser(res.data);
      if (user) {
        setFollowing(res.data.followers?.some((f) => f._id === user.id));
      }
    } catch { }
  }, [profileId, user]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await API.get("/reading/my-books");
      setBooks(res.data);
    } catch { }
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await API.get(`/reviews/user/${profileId}`);
      setReviews(res.data);
    } catch { }
  }, [profileId]);

  useEffect(() => {
    fetchBooks();
    fetchProfileUser();
    fetchReviews();
  }, [fetchBooks, fetchProfileUser, fetchReviews]);

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
      {/* Profile header, tabs, and content stays unchanged */}
    </div>
  );
}

export default Profile;