import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProductReview.css';

const ProductReview = ({ productId }) => {
  const [summary, setSummary] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        // 1. Get summary
        const { data: summaryData } = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/summaries/${productId}`
        );
        setSummary(summaryData.summary || '');

        // 2. Get reviews
        const { data: reviewsData } = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/product/${productId}`
        );
        setReviews(reviewsData);

        // 3. Map userId -> username
        const usernameResults = await Promise.all(
          reviewsData.map(async (review) => {
            const rawUserId = review.userId?._id || review.userId;
            try {
              const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/username/${rawUserId}`
              );
              return {
                userId: rawUserId,
                username: data.username || 'Anonymous'
              };
            } catch {
              return { userId: rawUserId, username: 'Anonymous' };
            }
          })
        );
        const usernameMap = Object.fromEntries(
          usernameResults.map(({ userId, username }) => [userId, username])
        );
        setUsernames(usernameMap);

        // 4. Get average rating
        const { data: avgData } = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/average/${productId}`
        );
        setAverageRating(avgData.averageRating || 0);
        setTotalReviews(avgData.totalReviews || 0);
      } catch (err) {
        console.error('Error loading review data:', err);
      }
    };

    fetchData();
  }, [productId]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="product-review-container">
      <h3>Đánh giá sản phẩm</h3>

      {/* Summary Section */}
      {summary && (
        <div className="product-summary">
          <h4>Summary</h4>
          <p>{summary}</p>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        {reviews.length > 0 ? (
          <>
            <p>
              Average Rating: {averageRating.toFixed(1)} ({totalReviews} reviews)
            </p>
            <button className="toggle-btn" onClick={toggleExpand}>
              {isExpanded ? 'Hide Reviews' : `Show All (${reviews.length})`}
            </button>

            {isExpanded && (
              <div className="review-list">
                {reviews.map((review) => {
                  const userId = review.userId?._id || review.userId;
                  const username = usernames[userId] || 'Anonymous';
                  return (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{username}</span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={index < review.rating ? 'star-filled' : 'star-empty'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="review-comment">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p>No reviews for this product yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProductReview;
