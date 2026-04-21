import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetForTesting() {
  try {
    console.log('🧹 Clearing all transactions...');
    const deleted = await prisma.transaction.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} transactions`);
    
    console.log('\n📊 Current state:');
    const userCount = await prisma.user.count();
    const transactionCount = await prisma.transaction.count();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Transactions: ${transactionCount}`);
    
    console.log('\n✨ Ready for testing!');
    console.log('   1. Refresh your dashboard');
    console.log('   2. Upload new struk or add transactions');
    console.log('   3. AI will generate fresh predictions\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetForTesting();
