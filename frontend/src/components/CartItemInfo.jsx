import React from 'react';
import { useProductInfo } from '../hooks/useProductInfo';

const CartItemInfo = ({ productId, fallbackName = 'Đang tải...' }) => {
  const { product, loading, error } = useProductInfo(productId);

  if (loading) {
    return <span>{fallbackName}</span>;
  }

  if (error || !product) {
    return <span>{fallbackName}</span>;
  }

  return <span>{product.name || fallbackName}</span>;
};

export default CartItemInfo;
