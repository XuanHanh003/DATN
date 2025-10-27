import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import ProductItem from './ProductItem';
import RelatedItems from './RelatedItems';
import ProductReview from './ProductReview';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import ShippingAddressForm from './ShippingAddressForm';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AddressService from '../services/AddressService';
import { apiConfig } from '../config/api';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id, category } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressTableOpen, setIsAddressTableOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  const decodedCategory = decodeURIComponent(category || '');

  const fetchProduct = useCallback(async () => {
    try {
      console.log('🔍 Fetching product with id:', id, 'and category:', decodedCategory);
      const response = await fetch(`${apiConfig.baseURL}/api/products/${encodeURIComponent(category)}/${id}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('✅ Product data:', data);
      setProduct({
        ...data.product,
        categoryName: data.product.categoryId?.name || decodedCategory || 'Không xác định',
      });
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError(`Không thể tải thông tin sản phẩm: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, category, decodedCategory]);

  const fetchRelatedProducts = useCallback(async () => {
    if (!product) return;
    try {
      console.log('🔍 Fetching related products for categoryId:', product.categoryId?._id);
      const response = await fetch(`${apiConfig.baseURL}/api/products/list`);
      if (!response.ok) throw new Error('Không thể tải sản phẩm liên quan');
      const data = await response.json();
      setRelatedProducts(
        data.products
          .filter((p) => p._id !== id && p.categoryId?._id === product.categoryId?._id)
          .map((p) => ({
            ...p,
            categoryName: p.categoryId?.name || decodedCategory || 'Không xác định',
          }))
      );
    } catch (err) {
      console.error('❌ Error fetching related products:', err);
      setRelatedProducts([]);
    }
  }, [id, product, decodedCategory]);

  const fetchAddresses = useCallback(async () => {
    if (!user?.token || isFetchingAddresses) return;
    setIsFetchingAddresses(true);
    try {
      console.log('🔍 Fetching addresses with token:', user.token);
      const addresses = await AddressService.getAddresses(user.token);
      setSavedAddresses(addresses);
      if (addresses.length > 0 && !selectedAddress) {
        const addr = addresses[0];
        setSelectedAddress({
          _id: addr._id,
          fullName: addr.fullName,
          address: `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`,
          phone: addr.phone,
        });
      }
    } catch (err) {
      console.error('❌ Error fetching addresses:', err);
      setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
      setSavedAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsFetchingAddresses(false);
    }
  }, [user?.token, isFetchingAddresses]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchRelatedProducts();
  }, [fetchRelatedProducts]);

  useEffect(() => {
    if (user?.token && !isFetchingAddresses) {
      fetchAddresses();
    }
  }, [user?.token]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setSuccessMessage('Địa chỉ đã được chọn thành công');
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsAddressTableOpen(false);
  };

  const handleAddressAdded = async () => {
    setSuccessMessage('Địa chỉ mới đã được thêm thành công');
    setTimeout(() => setSuccessMessage(null), 3000);
    await fetchAddresses();
  };

  const openModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleDeleteAddress = async (addressId) => {
    if (!user?.token) {
      setError('Vui lòng đăng nhập để xóa địa chỉ.');
      return;
    }
    try {
      await AddressService.deleteAddress(addressId, user.token);
      setSavedAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      if (selectedAddress && selectedAddress._id === addressId) {
        setSelectedAddress(null);
      }
      setSuccessMessage('Địa chỉ đã được xóa thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm.</div>;

  return (
    <div className="product-detail">
      <Header />
      <div className="product-content">
        <ProductItem
          product={product}
          addToCart={addToCart}
          selectedAddress={selectedAddress}
          categoryName={product.categoryName}
        />
        <div className="address-section">
          <h3>Địa chỉ giao hàng</h3>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          {selectedAddress ? (
            <div className="selected-address-section">
              <p>
                <strong>Số điện thoại:</strong> {selectedAddress.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedAddress.address}
              </p>
            </div>
          ) : (
            <p>Chưa có địa chỉ giao hàng</p>
          )}
          <button onClick={() => setIsAddressTableOpen(!isAddressTableOpen)}>
            {selectedAddress ? 'Thay đổi địa chỉ' : 'Chọn địa chỉ giao hàng'}
          </button>
          {isAddressTableOpen && (
            <div className="address-table-container">
              <table className="address-table">
                <thead>
                  <tr>
                    <th>Họ và tên</th>
                    <th>Địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {savedAddresses.map((addr) => (
                    <tr key={addr._id}>
                      <td>{addr.fullName}</td>
                      <td>{`${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`}</td>
                      <td>{addr.phone}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleAddressSelect({
                              _id: addr._id,
                              fullName: addr.fullName,
                              address: `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`,
                              phone: addr.phone,
                            })
                          }
                        >
                          Chọn
                        </button>
                        <button onClick={() => { setEditingAddress(addr); setIsModalOpen(true); }}>Sửa</button>
                        <button onClick={() => handleDeleteAddress(addr._id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={openModal}>Thêm địa chỉ mới</button>
            </div>
          )}
        </div>
        <ProductReview productId={product._id} />
        <RelatedItems
          relatedProducts={relatedProducts}
          currentProductId={id}
          addToCart={addToCart}
          selectedAddress={selectedAddress}
        />
      </div>
      <Footer />
      <CartSidebar />
      {isModalOpen && (
        <ShippingAddressForm
          onAddressSelect={handleAddressSelect}
          onAddressAdded={handleAddressAdded}
          onClose={closeModal}
          initialData={editingAddress}
          isAddingNew={!editingAddress}
        />
      )}
    </div>
  );
};

export default ProductDetail;