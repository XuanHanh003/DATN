import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/productService";
import { getCategories } from "../services/categoryService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    image: "",
    categoryId: "",
    prices: {},
    stock: 0
  });

  const [priceList, setPriceList] = useState([{ key: "", value: 0 }]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.products || data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prices = {};
    priceList.forEach(item => {
      if (item.key) prices[item.key] = Number(item.value);
    });

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        categoryId: formData.categoryId,
        prices: prices,
        stock: formData.stock
      };

      if (formData.id) {
        await updateProduct(formData.id, productData);
      } else {
        await addProduct(productData);
      }
      fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm: " + error.message);
      }
    }
  };

  const handleEdit = (product) => {
    const priceArr = Object.entries(product.prices || {}).map(([key, value]) => ({ key, value }));

    setFormData({
      id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      categoryId: product.categoryId?._id || "",
      prices: product.prices,
      stock: product.stock
    });
    setPriceList(priceArr.length ? priceArr : [{ key: "", value: 0 }]);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      image: "",
      categoryId: "",
      prices: {},
      stock: 0
    });
    setPriceList([{ key: "", value: 0 }]);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...priceList];
    updatedPrices[index][field] = value;
    setPriceList(updatedPrices);
  };

  const addPriceField = () => {
    setPriceList([...priceList, { key: "", value: 0 }]);
  };

  const removePriceField = (index) => {
    const updatedPrices = priceList.filter((_, i) => i !== index);
    setPriceList(updatedPrices.length ? updatedPrices : [{ key: "", value: 0 }]);
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <h1>Quản Lý Sản Phẩm</h1>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="product-form button">
            Thêm sản phẩm
          </button>
        )}

        {showForm && (
          <div className="edit-form">
            <form onSubmit={handleSubmit} className="product-form">
              <div>
                <label htmlFor="name">Tên sản phẩm:</label>
                <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div>
                <label htmlFor="description">Mô tả:</label>
                <input type="text" id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div>
                <label htmlFor="image">URL hình ảnh:</label>
                <input type="text" id="image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} required />
              </div>

              <div>
                <label htmlFor="categoryId">Danh mục:</label>
                <select id="categoryId" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Giá:</label>
                {priceList.map((price, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <input type="text" placeholder="Key (VD: 250g, M, L)" value={price.key} onChange={(e) => handlePriceChange(index, 'key', e.target.value)} required style={{ marginRight: "5px" }} />
                    <input type="number" placeholder="Giá" value={price.value} onChange={(e) => handlePriceChange(index, 'value', e.target.value)} required style={{ marginRight: "5px" }} />
                    <button type="button" onClick={() => removePriceField(index)}>X</button>
                  </div>
                ))}
                <button type="button" onClick={addPriceField}>+ Thêm giá</button>
              </div>

              <div>
                <label>Số lượng tồn kho:</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} required />
              </div>

              <button type="submit">{formData.id ? "Cập nhật" : "Thêm"}</button>
              <button type="button" onClick={handleCancel}>Hủy</button>
            </form>
          </div>
        )}

        <div className="product-list">
          <h2>Danh Sách Sản Phẩm</h2>
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td><img src={product.image} alt={product.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} /></td>
                  <td>{product.name}</td>
                  <td>{product.categoryId?.name || ""}</td>
                  <td>
                    {product.prices && Object.entries(product.prices).map(([k, v]) => `${k}: ${v}`).join(" / ")}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Sửa</button>
                    <button onClick={() => handleDelete(product._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Products;