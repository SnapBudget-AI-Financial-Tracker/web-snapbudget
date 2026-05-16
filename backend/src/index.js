import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

// Verify Prisma is initialized
if (!prisma) {
  if (process.env.NODE_ENV !== 'test') {
    console.error("Server cannot start: Prisma client failed to initialize");
  }
  process.exit(1);
}

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server running on port ${PORT}`);
  }
});
