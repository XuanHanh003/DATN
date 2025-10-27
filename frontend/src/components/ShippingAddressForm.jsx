import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddressService from '../services/AddressService';
import { useAuth } from '../context/AuthContext';
import '../styles/ShippingAddressForm.css';

function ShippingAddressForm({ onAddressSelect, onAddressAdded, onClose, initialData, isAddingNew }) {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    province: '',
    district: '',
    ward: '',
    detail: '',
    fullName: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({ provinces: false, districts: false, wards: false, form: false });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.token) return;
      try {
        setLoading((prev) => ({ ...prev, form: true }));
        const addresses = await AddressService.getAddresses(user.token);
        console.log('Fetched addresses:', addresses);
        setSavedAddresses(addresses);
        if (addresses.length > 0 && !initialData && !isAddingNew) {
          const defaultAddress = addresses[0];
          setSelectedAddressId(defaultAddress._id);
          onAddressSelect({
            _id: defaultAddress._id,
            fullName: defaultAddress.fullName,
            address: `${defaultAddress.detail}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`,
            phone: defaultAddress.phone,
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách địa chỉ:', error);
      } finally {
        setLoading((prev) => ({ ...prev, form: false }));
      }
    };
    fetchAddresses();
  }, [user?.token, onAddressSelect, initialData, isAddingNew]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        province: initialData.province || '',
        district: initialData.district || '',
        ward: initialData.ward || '',
        detail: initialData.detail || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
      });
      setSelectedAddressId(initialData._id);
    } else {
      setFormData({
        province: '',
        district: '',
        ward: '',
        detail: '',
        fullName: '',
        phone: '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading((prev) => ({ ...prev, provinces: true }));
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh:', error);
        setErrors((prev) => ({ ...prev, form: 'Lỗi khi tải danh sách tỉnh/thành phố.' }));
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.province) {
      const fetchDistricts = async () => {
        try {
          setLoading((prev) => ({ ...prev, districts: true }));
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${formData.province}?depth=2`);
          setDistricts(response.data.districts || []);
          setFormData((prev) => ({ ...prev, district: '', ward: '' }));
          setWards([]);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách quận/huyện:', error);
          setErrors((prev) => ({ ...prev, form: 'Lỗi khi tải danh sách quận/huyện.' }));
        } finally {
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.district) {
      const fetchWards = async () => {
        try {
          setLoading((prev) => ({ ...prev, wards: true }));
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
          setWards(response.data.wards || []);
          setFormData((prev) => ({ ...prev, ward: '' }));
        } catch (error) {
          console.error('Lỗi khi lấy danh sách phường/xã:', error);
          setErrors((prev) => ({ ...prev, form: 'Lỗi khi tải danh sách phường/xã.' }));
        } finally {
          setLoading((prev) => ({ ...prev, wards: false }));
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [formData.district]);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống.';
    else if (/\d/.test(data.fullName)) newErrors.fullName = 'Họ và tên không được chứa số.';
    const phoneRegex = /^0\d{9}$/;
    if (!data.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống.';
    else if (!phoneRegex.test(data.phone)) newErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.';
    if (!data.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố.';
    if (!data.district) newErrors.district = 'Vui lòng chọn quận/huyện.';
    if (!data.ward) newErrors.ward = 'Vui lòng chọn phường/xã.';
    if (!data.detail.trim()) newErrors.detail = 'Địa chỉ chi tiết không được để trống.';
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    const newErrors = validateForm(updatedFormData);
    setErrors((prev) => ({ ...prev, ...newErrors, form: '' }));
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    onAddressSelect({
      _id: address._id,
      fullName: address.fullName,
      address: `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`,
      phone: address.phone,
    });
    onClose();
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      await AddressService.deleteAddress(addressId, user.token);
      const updatedAddresses = await AddressService.getAddresses(user.token);
      setSavedAddresses(updatedAddresses);
      setShowDeleteConfirm(null);
      
      // Nếu địa chỉ bị xóa là địa chỉ đang chọn, chọn địa chỉ đầu tiên
      if (selectedAddressId === addressId && updatedAddresses.length > 0) {
        handleSelectAddress(updatedAddresses[0]);
      } else if (updatedAddresses.length === 0) {
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      setErrors({ form: error.message || 'Lỗi khi xóa địa chỉ.' });
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const provinceName = provinces.find((p) => p.code === parseInt(formData.province))?.name || formData.province;
    const districtName = districts.find((d) => d.code === parseInt(formData.district))?.name || formData.district;
    const wardName = wards.find((w) => w.code === parseInt(formData.ward))?.name || formData.ward;

    if (!provinceName || !districtName || !wardName) {
      setErrors({ form: 'Không thể tải tên tỉnh/quận/phường. Vui lòng thử lại.' });
      return;
    }

    const addressData = {
      fullName: formData.fullName,
      phone: formData.phone,
      province: provinceName,
      district: districtName,
      ward: wardName,
      detail: formData.detail,
    };

    console.log('Address data being sent:', addressData);
    console.log('Phone number:', formData.phone, 'Type:', typeof formData.phone);

    try {
      setLoading((prev) => ({ ...prev, form: true }));
      let newAddress;
      const addressToUpdate = editingAddress || initialData;
      if (addressToUpdate && addressToUpdate._id) {
        newAddress = await AddressService.updateAddress(addressToUpdate._id, addressData, user.token);
        onAddressSelect(newAddress);
      } else {
        newAddress = await AddressService.addAddress(addressData, user.token);
        if (onAddressAdded) onAddressAdded(newAddress);
      }
      const updatedAddresses = await AddressService.getAddresses(user.token);
      setSavedAddresses(updatedAddresses);
      setFormData({ province: '', district: '', ward: '', detail: '', fullName: '', phone: '' });
      setDistricts([]);
      setWards([]);
      setErrors({});
      setEditingAddress(null);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors({ form: error.message || 'Lỗi khi lưu địa chỉ.' });
      if (error.message.includes('Token') || error.response?.status === 401) {
        logout();
        setErrors({ form: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      }
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  if (!user?.token) {
    return (
      <div className="shipping-address-modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Địa chỉ giao hàng</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p className="form-error">Vui lòng đăng nhập để quản lý địa chỉ.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-address-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quản lý địa chỉ giao hàng</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className={`loading-overlay ${(loading.provinces || loading.districts || loading.wards || loading.form) ? 'loading' : ''}`}>
            <p>Đang tải...</p>
          </div>
          
          {savedAddresses.length > 0 && !isAddingNew && (
            <div className="saved-addresses-section">
              <h4>Địa chỉ đã lưu</h4>
              <div className="saved-addresses">
                {savedAddresses.map((address) => (
                  <div
                    key={address._id}
                    className={`address-item ${selectedAddressId === address._id ? 'selected' : ''}`}
                  >
                    <div className="address-content" onClick={() => handleSelectAddress(address)}>
                      <p>
                        <strong>{address.fullName}</strong> ({address.phone})
                      </p>
                      <p>{`${address.detail}, ${address.ward}, ${address.district}, ${address.province}`}</p>
                    </div>
                    <div className="address-actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingAddress(address);
                          setFormData({
                            province: address.province,
                            district: address.district,
                            ward: address.ward,
                            detail: address.detail,
                            fullName: address.fullName,
                            phone: address.phone,
                          });
                        }}
                        disabled={loading.form}
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => setShowDeleteConfirm(address._id)}
                        disabled={loading.form}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-section">
            <h4>{editingAddress || initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h4>
            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={errors.fullName ? 'input-error' : ''}
                    disabled={loading.form}
                  />
                  {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                </div>
                <div className="form-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'input-error' : ''}
                    disabled={loading.form}
                  />
                  {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh/Thành phố:</label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className={errors.province ? 'input-error' : ''}
                    disabled={loading.provinces || loading.form}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && <p className="error-message">{errors.province}</p>}
                </div>
                <div className="form-group">
                  <label>Quận/Huyện:</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className={errors.district ? 'input-error' : ''}
                    disabled={!formData.province || loading.districts || loading.form}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && <p className="error-message">{errors.district}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phường/Xã:</label>
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className={errors.ward ? 'input-error' : ''}
                    disabled={!formData.district || loading.wards || loading.form}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward && <p className="error-message">{errors.ward}</p>}
                </div>
                <div className="form-group">
                  <label>Địa chỉ chi tiết:</label>
                  <input
                    type="text"
                    value={formData.detail}
                    onChange={(e) => handleInputChange('detail', e.target.value)}
                    className={errors.detail ? 'input-error' : ''}
                    disabled={loading.form}
                    placeholder="Số nhà, tên đường..."
                  />
                  {errors.detail && <p className="error-message">{errors.detail}</p>}
                </div>
              </div>

              {errors.form && <p className="form-error">{errors.form}</p>}
              
              <div className="form-buttons">
                <button type="submit" className="submit-btn" disabled={loading.form}>
                  {loading.form ? 'Đang lưu...' : (editingAddress || initialData) ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  disabled={loading.form}
                  onClick={onClose}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>

          {/* Confirm Delete Modal */}
          {showDeleteConfirm && (
            <div className="confirm-modal">
              <div className="confirm-content">
                <h4>Xác nhận xóa</h4>
                <p>Bạn có chắc chắn muốn xóa địa chỉ này?</p>
                <div className="confirm-buttons">
                  <button
                    className="confirm-delete-btn"
                    onClick={() => handleDeleteAddress(showDeleteConfirm)}
                    disabled={loading.form}
                  >
                    Xóa
                  </button>
                  <button
                    className="cancel-delete-btn"
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={loading.form}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShippingAddressForm;