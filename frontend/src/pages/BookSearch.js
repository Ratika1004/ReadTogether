import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BookSearch() {
  const [query,        setQuery]        = useState("");
  const [books,        setBooks]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [addLoading,   setAddLoading]   = useState(false);
  const [addedBooks,   setAddedBooks]   = useState({});
  const navigate = useNavigate();

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setBooks([]);
    try {
      const res = await API.get(`/books/search?q=${encodeURIComponent(query)}`);
      setBooks(res.data);
      if (res.data.length === 0) setError("No books found. Try a different search.");
    } catch {
      setError("Error fetching books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = async (status) => {
    if (!selectedBook) return;
    setAddLoading(true);
    try {
      await API.post("/reading/add", {
        bookId: selectedBook.id,
        title:  selectedBook.title,
        author: selectedBook.authors.join(", "),
        cover:  selectedBook.cover,
        status,
      });
      setAddedBooks((prev) => ({ ...prev, [selectedBook.id]: status }));
      setSelectedBook(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding book");
    } finally {
      setAddLoading(false);
    }
  };

  const STATUS_LABEL = {
    reading:   "📖 Reading",
    completed: "✅ Finished",
    wishlist:  "📝 Want to Read",
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-eyebrow">Discover</span>
        <h1 className="page-title">Search Books</h1>
      </div>

      <form onSubmit={searchBooks} className="search-bar">
        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            placeholder="Search by title, author, or ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="button search-btn" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="page-error">{error}</p>}

      {books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-card-cover">
                {book.cover
                  ? <img src={book.cover} alt={book.title} />
                  : <div className="book-card-no-cover">📖</div>
                }
              </div>
              <div className="book-card-info">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.authors.join(", ")}</p>
                {book.publishedYear && (
                  <p className="book-card-year">{book.publishedYear}</p>
                )}
                <div className="book-card-actions">
                  {addedBooks[book.id] ? (
                    <span className="book-added-badge">
                      {STATUS_LABEL[addedBooks[book.id]]}
                    </span>
                  ) : (
                    <button className="btn-outline" onClick={() => setSelectedBook(book)}>
                      + Add to List
                    </button>
                  )}
                  <button className="btn-ghost" onClick={() => navigate(`/books/${book.id}`)}>
                    Discussion
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add to your shelf</h3>
              <p className="modal-subtitle">{selectedBook.title}</p>
            </div>
            <div className="modal-options">
              {[
                { value: "reading",   label: "📖 Currently Reading" },
                { value: "completed", label: "✅ Finished" },
                { value: "wishlist",  label: "📝 Want to Read" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className="modal-option"
                  onClick={() => handleStatusSelect(opt.value)}
                  disabled={addLoading}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setSelectedBook(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSearch;