import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ChatBot.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

function ChatBot() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [productOptions, setProductOptions] = useState([]); // Lưu danh sách sản phẩm tìm thấy
    const [awaitingSelection, setAwaitingSelection] = useState(false); // Trạng thái chờ người dùng chọn

    const { cartItems, total, totalItems } = useCart();

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyA4rBPt3rEcC0Bc0LDgille2BGAUCUbns0');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    useEffect(() => {
        const productInfo = cartItems.length > 0
            ? cartItems.map(item => `${item.name}: ${item.price.toLocaleString()} VND, Số lượng: ${item.quantity}`).join('\n')
            : 'Giỏ hàng của bạn đang trống.';

        if (!hasGreeted) {
            setChatMessages([
                { role: 'model', text: `Xin chào! Tôi là chatbot hỗ trợ giỏ hàng. Đây là danh sách sản phẩm trong giỏ hàng của bạn:\n${productInfo}\nTổng số lượng: ${totalItems}\nHãy hỏi tôi như: "Mít sấy còn hàng không?". Tôi sẽ hiển thị các sản phẩm liên quan để bạn chọn!` }
            ]);
            setHasGreeted(true);
        } else {
            setChatMessages(prev => {
                const updatedMessages = [...prev];
                if (updatedMessages.length > 0) {
                    updatedMessages[0] = {
                        role: 'model',
                        text: `Đây là danh sách sản phẩm trong giỏ hàng của bạn:\n${productInfo}\nTổng số lượng: ${totalItems}\nHãy hỏi tôi như: "Mít sấy còn hàng không?". Tôi sẽ hiển thị các sản phẩm liên quan để bạn chọn!`
                    };
                }
                return updatedMessages;
            });
        }

        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [cartItems, total, totalItems, hasGreeted]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const extractProductName = (text) => {
        const productKeywords = ['còn hàng', 'giá', 'loại', 'sản phẩm', 'thành phần', 'chất liệu', 'bảo hành', 'màu', 'size', 'phù hợp'];
        const words = text.toLowerCase().split(' ');
        let productName = '';

        for (let i = 0; i < words.length; i++) {
            if (productKeywords.includes(words[i])) {
                productName = words.slice(0, i).join(' ').trim();
                break;
            }
        }

        return productName || words[0]; // Nếu không tìm thấy keyword, lấy từ đầu tiên làm tên sản phẩm
    };

    const classifyIntent = (text) => {
        const dbKeywords = ["còn hàng", "thành phần", "chất liệu", "bảo hành", "màu", "size", "giá", "loại sản phẩm", "phù hợp"];
        const orderKeywords = ["đơn hàng", "tình trạng", "hủy đơn", "đặt nhầm"];

        const lowerText = text.toLowerCase();
        if (dbKeywords.some(keyword => lowerText.includes(keyword))) return 'product';
        if (orderKeywords.some(keyword => lowerText.includes(keyword))) return 'order';
        return 'faq';
    };

    const fetchFromBackend = async (type, query) => {
        try {
            if (type === 'product') {
                const productName = extractProductName(query);
                if (!productName || productName.trim() === '') {
                    return 'Vui lòng cung cấp tên sản phẩm cụ thể (ví dụ: "Mít sấy").';
                }
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search-expanded?keyword=${encodeURIComponent(productName)}`, {
                    timeout: 5000
                });
                if (typeof res.data !== 'object' || res.data === null) {
                    return 'Lỗi: Phản hồi từ server không phải JSON hợp lệ. Vui lòng kiểm tra server backend.';
                }
                const data = res.data;
                if (!data || data.length === 0) {
                    return `Không tìm thấy sản phẩm liên quan đến "${productName}". Vui lòng kiểm tra lại hoặc đảm bảo database có dữ liệu.`;
                }
                setProductOptions(data);
                setAwaitingSelection(true);
                return `Tôi tìm thấy các sản phẩm liên quan đến "${productName}":\n${data.map((p, index) => `${index + 1}. ${p.name}`).join('\n')}\nVui lòng nhập số thứ tự (1-${data.length}) để xem chi tiết.`;
            }
            if (type === 'order') {
                return 'Bạn có thể kiểm tra tình trạng đơn hàng tại trang "Đơn hàng của tôi".';
            }
            return null;
        } catch (err) {
            console.error('Lỗi trong fetchFromBackend:', err);
            if (err.code === 'ECONNABORTED') {
                return 'Lỗi: Kết nối với server quá thời gian. Vui lòng kiểm tra server backend hoặc thử lại sau.';
            }
            if (err.response) {
                if (err.response.status === 404) {
                    return `Lỗi 404: Endpoint /api/products/search-expanded không tồn tại. Vui lòng kiểm tra cấu hình server backend.`;
                }
                if (err.response.status === 500) {
                    return 'Lỗi: Server gặp sự cố (500), có thể do MongoDB. Vui lòng kiểm tra log server.';
                }
                return `Lỗi khi lấy dữ liệu: ${err.response.status} ${err.response.statusText}`;
            }
            if (err.message.includes('Unexpected token')) {
                return 'Lỗi: Phản hồi từ server không phải JSON hợp lệ. Vui lòng kiểm tra server.';
            }
            return 'Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại sau.';
        }
    };

    const getPredefinedAnswer = (text) => {
        const faq = [
            { q: 'liên hệ', a:'Thông tin liên hệ của shop 0379459717'},
            { q: 'phí ship', a: 'Miễn phí ship cho tất cả đơn hàng' },
            { q: 'giao hàng toàn quốc', a: 'Chúng tôi có giao hàng toàn quốc.' },
            { q: 'thanh toán', a: 'Bạn có thể thanh toán bằng VNPAY, thẻ ngân hàng' },
            { q: 'đổi trả', a: 'Chúng tôi không có chính sách đổi trả. Nếu sản phẩm có vấn đề, liên hệ qua Zalo 0379459717.' }
        ];

        const lower = text.toLowerCase();
        const found = faq.find(f => lower.includes(f.q));
        return found ? found.a : null;
    };

    const callGemini = async (text) => {
        try {
            const productInfo = cartItems.length > 0
                ? cartItems.map(item => `${item.name}: ${item.price.toLocaleString()} VND, Số lượng: ${item.quantity}, Danh mục: ${item.category || 'Không xác định'}`).join('\n')
                : 'Giỏ hàng của bạn đang trống.';

            const prompt = `Bạn là chatbot hỗ trợ khách hàng. Câu hỏi: "${text}".\nThông tin giỏ hàng:\n${productInfo}\nTổng tiền: ${total.toLocaleString()} VND\nTổng số lượng: ${totalItems}\nNếu liên quan đến sản phẩm (ví dụ: Mít sấy), gợi ý các biến thể nếu phù hợp.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.error('Lỗi khi gọi Gemini API:', err);
            return 'Xin lỗi, tôi không thể trả lời ngay. Vui lòng thử lại sau!';
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const userMessage = { role: 'user', text: userInput };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        let reply = '';

        if (awaitingSelection) {
            const selection = parseInt(userInput.trim(), 10);
            if (isNaN(selection) || selection < 1 || selection > productOptions.length) {
                reply = `Vui lòng nhập số hợp lệ từ 1 đến ${productOptions.length}.`;
            } else {
                const selectedProduct = productOptions[selection - 1];
                const stockStatus = selectedProduct.stock > 0 ? `Còn ${selectedProduct.stock} sản phẩm trong kho.` : 'Hết hàng.';
                reply = `${selectedProduct.name} - Giá: ${selectedProduct.prices['250'].toLocaleString()} VND (250g), Tình trạng: ${stockStatus}`;
                setAwaitingSelection(false);
                setProductOptions([]);
            }
        } else {
            const intent = classifyIntent(userInput);
            if (intent === 'faq') {
                reply = getPredefinedAnswer(userInput) || await callGemini(userInput);
            } else {
                reply = await fetchFromBackend(intent, userInput);
                if (!reply) reply = await callGemini(userInput);
            }
        }

        setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
        setIsChatLoading(false);
        setUserInput('');
    };

    return (
        <>
            <div className="chat-icon" onClick={toggleChat}>💬</div>
            <div className={`chat-container ${isChatOpen ? '' : 'hidden'}`} id="chatContainer">
                <div className="chat-header">
                    <h2>Hỗ trợ khách hàng</h2>
                    <button className="close-chat-btn" onClick={toggleChat}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="chat-box" id="chatBox">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    {isChatLoading && <div className="chat-message model">Đang xử lý...</div>}
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        id="userInput"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Gửi</button>
                </div>
            </div>
        </>
    );
}

export default ChatBot;