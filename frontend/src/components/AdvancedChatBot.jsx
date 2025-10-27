import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ChatBot.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

function AdvancedChatBot() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    
    const { cartItems, total, totalItems } = useCart();

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyA4rBPt3rEcC0Bc0LDgille2BGAUCUbns0');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    useEffect(() => {
        if (!hasGreeted) {
            setChatMessages([
                { 
                    role: 'model', 
                    text: `🤖 Xin chào! Tôi là chatbot hỗ trợ tìm kiếm sản phẩm thông minh.

✨ **Tính năng của tôi:**
• 🔍 Tìm kiếm bằng ngôn ngữ tự nhiên
• 📸 Tìm kiếm theo hình ảnh
• 💡 Gợi ý sản phẩm phù hợp

📝 **Ví dụ câu hỏi:**
• "Gợi ý tôi điện thoại kích thước 6,5 inch, ram 12gb, giá dưới 10 triệu"
• "Tìm laptop gaming giá khoảng 20 triệu"
• "Tai nghe không dây màu đen"

📸 **Tìm kiếm theo hình ảnh:**
• Click vào icon 📷 để upload hình ảnh sản phẩm
• Tôi sẽ tìm sản phẩm tương tự

Hãy thử hỏi tôi nhé! 😊` 
                }
            ]);
            setHasGreeted(true);
        }
    }, [hasGreeted]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageSearch = async () => {
        if (!selectedImage) return;

        setIsChatLoading(true);
        const userMessage = { role: 'user', text: `📸 Tìm kiếm theo hình ảnh: ${selectedImage.name}` };
        setChatMessages(prev => [...prev, userMessage]);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot/search-by-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000
                }
            );

            const { analysis, products, message } = response.data;
            
            let botResponse = `🔍 **Phân tích hình ảnh:**\n`;
            botResponse += `• Loại sản phẩm: ${analysis.productType || 'Không xác định'}\n`;
            botResponse += `• Thương hiệu: ${analysis.brand || 'Không xác định'}\n`;
            botResponse += `• Màu sắc: ${analysis.color || 'Không xác định'}\n`;
            botResponse += `• Mô tả: ${analysis.description || 'Không có mô tả'}\n\n`;
            botResponse += `📦 **Sản phẩm tương tự:**\n`;

            if (products && products.length > 0) {
                products.slice(0, 5).forEach((product, index) => {
                    botResponse += `${index + 1}. **${product.name}**\n`;
                    botResponse += `   💰 Giá: ${product.prices?.['250']?.toLocaleString() || 'Liên hệ'} VND\n`;
                    botResponse += `   📊 Độ tương đồng: ${(product.similarity * 100).toFixed(1)}%\n\n`;
                });
            } else {
                botResponse += `Không tìm thấy sản phẩm tương tự.`;
            }

            setChatMessages(prev => [...prev, { role: 'model', text: botResponse }]);
            
            // Reset image
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Lỗi tìm kiếm hình ảnh:', error);
            let errorMessage = '❌ Lỗi khi tìm kiếm theo hình ảnh. ';
            if (error.response?.status === 413) {
                errorMessage += 'File quá lớn (tối đa 5MB).';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += 'Timeout. Vui lòng thử lại.';
            } else {
                errorMessage += 'Vui lòng thử lại sau.';
            }
            setChatMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
        }

        setIsChatLoading(false);
    };

    const handleNaturalLanguageQuery = async (query) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot/natural-query`,
                { query },
                { timeout: 15000 }
            );

            const { response: botResponse, products, analysis } = response.data;
            
            let fullResponse = botResponse;
            
            if (products && products.length > 0) {
                fullResponse += `\n\n📦 **Sản phẩm gợi ý:**\n`;
                products.slice(0, 5).forEach((product, index) => {
                    fullResponse += `${index + 1}. **${product.name}**\n`;
                    fullResponse += `   💰 Giá: ${product.prices?.['250']?.toLocaleString() || 'Liên hệ'} VND\n`;
                    fullResponse += `   📊 Độ phù hợp: ${(product.similarity * 100).toFixed(1)}%\n\n`;
                });
            }

            return fullResponse;
        } catch (error) {
            console.error('Lỗi xử lý câu hỏi tự nhiên:', error);
            return '❌ Xin lỗi, tôi không thể xử lý câu hỏi này. Vui lòng thử lại sau.';
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() && !selectedImage) return;

        let userMessage;
        let reply = '';

        if (selectedImage) {
            // Xử lý tìm kiếm theo hình ảnh
            await handleImageSearch();
            return;
        } else {
            // Xử lý câu hỏi tự nhiên
            userMessage = { role: 'user', text: userInput };
            setChatMessages(prev => [...prev, userMessage]);
            setIsChatLoading(true);

            reply = await handleNaturalLanguageQuery(userInput);
        }

        setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
        setIsChatLoading(false);
        setUserInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className="chat-icon" onClick={toggleChat}>
                🤖
            </div>
            <div className={`chat-container ${isChatOpen ? '' : 'hidden'}`} id="chatContainer">
                <div className="chat-header">
                    <h2>🤖 Chatbot Thông Minh</h2>
                    <button className="close-chat-btn" onClick={toggleChat}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="chat-box" id="chatBox">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            <div className="message-content">
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="chat-message model">
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button 
                            className="remove-image-btn"
                            onClick={() => {
                                setImagePreview(null);
                                setSelectedImage(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="input-group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    
                    <button 
                        className="image-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Tìm kiếm theo hình ảnh"
                    >
                        📷
                    </button>
                    
                    <input
                        type="text"
                        id="userInput"
                        placeholder="Hỏi tôi về sản phẩm... (VD: điện thoại 6 inch ram 8gb giá dưới 5 triệu)"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isChatLoading}
                    />
                    
                    <button 
                        onClick={handleSendMessage}
                        disabled={isChatLoading || (!userInput.trim() && !selectedImage)}
                    >
                        {selectedImage ? '🔍' : '📤'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default AdvancedChatBot;
