const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Cria um novo produto, suas variantes e imagens.
 * @route   POST /api/products
 * @access  Privado (Admin)
 */
const createProductController = async (req, res) => {
  const { name, description, brandId, categoryId, variants, images, basePrice, isPromotional } = req.body;

  try {
    const newProduct = await prisma.$transaction(async (prisma) => {
      // 1. Criar o produto principal
      const product = await prisma.product.create({
        data: {
          name,
          description,
          brandId,
          categoryId,
          basePrice,
          isPromotional: Boolean(isPromotional),
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        },
      });

      // 2. Criar as imagens do produto
      if (images && images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map(img => ({
            ...img,
            productId: product.id,
          })),
        });
      }

      // 3. Criar as variantes e seus atributos
      if (variants && variants.length > 0) {
        for (const variantData of variants) {
          const { attributes, ...variantDetails } = variantData;
          const variant = await prisma.productVariant.create({
            data: {
              ...variantDetails,
              productId: product.id,
            },
          });

          // Associar atributos à variante
          if (attributes && attributes.length > 0) {
            await prisma.productVariantAttributeValue.createMany({
              data: attributes.map(attr => ({
                productVariantId: variant.id, // nome correto conforme schema
                attributeValueId: attr.attributeValueId,
              })),
            });
          }
        }
      }

      return product;
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o produto.' });
  }
};


/**
 * @desc    Atualiza um produto, suas variantes e imagens.
 * @route   PUT /api/products/:id
 * @access  Privado (Admin)
 */
const updateProductController = async (req, res) => {
    const { id } = req.params;
    const { name, description, brandId, categoryId, variants, images, isPromotional } = req.body;
  
    try {
      const updatedProduct = await prisma.$transaction(async (prisma) => {
        // 1. Atualizar o produto principal
        const product = await prisma.product.update({
          where: { id },
          data: {
            name,
            description,
            brandId,
            categoryId,
            slug: name ? name.toLowerCase().replace(/\s+/g, '-') : undefined,
            isPromotional: typeof isPromotional === 'boolean' ? isPromotional : undefined,
          },
        });
  
        // 2. Lidar com a atualização de variantes e imagens
        // Estratégia: Remover e recriar, mas com verificações de segurança.

        // Obter IDs das variantes existentes para este produto
        const variantsInDb = await prisma.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const variantIdsInDb = variantsInDb.map(v => v.id);

        if (variantIdsInDb.length > 0) {
          // Verificar se alguma variante está em um pedido existente
          const orderItemsCount = await prisma.orderItem.count({
            where: { productVariantId: { in: variantIdsInDb } },
          });

          if (orderItemsCount > 0) {
            // Se estiver em um pedido, não podemos deletar. Lançar um erro.
            // Uma implementação mais robusta poderia desativar as variantes em vez de deletar.
            throw new Error('Não é possível atualizar o produto pois uma ou mais de suas variantes fazem parte de um pedido existente.');
          }

          // Se não estiver em pedidos, podemos remover dos carrinhos dos usuários
          await prisma.cartItem.deleteMany({
            where: { productVariantId: { in: variantIdsInDb } },
          });
        }
        
        // Agora que as dependências foram tratadas, podemos deletar as variantes e imagens antigas
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        await prisma.productImage.deleteMany({ where: { productId: id } });
  
        // 3. Recriar imagens
        if (images && images.length > 0) {
          await prisma.productImage.createMany({
            data: images.map(img => ({ ...img, productId: product.id })),
          });
        }
  
        // 4. Recriar variantes
        if (variants && variants.length > 0) {
          for (const variantData of variants) {
            const { attributes, ...variantDetails } = variantData;
            const variant = await prisma.productVariant.create({
              data: { ...variantDetails, productId: product.id },
            });
  
            if (attributes && attributes.length > 0) {
              await prisma.productVariantAttributeValue.createMany({
                data: attributes.map(attr => ({
                  productVariantId: variant.id,
                  attributeValueId: attr.attributeValueId,
                })),
              });
            }
          }
        }
  
        return product;
      }, {
        maxWait: 10000, // Aumenta o tempo de espera da transação
        timeout: 20000, // Aumenta o timeout da transação
      });
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      // Enviar uma mensagem de erro mais amigável para o front-end
      const userMessage = error.message.includes('pedido existente')
        ? error.message
        : 'Erro interno do servidor ao atualizar o produto.';
      res.status(500).json({ message: userMessage });
    }
  };
  
  /**
   * @desc    Deleta um produto.
   * @route   DELETE /api/products/:id
   * @access  Privado (Admin)
   */
  const deleteProductController = async (req, res) => {
    const { id } = req.params;
  
    try {
      // O schema com `onDelete: Cascade` cuidará da limpeza das tabelas relacionadas
      await prisma.product.delete({
        where: { id },
      });
  
      res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error(`Erro ao deletar produto ${id}:`, error);
      // Prisma P2025: "An operation failed because it depends on one or more records that were required but not found."
      // Isso pode acontecer se o produto já foi deletado.
      if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(500).json({ message: 'Erro interno do servidor ao deletar o produto.' });
    }
  };

/**
 * @desc    Lista todos os produtos com suas variantes e imagens.
 * @route   GET /api/products
 * @access  Público
 */
const getAllProductsController = async (req, res) => {
  try {
    const { q, categorySlug, brandId, promo } = req.query;
    const where = {};
    if (q && q.trim()) {
      where.name = { contains: q.trim(), mode: 'insensitive' };
    }
    if (categorySlug && categorySlug.trim()) {
      where.category = { slug: categorySlug.trim() };
    }
    if (brandId && brandId.trim()) {
      where.brandId = brandId.trim();
    }
    if (promo === 'true') {
      where.isPromotional = true;
    }

    const products = await prisma.product.findMany({
      where,
      // Inclui informações essenciais para a listagem de produtos
      include: {
        brand: true, // Marca do produto
        category: true, // Categoria do produto
        variants: {
          // Para cada produto, pegue suas variantes
          include: {
            attributes: {
              // Para cada variante, pegue seus atributos (como cor e tamanho)
              include: {
                attributeValue: {
                  include: {
                    attribute: true, // Inclui o nome do atributo (ex: "Cor")
                  },
                },
              },
            },
          },
        },
        images: {
          // Pega as imagens gerais do produto
          orderBy: {
            priority: 'asc', // Ordena pela prioridade definida
          },
        },
      },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado.' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
  }
};

/**
 * @desc    Busca um produto específico pelo seu ID.
 * @route   GET /api/products/:id
 * @access  Público
 */
const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      // Inclui todos os detalhes necessários para a página de um único produto
      include: {
        brand: true,
        category: true,
        reviews: { // Inclui as avaliações dos usuários
          include: {
            user: {
              select: { firstName: true } // Pega apenas o nome do usuário que avaliou
            }
          }
        },
        images: {
          orderBy: { priority: 'asc' }
        },
        variants: {
          include: {
            images: { // Imagens específicas da variante (ex: cor)
              orderBy: { priority: 'asc' }
            },
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Erro ao buscar produto por ID: ${req.params.id}`, error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca um produto específico pelo seu SLUG.
 * @route   GET /api/products/slug/:slug
 * @access  Público
 */
const getProductBySlugController = async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await prisma.product.findUnique({
        where: { slug },
        // A estrutura de includes é a mesma do getProductById
        include: {
          brand: true,
          category: true,
          reviews: {
            include: {
              user: {
                select: { firstName: true }
              }
            }
          },
          images: {
            orderBy: { priority: 'asc' }
          },
          variants: {
            include: {
              images: {
                orderBy: { priority: 'asc' }
              },
              attributes: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error(`Erro ao buscar produto por Slug: ${req.params.slug}`, error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  };
/**
 * @desc    Produtos em destaque: promoções ou mais vendidos
 * @route   GET /api/products/featured
 * @access  Público
 */
const getFeaturedProductsController = async (req, res) => {
  try {
    const { type } = req.query;

    // Lógica para PROMOÇÃO
    if (type === 'promo') {
      const prods = await prisma.product.findMany({
        where: { isPromotional: true },
        include: { images: { orderBy: { priority: 'asc' } }, brand: true, category: true },
        take: 8,
      });
      return res.status(200).json(prods);
    }

    const top = await prisma.orderItem.groupBy({
      by: ['productVariantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    });

    const variantIds = top.map(t => t.productVariantId);
    if (variantIds.length === 0) {
      return res.status(200).json([]);
    }

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { include: { images: { orderBy: { priority: 'asc' } }, brand: true, category: true } } },
    });

    // Mapeia para produtos e remove duplicatas (caso 2 variantes do mesmo produto sejam top)
    const products = variants.map(v => v.product);
    const uniqueProducts = Array.from(new Map(products.map(p => [p.id, p])).values());
    
    res.status(200).json(uniqueProducts);

  } catch (error) {
    console.error('Erro em produtos em destaque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductBySlugController,
  getFeaturedProductsController,
  updateProductController,
  deleteProductController,
};
