import { useEffect, useState, useCallback } from "react";
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

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await API.get(`/books/${bookId}`);
      setBook(res.data);
    } catch { }
  }, [bookId]);

  const fetchPosts = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await API.get(`/posts/${bookId}`);
      setPosts(res.data);
    } catch { }
  }, [bookId]);

  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await API.get(`/reviews/book/${bookId}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
    } catch { }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
    fetchPosts();
    fetchReviews();
  }, [fetchBook, fetchPosts, fetchReviews]);

  // Other functions (createPost, likePost, deletePost, submitReview, etc.) remain unchanged

  return (
    <div className="page">
      {/* Book feed UI, discussion and review tabs remain unchanged */}
    </div>
  );
}

export default BookFeed;