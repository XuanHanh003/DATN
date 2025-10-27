const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.",
});
app.use(limiter);

const vnp_TmnCode = process.env.VNP_TMN_CODE || "YOUR_TMN_CODE";
const vnp_HashSecret = process.env.VNP_HASH_SECRET || "YOUR_HASH_SECRET";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const ngrokUrl = process.env.NGROK_URL || "http://localhost:5001";
const vnp_ReturnUrl = `${ngrokUrl}/payment/return`;
const frontendUrl = "http://localhost:3000";

if (vnp_TmnCode === "YOUR_TMN_CODE" || vnp_HashSecret === "YOUR_HASH_SECRET") {
  console.error("Thiếu VNP_TMN_CODE hoặc VNP_HASH_SECRET trong .env");
  process.exit(1);
}

const tempOrders = {};
const processedOrders = new Set();

const cleanupTempOrders = () => {
  const now = Date.now();
  for (const orderId in tempOrders) {
    if (now - tempOrders[orderId].timestamp > 30 * 60 * 1000) {
      delete tempOrders[orderId];
    }
  }
};
setInterval(cleanupTempOrders, 5 * 60 * 1000);

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.ip;
  return ip === "::1" ? "127.0.0.1" : ip;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded._id;
    req.token = token;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token không hợp lệ" });
  }
};

// Endpoint tạo thanh toán
app.post("/create_payment", authenticateToken, async (req, res) => {
  try {
    const { amount, orderInfo, items, address } = req.body;
    const userId = req.userId;
    const token = req.token;

    if (!userId || !amount || !orderInfo || !items || !Array.isArray(items) || items.length === 0 || !address) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết (userId, amount, orderInfo, items, address)" });
    }

    // Validate items dựa trên schema mới (prices là Map)
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.size || typeof item.price !== "number" || item.price <= 0) {
        return res.status(400).json({ error: "Dữ liệu sản phẩm không hợp lệ (productId, quantity, size, price)" });
      }
      // Không cần kiểm tra validSizes nếu size không bắt buộc, nhưng có thể log để debug
      console.log(`Validating item: ${item.productId}, Size: ${item.size}, Price: ${item.price}`);
    }

    const date = new Date();
    const createDate = date.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const normalizedOrderInfo = orderInfo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim();

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: parseInt(amount) * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: normalizedOrderInfo,
      vnp_OrderType: "250000",
      vnp_Locale: "vn",
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: createDate,
    };

    const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const vnp_SecureHash = hmac.update(signData).digest("hex");

    sortedParams.vnp_SecureHash = vnp_SecureHash;

    const paymentUrl = `${vnp_Url}?${Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
      .join("&")}`;

    tempOrders[orderId] = { userId, items, address, amount, token, timestamp: Date.now() };
    console.log("tempOrders saved (orderId):", orderId);
    res.json({ status: "success", url: paymentUrl });
  } catch (error) {
    console.error("Lỗi trong /create_payment:", error.message);
    res.status(500).json({ error: "Lỗi server khi tạo URL thanh toán" });
  }
});

// Endpoint xử lý phản hồi từ VNPay
app.get("/payment/return", async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;

    if (!secureHash || !vnp_Params.vnp_TxnRef || !vnp_Params.vnp_Amount || !vnp_Params.vnp_ResponseCode) {
      return res.redirect(`${frontendUrl}/payment/failure?error=${encodeURIComponent("Thiếu tham số từ VNPay")}`);
    }

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const checkSum = hmac.update(signData).digest("hex");

    if (secureHash !== checkSum) {
      return res.redirect(`${frontendUrl}/payment/failure?error=${encodeURIComponent("Chữ ký không hợp lệ")}`);
    }

    const rspCode = vnp_Params.vnp_ResponseCode;
    const txnRef = vnp_Params.vnp_TxnRef;
    const transactionNo = vnp_Params.vnp_TransactionNo || "N/A";

    if (!tempOrders[txnRef]) {
      return res.redirect(`${frontendUrl}/payment/failure?error=${encodeURIComponent("Không tìm thấy thông tin đơn hàng tạm thời")}`);
    }

    if (processedOrders.has(txnRef)) {
      console.log(`Đơn hàng ${txnRef} đã được xử lý trước đó, bỏ qua.`);
      return res.redirect(`${frontendUrl}/payment/success?txnRef=${txnRef}&transactionNo=${transactionNo}&vnp_TransactionStatus=${rspCode}`);
    }

    const { userId, items, address, amount, token } = tempOrders[txnRef];

    const vnpAmount = parseInt(vnp_Params.vnp_Amount) / 100;
    if (vnpAmount !== amount) {
      return res.redirect(`${frontendUrl}/payment/failure?error=${encodeURIComponent("Số tiền không khớp")}`);
    }

    if (rspCode === "00") {
      const orderData = {
        userId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price, // Sử dụng price trực tiếp từ items
          size: item.size,   // Sử dụng size trực tiếp từ items
          color: item.color || "Không xác định",
        })),
        totalPrice: amount,
        transactionId: transactionNo,
        address: {
          fullName: address.fullName,
          phone: address.phone,
          address: address.address || `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`,
        },
      };

      try {
        const orderResponse = await axios.post(
          "http://localhost:5000/api/orders",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Đơn hàng tạo thành công:", orderResponse.data);

        const cartResponse = await axios.post(
          "http://localhost:5000/api/carts/remove-items",
          { items: orderData.items },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Sản phẩm trong giỏ hàng đã được xóa:", cartResponse.data);
      } catch (error) {
        console.error("Lỗi khi tạo đơn hàng trong /payment/return:", error.response?.data || error.message);
      }

      processedOrders.add(txnRef);
      delete tempOrders[txnRef];

      res.redirect(`${frontendUrl}/payment/success?txnRef=${txnRef}&transactionNo=${transactionNo}&vnp_TransactionStatus=${rspCode}`);
    } else {
      delete tempOrders[txnRef];
      res.redirect(`${frontendUrl}/payment/failure?txnRef=${txnRef}&responseCode=${rspCode}`);
    }
  } catch (error) {
    console.error("Lỗi trong /payment/return:", error.message);
    res.redirect(`${frontendUrl}/payment/failure?error=${encodeURIComponent(error.message || "Lỗi server khi xử lý phản hồi từ VNPay")}`);
  }
});

const VNPAY_PORT = process.env.VNPAY_PORT || 5001;
app.listen(VNPAY_PORT, () => console.log(`🚀 VNPay Server running on port ${VNPAY_PORT}`));