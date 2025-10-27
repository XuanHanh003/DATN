// controllers/ChatBotController.js
const db = require('../models');
const Product = db.Product;
const Category = db.Category;
const { findSimilarProducts } = require('../utils/word2vecSearch');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');

class ChatBotController {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA4rBPt3rEcC0Bc0LDgille2BGAUCUbns0');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Xử lý câu hỏi tự nhiên về sản phẩm
  static async processNaturalLanguageQuery(req, res) {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: 'Thiếu câu hỏi' });
      }

      // Phân tích intent và extract thông tin
      const analysis = await ChatBotController.analyzeQuery(query);
      
      // Tìm kiếm sản phẩm dựa trên phân tích
      const products = await ChatBotController.searchProductsByCriteria(analysis);
      
      // Tạo phản hồi tự nhiên
      const response = await ChatBotController.generateNaturalResponse(query, products, analysis);
      
      res.json({
        success: true,
        response,
        products: products.slice(0, 10), // Giới hạn 10 sản phẩm
        analysis
      });
    } catch (error) {
      console.error('❌ Lỗi xử lý câu hỏi tự nhiên:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Phân tích câu hỏi để extract thông tin sản phẩm
  static async analyzeQuery(query) {
    const analysis = {
      productType: null,
      specifications: {},
      priceRange: null,
      brand: null,
      intent: 'search'
    };

    const lowerQuery = query.toLowerCase();

    // Xác định loại sản phẩm
    const productTypes = {
      'điện thoại': ['điện thoại', 'smartphone', 'phone', 'mobile'],
      'laptop': ['laptop', 'máy tính', 'computer'],
      'tablet': ['tablet', 'máy tính bảng'],
      'tai nghe': ['tai nghe', 'headphone', 'earphone'],
      'loa': ['loa', 'speaker'],
      'đồng hồ': ['đồng hồ', 'watch', 'smartwatch']
    };

    for (const [type, keywords] of Object.entries(productTypes)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        analysis.productType = type;
        break;
      }
    }

    // Extract thông số kỹ thuật
    const specs = {
      'ram': ['ram', 'memory'],
      'dung lượng': ['dung lượng', 'storage', 'gb', 'tb'],
      'màn hình': ['màn hình', 'screen', 'inch', 'kích thước'],
      'camera': ['camera', 'máy ảnh', 'mp'],
      'pin': ['pin', 'battery', 'mah']
    };

    for (const [spec, keywords] of Object.entries(specs)) {
      const regex = new RegExp(`(${keywords.join('|')})\\s*(\\d+)`, 'i');
      const match = query.match(regex);
      if (match) {
        analysis.specifications[spec] = match[2];
      }
    }

    // Extract khoảng giá
    const priceRegex = /(dưới|trên|khoảng|từ|đến)\s*(\d+)\s*(triệu|nghìn|k|m)/i;
    const priceMatch = query.match(priceRegex);
    if (priceMatch) {
      let amount = parseInt(priceMatch[2]);
      const unit = priceMatch[3].toLowerCase();
      
      if (unit === 'triệu') amount *= 1000000;
      else if (unit === 'nghìn' || unit === 'k') amount *= 1000;
      else if (unit === 'm') amount *= 1000000;
      
      analysis.priceRange = {
        operator: priceMatch[1],
        amount: amount
      };
    }

    return analysis;
  }

  // Tìm kiếm sản phẩm dựa trên tiêu chí
  static async searchProductsByCriteria(analysis) {
    try {
      // Import mock data thay vì database
      const mockProducts = require('../data/mockProducts');
      let products = [...mockProducts];
      
      // Lọc theo loại sản phẩm
      if (analysis.productType) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(analysis.productType) ||
          p.category?.toLowerCase().includes(analysis.productType)
        );
      }

      // Lọc theo giá
      if (analysis.priceRange) {
        const { operator, amount } = analysis.priceRange;
        products = products.filter(p => {
          const price = p.prices?.['250'] || p.price || 0;
          switch (operator) {
            case 'dưới': return price < amount;
            case 'trên': return price > amount;
            case 'khoảng': return Math.abs(price - amount) < amount * 0.2;
            default: return true;
          }
        });
      }

      // Nếu có sản phẩm sau khi lọc, trả về luôn
      if (products.length > 0) {
        return products.map(p => ({ ...p, similarity: 0.8 })); // Mock similarity score
      }

      // Fallback: tìm kiếm bằng từ khóa trong tên sản phẩm
      const searchQuery = analysis.productType || 'sản phẩm';
      const keywordSearch = mockProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (keywordSearch.length > 0) {
        return keywordSearch.map(p => ({ ...p, similarity: 0.7 }));
      }

      // Nếu vẫn không tìm thấy, trả về tất cả sản phẩm
      return mockProducts.slice(0, 10).map(p => ({ ...p, similarity: 0.5 }));

    } catch (error) {
      console.error('❌ Lỗi tìm kiếm sản phẩm:', error);
      return [];
    }
  }

  // Tạo phản hồi tự nhiên
  static async generateNaturalResponse(query, products, analysis) {
    try {
      const productList = products.slice(0, 5).map(p => 
        `${p.name} - ${p.prices?.['250']?.toLocaleString() || 'Liên hệ'} VND`
      ).join('\n');

      const prompt = `
        Bạn là chatbot hỗ trợ khách hàng tìm sản phẩm.
        Câu hỏi: "${query}"
        
        Phân tích: ${JSON.stringify(analysis)}
        
        Sản phẩm tìm thấy:
        ${productList}
        
        Hãy tạo phản hồi tự nhiên, thân thiện, gợi ý các sản phẩm phù hợp.
        Nếu không tìm thấy sản phẩm phù hợp, hãy gợi ý các sản phẩm tương tự.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Lỗi tạo phản hồi:', error);
      return 'Xin lỗi, tôi không thể trả lời ngay. Vui lòng thử lại sau!';
    }
  }

  // Xử lý tìm kiếm theo hình ảnh
  static async searchByImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Không có hình ảnh' });
      }

      // Sử dụng Gemini Vision để phân tích hình ảnh
      const imagePath = req.file.path;
      const imageBuffer = require('fs').readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const prompt = `
        Phân tích hình ảnh này và mô tả sản phẩm:
        - Loại sản phẩm (điện thoại, laptop, tai nghe, etc.)
        - Thương hiệu có thể nhận diện được
        - Màu sắc
        - Đặc điểm nổi bật
        - Kích thước ước tính
        
        Trả về JSON với format:
        {
          "productType": "điện thoại",
          "brand": "iPhone",
          "color": "đen",
          "features": ["màn hình lớn", "camera kép"],
          "description": "Mô tả chi tiết"
        }
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype
          }
        }
      ]);

      const response = await result.response;
      const analysis = JSON.parse(response.text());

      // Tìm sản phẩm tương tự dựa trên phân tích
      const mockProducts = require('../data/mockProducts');
      const similarProducts = mockProducts.filter(p => 
        p.name.toLowerCase().includes(analysis.productType.toLowerCase()) ||
        p.category?.toLowerCase().includes(analysis.productType.toLowerCase()) ||
        p.description?.toLowerCase().includes(analysis.brand.toLowerCase())
      ).slice(0, 10).map(p => ({ ...p, similarity: 0.8 }));

      // Xóa file tạm
      require('fs').unlinkSync(imagePath);

      res.json({
        success: true,
        analysis,
        products: similarProducts,
        message: `Tìm thấy ${similarProducts.length} sản phẩm tương tự`
      });

    } catch (error) {
      console.error('❌ Lỗi tìm kiếm theo hình ảnh:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ChatBotController;
