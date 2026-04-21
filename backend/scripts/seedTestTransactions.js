import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestTransactions(userEmail) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log(`❌ User ${userEmail} not found`);
      return;
    }

    console.log(`🌱 Seeding test transactions for ${userEmail}...`);

    // Sample transactions for testing
    const testTransactions = [
      { amount: -50000, category: 'makanan', description: 'Makan siang', date: new Date() },
      { amount: -25000, category: 'minuman', description: 'Kopi', date: new Date() },
      { amount: -100000, category: 'transportasi', description: 'Bensin', date: new Date() },
      { amount: -200000, category: 'belanja', description: 'Groceries', date: new Date() },
      { amount: -150000, category: 'hiburan', description: 'Nonton bioskop', date: new Date() },
    ];

    const created = await prisma.transaction.createMany({
      data: testTransactions.map(t => ({
        ...t,
        userId: user.id
      }))
    });

    console.log(`✅ Created ${created.count} test transactions`);
    
    const total = testTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    console.log(`💰 Total spending: Rp ${total.toLocaleString('id-ID')}`);
    
    console.log('\n✨ Ready to test!');
    console.log('   Refresh dashboard to see AI predictions\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/seedTestTransactions.js <user-email>');
  process.exit(1);
}

seedTestTransactions(email);
