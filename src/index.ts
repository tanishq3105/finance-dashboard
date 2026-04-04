import connectDB from "./db/index.js";
import app from "./app.js";
import { env } from "node:process";

const PORT = env.PORT || 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running at port: ${PORT}`);
    });

    server.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!!", err);
  });
