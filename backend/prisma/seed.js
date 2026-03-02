const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create single main branch
  const mainBranch = await prisma.branch.upsert({
    where: { name: 'المخزن الرئيسي' },
    update: {},
    create: { name: 'المخزن الرئيسي', address: 'المقر الرئيسي', phone: '01000000001' },
  });

  console.log('✅ Branch created');

  // Create admin user (assigned to main branch)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: { branchId: mainBranch.id },
    create: {
      name: 'مدير النظام',
      email: 'admin@inventory.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '01000000000',
      branchId: mainBranch.id,
    },
  });

  // Create cashier
  const cashierPassword = await bcrypt.hash('cashier123', 12);
  await prisma.user.upsert({
    where: { email: 'cashier@inventory.com' },
    update: { branchId: mainBranch.id },
    create: {
      name: 'كاشير',
      email: 'cashier@inventory.com',
      password: cashierPassword,
      role: 'CASHIER',
      branchId: mainBranch.id,
    },
  });

  console.log('✅ Users created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'إلكترونيات' }, update: {}, create: { name: 'إلكترونيات', description: 'أجهزة إلكترونية ومستلزماتها' } }),
    prisma.category.upsert({ where: { name: 'مواد غذائية' }, update: {}, create: { name: 'مواد غذائية', description: 'منتجات غذائية متنوعة' } }),
    prisma.category.upsert({ where: { name: 'ملابس' }, update: {}, create: { name: 'ملابس', description: 'ملابس رجالية ونسائية' } }),
    prisma.category.upsert({ where: { name: 'أدوات منزلية' }, update: {}, create: { name: 'أدوات منزلية', description: 'مستلزمات المنزل' } }),
  ]);

  console.log('✅ Categories created');

  // Create sample products
  const products = [
    { name: 'لابتوب HP ProBook', sku: 'ELEC-001', barcode: '1000000001', price: 15000, cost: 12000, categoryId: categories[0].id, alertQuantity: 5, taxRate: 0 },
    { name: 'ماوس لاسلكي', sku: 'ELEC-002', barcode: '1000000002', price: 350, cost: 200, categoryId: categories[0].id, alertQuantity: 20, taxRate: 0 },
    { name: 'سماعات بلوتوث', sku: 'ELEC-003', barcode: '1000000003', price: 1200, cost: 700, categoryId: categories[0].id, alertQuantity: 10, taxRate: 0 },
    { name: 'أرز بسمتي 5 كجم', sku: 'FOOD-001', barcode: '2000000001', price: 120, cost: 85, categoryId: categories[1].id, alertQuantity: 50, taxRate: 0 },
    { name: 'زيت زيتون 1 لتر', sku: 'FOOD-002', barcode: '2000000002', price: 180, cost: 130, categoryId: categories[1].id, alertQuantity: 30, taxRate: 0 },
    { name: 'قميص رجالي كلاسيك', sku: 'CLTH-001', barcode: '3000000001', price: 450, cost: 250, categoryId: categories[2].id, alertQuantity: 15, taxRate: 0 },
    { name: 'طقم أطباق 24 قطعة', sku: 'HOME-001', barcode: '4000000001', price: 850, cost: 500, categoryId: categories[3].id, alertQuantity: 10, taxRate: 0 },
    { name: 'شاحن USB-C سريع', sku: 'ELEC-004', barcode: '1000000004', price: 250, cost: 120, categoryId: categories[0].id, alertQuantity: 25, taxRate: 0 },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });

    // Add stock to main branch
    await prisma.branchProduct.upsert({
      where: { branchId_productId: { branchId: mainBranch.id, productId: product.id } },
      update: {},
      create: { branchId: mainBranch.id, productId: product.id, quantity: Math.floor(Math.random() * 100) + 20 },
    });
  }

  console.log('✅ Products and stock created');

  // Create sample customer
  await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: { id: 'seed-customer-1', name: 'عميل تجريبي', phone: '01000000099', email: 'customer@test.com' },
  });

  console.log('✅ Sample customer created');
  console.log('\n🎉 Seed completed!\n');
  console.log('📧 Admin login: admin@inventory.com / admin123');
  console.log('📧 Cashier login: cashier@inventory.com / cashier123\n');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
