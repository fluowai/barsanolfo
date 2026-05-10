import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed starting...');

  const org = await prisma.organization.findFirst() || await prisma.organization.create({
    data: { name: 'Barsa Advocacia' },
  });

  const adminEmail = 'admin@barsaadvocacia.com.br';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        organizationId: org.id,
      },
    });
    console.log('✅ Admin user created: admin@barsaadvocacia.com.br / admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
