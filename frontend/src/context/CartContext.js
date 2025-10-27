import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity } from "../services/CartService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchCartFromServer = useCallback(async () => {
    if (!user?.token) return;
    try {
      const cart = await fetchCart(user.token);
      console.log('Cart data from server:', cart);
      
      // Backend trả về { userId, items: [...] }
      const items = cart.items || cart || [];
      const itemsWithSelection = items.map(item => ({
        ...item,
        selected: item.selected || false,
      }));
      
      console.log('Processed cart items:', itemsWithSelection);
      setCartItems(itemsWithSelection);
      localStorage.setItem("cartItemsBackup", JSON.stringify(itemsWithSelection));
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ server:", error.response?.data || error.message);
      // Fallback to localStorage - gọi trực tiếp
      try {
        const savedCart = localStorage.getItem("cartItems") || localStorage.getItem("cartItemsBackup");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        setCartItems(parsedCart);
      } catch (localError) {
        console.error("Lỗi khi lấy giỏ hàng từ localStorage:", localError);
        setCartItems([]);
      }
    }
  }, [user]);

  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem("cartItems") || localStorage.getItem("cartItemsBackup");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(parsedCart);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng từ localStorage:", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    if (user?.token) {
      fetchCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  }, [user, fetchCartFromServer, loadCartFromLocalStorage]);

  useEffect(() => {
    if (!user?.token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const toggleCart = () => setIsOpen(prev => !prev);

  const handleAddToCart = async (product) => {
    const { productId, quantity = 1, price, image, name, categoryName, attributes = {} } = product;

    if (user?.token) {
      try {
        await addToCart(product, user.token);
        await fetchCartFromServer();
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message);
        // Fallback to local storage if server fails
        setCartItems(prev => {
          const existingItem = prev.find(item =>
            item.productId === productId &&
            JSON.stringify(item.attributes) === JSON.stringify(attributes)
          );

          let updatedCart;
          if (existingItem) {
            updatedCart = prev.map(item =>
              item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            updatedCart = [...prev, { productId, quantity, name, price, image, categoryName, attributes, selected: false }];
          }

          localStorage.setItem("cartItems", JSON.stringify(updatedCart));
          return updatedCart;
        });
      }
    } else {
      setCartItems(prev => {
        const existingItem = prev.find(item =>
          item.productId === productId &&
          JSON.stringify(item.attributes) === JSON.stringify(attributes)
        );

        let updatedCart;
        if (existingItem) {
          updatedCart = prev.map(item =>
            item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [...prev, { productId, quantity, name, price, image, categoryName, attributes, selected: false }];
        }

        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  // src/context/CartContext.js (trích đoạn liên quan)
  const handleIncreaseQuantity = async (productId, attributes) => {
    console.log('🔄 handleIncreaseQuantity called with:', { productId, attributes, hasToken: !!user?.token });
    
    if (user?.token) {
      try {
        console.log('🔄 Calling increaseQuantity API...');
        await increaseQuantity(productId, attributes, user.token);
        console.log('✅ increaseQuantity API success, fetching cart...');
        await fetchCartFromServer();
        console.log('✅ Cart updated successfully');
      } catch (error) {
        console.error("❌ Lỗi khi tăng số lượng:", error);
        console.error("❌ Error details:", error.response?.data || error.message);
        alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tăng số lượng'}`);
      }
    } else {
      console.log('🔄 No token, updating local state...');
      setCartItems(prev => {
        const updatedCart = prev.map(item =>
          item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        console.log('✅ Local cart updated');
        return updatedCart;
      });
    }
  };

const handleDecreaseQuantity = async (productId, attributes) => {
  console.log('🔄 handleDecreaseQuantity called with:', { productId, attributes, hasToken: !!user?.token });
  
  if (user?.token) {
    try {
      console.log('🔄 Calling decreaseQuantity API...');
      await decreaseQuantity(productId, attributes, user.token);
      console.log('✅ decreaseQuantity API success, fetching cart...');
      await fetchCartFromServer();
      console.log('✅ Cart updated successfully');
    } catch (error) {
      console.error("❌ Lỗi khi giảm số lượng:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể giảm số lượng'}`);
    }
  } else {
    console.log('🔄 No token, updating local state...');
    setCartItems(prev => {
      const updatedCart = prev
        .map(item =>
          item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes) && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      console.log('✅ Local cart updated');
      return updatedCart;
    });
  }
};

const handleRemoveFromCart = async (productId, attributes) => {
  console.log('🔄 handleRemoveFromCart called with:', { productId, attributes, hasToken: !!user?.token });
  
  if (user?.token) {
    try {
      console.log('🔄 Calling removeFromCart API...');
      await removeFromCart(productId, attributes, user.token);
      console.log('✅ removeFromCart API success, fetching cart...');
      await fetchCartFromServer();
      console.log('✅ Cart updated successfully');
    } catch (error) {
      console.error("❌ Lỗi khi xóa khỏi giỏ hàng:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể xóa sản phẩm'}`);
    }
  } else {
    console.log('🔄 No token, updating local state...');
    setCartItems(prev => {
      const updatedCart = prev.filter(item => !(item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)));
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      console.log('✅ Local cart updated');
      return updatedCart;
    });
  }
};

  const handleSelectAll = (isSelected) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item => ({ ...item, selected: isSelected }));
      if (!user?.token) localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleToggleItemSelection = (productId, attributes) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item =>
        item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes)
          ? { ...item, selected: !item.selected }
          : item
      );
      if (!user?.token) localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = async () => {
    if (user?.token) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/carts`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        await fetchCartFromServer();
      } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error.response?.data || error.message);
      }
    } else {
      setCartItems([]);
      localStorage.setItem("cartItems", JSON.stringify([]));
    }
  };

  const total = cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const displayAttributes = (attributes) => {
    return Object.entries(attributes || {}).map(([key, value]) => `${key}: ${value}`).join(", ");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        isOpen,
        toggleCart,
        total,
        totalItems,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        increaseQuantity: handleIncreaseQuantity,
        decreaseQuantity: handleDecreaseQuantity,
        selectAll: handleSelectAll,
        toggleItemSelection: handleToggleItemSelection,
        fetchCartFromServer: fetchCartFromServer,
        loadCartFromLocalStorage,
        clearCart,
        displayAttributes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
