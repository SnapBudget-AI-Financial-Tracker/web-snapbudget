import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllTransactions() {
  try {
    console.log('🧹 Clearing all transactions...');
    const deleted = await prisma.transaction.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} transactions`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllTransactions();
