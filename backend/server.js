const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

const authRoutes         = require("./routes/authRoutes");
const readingRoutes      = require("./routes/readingRoutes");
const postRoutes         = require("./routes/postRoutes");
const bookRoutes         = require("./routes/bookRoutes");
const userRoutes         = require("./routes/userRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const activityRoutes     = require("./routes/activityRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ,
  credentials: true,
}));


app.use(express.json());

app.use("/api/auth",          authRoutes);
app.use("/api/reading",       readingRoutes);
app.use("/api/posts",         postRoutes);
app.use("/api/books",         bookRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity",      activityRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ReadTogether backend running on http://localhost:${PORT}`);
});