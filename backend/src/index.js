import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

// Verify Prisma is initialized
if (!prisma) {
  console.error("Server cannot start: Prisma client failed to initialize");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
