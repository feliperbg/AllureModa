
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Cria um novo produto, suas variantes e imagens.
 * @route   POST /api/products
 * @access  Privado (Admin)
 */
const createProductController = async (req, res) => {
  const { name, description, brandId, categoryId, variants, images } = req.body;

  try {
    const newProduct = await prisma.$transaction(async (prisma) => {
      // 1. Criar o produto principal
      const product = await prisma.product.create({
        data: {
          name,
          description,
          brandId,
          categoryId,
          slug: name.toLowerCase().replace(/\s+/g, '-'), // Gerar slug a partir do nome
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
                variantId: variant.id,
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
    const { name, description, brandId, categoryId, variants, images } = req.body;
  
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
          },
        });
  
        // Lógica para atualizar/remover/adicionar imagens e variantes
        // (Esta parte pode ser complexa e depende da estratégia: substituir tudo ou fazer diff)
  
        // Exemplo: Remover imagens e variantes antigas e criar as novas
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productVariant.deleteMany({ where: { productId: id } }); // Cuidado com FKs
  
        // Recriar imagens
        if (images && images.length > 0) {
          await prisma.productImage.createMany({
            data: images.map(img => ({ ...img, productId: product.id })),
          });
        }
  
        // Recriar variantes
        if (variants && variants.length > 0) {
          for (const variantData of variants) {
            const { attributes, ...variantDetails } = variantData;
            const variant = await prisma.productVariant.create({
              data: { ...variantDetails, productId: product.id },
            });
  
            if (attributes && attributes.length > 0) {
              await prisma.productVariantAttributeValue.createMany({
                data: attributes.map(attr => ({
                  variantId: variant.id,
                  attributeValueId: attr.attributeValueId,
                })),
              });
            }
          }
        }
  
        return product;
      });
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      res.status(500).json({ message: 'Erro interno do servidor ao atualizar o produto.' });
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
    const products = await prisma.product.findMany({
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


module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductBySlugController,
  updateProductController,
  deleteProductController,
};
