import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUserData(userEmail) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log(`❌ User ${userEmail} not found`);
      return;
    }

    // Delete all transactions for this user
    const deleted = await prisma.transaction.deleteMany({
      where: { userId: user.id }
    });

    console.log(`✅ Deleted ${deleted.count} transactions for ${userEmail}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/clearUserData.js <user-email>');
  process.exit(1);
}

clearUserData(email);
