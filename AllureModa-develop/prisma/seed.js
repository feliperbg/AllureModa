require('dotenv').config();
const { prisma } = require('./client');
const bcrypt = require('bcryptjs');

// --- FUNÇÕES DE UPSERT (Já existentes) ---

async function upsertBrand(name, slug, logoUrl) {
  return prisma.brand.upsert({
    where: { slug },
    update: { name, logoUrl },
    create: { name, slug, logoUrl },
  });
}

async function upsertCategory(name, slug, parentSlug) {
  let parent = null;
  if (parentSlug) {
    parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
  }
  return prisma.category.upsert({
    where: { slug },
    update: { name, parentId: parent ? parent.id : null },
    create: { name, slug, parentId: parent ? parent.id : null },
  });
}

async function upsertAttribute(name, slug) {
  return prisma.attribute.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function ensureAttributeValue(attributeSlug, value, meta) {
  const attribute = await prisma.attribute.findUnique({ where: { slug: attributeSlug } });
  if (!attribute) throw new Error('Atributo não encontrado: ' + attributeSlug);
  const existing = await prisma.attributeValue.findFirst({ where: { value, attributeId: attribute.id } });
  if (existing) return existing;
  return prisma.attributeValue.create({ data: { value, meta: meta || null, attributeId: attribute.id } });
}

async function createOrUpdateProduct(data) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    // Atualiza informações básicas e recria variantes/imagens
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        isPromotional: data.isPromotional || false,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        images: { create: data.images || [] },
      },
    });
  } else {
    return prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        isPromotional: data.isPromotional || false,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        images: { create: data.images || [] },
      },
    });
  }
}

async function createVariantWithAttributes(productId, sku, price, stock, attributeValueIds) {
  const variant = await prisma.productVariant.create({
    data: { productId, sku, price, stock },
  });
  for (const avId of attributeValueIds) {
    await prisma.productVariantAttributeValue.create({
      data: { productVariantId: variant.id, attributeValueId: avId },
    });
  }
  return variant;
}

async function createAdminUser() {
  const email = 'admin@alluremoda.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
    }
    return existing;
  }
  const passwordHash = await bcrypt.hash('admin123', 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '11999998888',
      cpf: '12345678900',
    },
  });
}

// --- NOVAS FUNÇÕES DE SEED (Dados Faltantes) ---

async function createAdminAddress(adminId) {
  const existing = await prisma.address.findFirst({ where: { userId: adminId } });
  if (existing) return existing;

  console.log('Criando endereço para o admin...');
  return prisma.address.create({
    data: {
      street: 'Rua da Loja',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01000-000',
      country: 'Brasil',
      addressLine2: 'Admin',
      type: 'SHIPPING',
      userId: adminId,
    },
  });
}

async function createAdminCart(adminId) {
  const existing = await prisma.cart.findUnique({ where: { userId: adminId } });
  if (existing) return existing;

  console.log('Criando carrinho para o admin...');
  return prisma.cart.create({
    data: {
      userId: adminId,
    },
  });
}

async function createAdminReview(adminId, productId) {
  const existing = await prisma.review.findUnique({ where: { userId_productId: { userId: adminId, productId } } });
  if (existing) return existing;

  console.log('Criando review para o produto 1...');
  return prisma.review.create({
    data: {
      rating: 5,
      comment: 'Adorei este produto! Qualidade excelente.',
      userId: adminId,
      productId: productId,
    },
  });
}

async function createAdminWishlist(adminId, productId) {
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: adminId, productId } } });
  if (existing) return existing;

  console.log('Adicionando produto 2 à wishlist...');
  return prisma.wishlistItem.create({
    data: {
      userId: adminId,
      productId: productId,
    },
  });
}

async function createSampleOrder(adminId, addressId, variant) {
  const existing = await prisma.order.findFirst({ where: { userId: adminId } });
  if (existing) return existing;

  console.log('Criando pedido de teste...');
  const subTotal = variant.price;
  const shippingFee = 15.00;
  const totalPrice = parseFloat(subTotal) + shippingFee;

  return prisma.order.create({
    data: {
      status: 'PAID',
      subTotal: subTotal,
      shippingFee: shippingFee,
      totalPrice: totalPrice,
      userId: adminId,
      shippingAddressId: addressId,
      billingAddressId: addressId,
      items: {
        create: [
          {
            quantity: 1,
            priceAtPurchase: variant.price,
            productVariantId: variant.id,
          },
        ],
      },
    },
  });
}


// --- FUNÇÃO PRINCIPAL (MAIN) ---

async function main() {
  console.log('Iniciando seed...');
  // Marcas
  const allure = await upsertBrand('Allure', 'allure', 'https://dummyimage.com/80x80/000/fff.png&text=A');
  const modaX = await upsertBrand('ModaX', 'modax', 'https://dummyimage.com/80x80/000/fff.png&text=M');

  // Categorias
  const catVestidos = await upsertCategory('Vestidos', 'vestidos');
  const catCamisetas = await upsertCategory('Camisetas', 'camisetas');

  // Atributos
  await upsertAttribute('Cor', 'cor');
  await upsertAttribute('Tamanho', 'tamanho');

  // Valores de atributos
  const avVermelho = await ensureAttributeValue('cor', 'Vermelho', '#FF0000');
  const avAzul = await ensureAttributeValue('cor', 'Azul', '#0000FF');
  const avPreto = await ensureAttributeValue('cor', 'Preto', '#000000');
  const avP = await ensureAttributeValue('tamanho', 'P');
  const avM = await ensureAttributeValue('tamanho', 'M');
  const avG = await ensureAttributeValue('tamanho', 'G');

  // Produto 1
  const produto1 = await createOrUpdateProduct({
    slug: 'vestido-florido',
    name: 'Vestido Florido',
    description: 'Vestido leve com estampa floral, ideal para o verão.',
    basePrice: '199.90',
    isPromotional: true,
    categoryId: catVestidos.id,
    brandId: allure.id,
    images: [
      { url: 'https://images.unsplash.com/photo-1520975922200-2b0e1a02e4b5', altText: 'Vestido Florido 1', priority: 0 },
      { url: 'https://images.unsplash.com/photo-1512436991641-6745ad6a16f8', altText: 'Vestido Florido 2', priority: 1 },
    ],
  });

  const p1v1 = await createVariantWithAttributes(produto1.id, 'VF-VER-P', '219.90', 12, [avVermelho.id, avP.id]);
  await createVariantWithAttributes(produto1.id, 'VF-VER-M', '219.90', 8, [avVermelho.id, avM.id]);
  await createVariantWithAttributes(produto1.id, 'VF-AZU-G', '219.90', 5, [avAzul.id, avG.id]);

  // Produto 2
  const produto2 = await createOrUpdateProduct({
    slug: 'camiseta-basica',
    name: 'Camiseta Básica',
    description: 'Camiseta confortável de algodão, cores sólidas.',
    basePrice: '69.90',
    categoryId: catCamisetas.id,
    brandId: modaX.id,
    images: [
      { url: 'https://images.unsplash.com/photo-1520977617911-03c44d8ad0d1', altText: 'Camiseta Básica 1', priority: 0 },
    ],
  });

  await createVariantWithAttributes(produto2.id, 'CB-PRE-P', '79.90', 30, [avPreto.id, avP.id]);
  await createVariantWithAttributes(produto2.id, 'CB-PRE-M', '79.90', 25, [avPreto.id, avM.id]);
  await createVariantWithAttributes(produto2.id, 'CB-PRE-G', '79.90', 20, [avPreto.id, avG.id]);

  // Admin
  const admin = await createAdminUser();
  console.log('Admin:', admin.email, admin.role);

  // --- Adicionando dados extras ---
  console.log('Criando dados adicionais para o admin...');
  const adminAddress = await createAdminAddress(admin.id);
  await createAdminCart(admin.id);
  await createAdminReview(admin.id, produto1.id);
  await createAdminWishlist(admin.id, produto2.id);
  
  // Cria um pedido com a primeira variante do produto 1
  if (p1v1) {
    await createSampleOrder(admin.id, adminAddress.id, p1v1);
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });