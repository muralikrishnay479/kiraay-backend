const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/dbConnection");
const app = express();

const port = process.env.PORT;

connectDB();

app.use(express.json());
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/categories", require("./routes/CategoryRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/messages", require("./routes/messagesRoutes"));
app.use(require("./middleware/errorHandler"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});