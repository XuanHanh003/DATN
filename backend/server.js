// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");
const { loadWord2Vec } = require('./utils/word2vecSearch');

dotenv.config();
const app = express();

// Kết nối SQL Server
connectDB();
(async () => {
  try {
    await loadWord2Vec();
    console.log('🚀 Word2Vec model ready!');
  } catch (err) {
    console.error('❌ Lỗi khi nạp model 2vec:', err);
  }
})();
// Tạo HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

// Danh sách origin được phép
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware chung
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/users", require("./routes/UserRoutes"));
app.use("/api/reviews", require("./routes/ReviewRoutes"));
app.use("/api/products", require("./routes/ProductRoutes"));
app.use("/api/orders", require("./routes/OrderRoutes"));
app.use("/api/cart", require("./routes/CartRoutes"));
app.use("/api/carts", require("./routes/CartRoutes"));
app.use("/api/address", require("./routes/AddressRoutes"));
app.use("/api/addresses", require("./routes/AddressRoutes"));
app.use("/api/categories", require("./routes/CategoryRoutes"));
app.use("/api/attributes", require("./routes/AttributeRoutes"));
app.use("/api/prices", require("./routes/PriceRoutes"));
app.use("/api/summary", require("./routes/SummaryRoutes"));
app.use("/api/chatbot", require("./routes/ChatBotRoutes"));

// Endpoint nhận summary từ Python (Socket)
app.post("/api/summaries", (req, res) => {
  const { reviewId, productId, summary } = req.body;
  io.emit("review_summary", { reviewId, productId, summary });
  res.json({ message: "✅ Summary broadcasted successfully" });
});

// Kiểm tra server
app.get("/", (req, res) => {
  res.json({ message: "🚀 MSSQL Server đang hoạt động ổn định!" });
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route không tồn tại" });
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: "❌ Lỗi server", error: err.message });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
