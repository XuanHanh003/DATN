import React, { useEffect, useState } from "react";
import bannerImage from "../images/banner.jpg";
import "../styles/banner.css";

const DISMISS_KEY = "summerBannerDismissedAt";
const DISMISS_TTL_HOURS = 24;

const SummerBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const diffHrs = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (diffHrs < DISMISS_TTL_HOURS) {
        setIsVisible(false);
        return;
      }
    }
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isVisible]);

  const handleClose = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsVisible(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="banner-container"
      role="dialog"
      aria-modal="true"
      aria-label="Summer promotion banner"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="overlay" aria-hidden="true"></div>
      <div className="banner">
        <button
          className="close-btn"
          onClick={handleClose}
          aria-label="Đóng banner khuyến mãi"
        >
          ×
        </button>
        <img
          src={bannerImage}
          alt="Mùa hè rực rỡ - Giảm 20% đồ ăn vặt sấy khô"
        />
      </div>
    </div>
  );
};

export default SummerBanner;
