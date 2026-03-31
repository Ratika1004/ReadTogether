import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function UserSearch() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [followState, setFollowState] = useState({}); // { [userId]: { following, count } }
  const navigate = useNavigate();

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch {
      setError("Error searching users.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input — search 400ms after user stops typing
  let debounceTimer;
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(val), 400);
  };

  const handleFollow = async (userId, currentlyFollowing) => {
    try {
      const res = await API.patch(`/users/${userId}/follow`);
      setFollowState((prev) => ({
        ...prev,
        [userId]: {
          following: res.data.following,
          count:     res.data.followerCount,
        },
      }));
    } catch {
      // Silently fail — UI stays as-is
    }
  };

  const getFollowState = (user) => {
    if (followState[user._id] !== undefined) return followState[user._id];
    return { following: user.isFollowing, count: user.followerCount };
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">Community</span>
        <h1 className="page-title">Find Readers</h1>
        <p className="page-subtitle">Search by name to discover and follow other readers</p>
      </div>

      <div className="search-bar" style={{ marginBottom: "32px" }}>
        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            placeholder="Search by name…"
            value={query}
            onChange={handleChange}
            autoFocus
          />
        </div>
      </div>

      {loading && (
        <div className="page-loader">
          <span className="loader-dot" /><span className="loader-dot" /><span className="loader-dot" />
        </div>
      )}

      {error && <p className="page-error">{error}</p>}

      {!loading && query && results.length === 0 && (
        <p className="empty-state">No readers found for "{query}".</p>
      )}

      {results.length > 0 && (
        <div className="user-results">
          {results.map((user) => {
            const { following, count } = getFollowState(user);
            return (
              <div key={user._id} className="user-card">
                <div
                  className="user-card-avatar"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>

                <div className="user-card-info">
                  <p
                    className="user-card-name"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    {user.name}
                  </p>
                  {user.bio && (
                    <p className="user-card-bio">{user.bio}</p>
                  )}
                  <p className="user-card-followers">
                    {count} {count === 1 ? "follower" : "followers"}
                  </p>
                </div>

                <div className="user-card-actions">
                  <button
                    className={following ? "btn-outline" : "button user-follow-btn"}
                    onClick={() => handleFollow(user._id, following)}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!query && (
        <div className="empty-feed">
          <p className="empty-feed-icon">👥</p>
          <p className="empty-feed-text">
            Start typing to find other readers in the community.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserSearch;