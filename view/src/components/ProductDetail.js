import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import apiClient from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

// Função para validar se uma string é um código hexadecimal
const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex) || /^#[0-9A-F]{3}$/i.test(hex);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const consent = typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true';

  // --- Funções de Cookie e Carrinho ---
  const getCookie = (name) => {
    const m = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')) : null;
    return m ? m[1] : '';
  };
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    if (typeof document !== 'undefined') document.cookie = name + '=' + value + '; ' + expires + '; path=/';
  };
  const decodeCartCookie = (v) => { try { return JSON.parse(decodeURIComponent(atob(v))); } catch { return []; } };
  const encodeCartCookie = (arr) => { try { return btoa(encodeURIComponent(JSON.stringify(arr || []))); } catch { return ''; } };
  
  // --- Estados do Componente ---
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // *** NOVO ESTADO PARA O CARROSSEL ***
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- Carregamento do Produto ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await apiClient.get(`/products/slug/${slug}`);
        setProduct(data);
        setCurrentImageIndex(0); // Reseta a imagem ao carregar o produto
        if (data?.variants?.[0]) {
          const firstVariant = data.variants[0];
          setSelectedVariantId(firstVariant.id);
          const initialAttributes = firstVariant.attributes.reduce((acc, attr) => {
            acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
            return acc;
          }, {});
          setSelectedAttributes(initialAttributes);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Não foi possível carregar o produto. Tente novamente mais tarde.');
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // --- LÓGICA DE ATRIBUTOS (ATUALIZADA) ---

  /**
   * @desc Cria um mapa de atributos mais rico, guardando o valor e o meta (hex)
   * Ex: Map<'Cor', Map<'Vermelho', '#FF0000', 'Azul', '#0000FF'>>
   * Ex: Map<'Tamanho', Map<'P', null, 'M', null>>
   */
  const attributesMap = useMemo(() => {
    const map = new Map(); // Map<string, Map<string, string | null>>
    product?.variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        const attrName = attr.attributeValue.attribute.name;
        const attrValue = attr.attributeValue.value;
        const attrMeta = attr.attributeValue.meta;

        if (!map.has(attrName)) {
          map.set(attrName, new Map());
        }
        // Guarda o meta (hex) junto com o valor (nome da cor)
        if (!map.get(attrName).has(attrValue)) {
          map.get(attrName).set(attrValue, attrMeta);
        }
      });
    });
    return map;
  }, [product]);

  /**
   * @desc Verifica se um tamanho específico está disponível para a cor selecionada.
   */
  const isSizeAvailable = useCallback((sizeValue) => {
    // Pega a cor que já está selecionada no estado
    const selectedColor = selectedAttributes['Cor'];
    
    // Se nenhuma cor foi selecionada, nenhum tamanho está disponível
    if (!selectedColor) {
      return false;
    }

    // Verifica se *alguma* variante no JSON do produto
    // combina a cor selecionada E o tamanho que estamos verificando.
    return product.variants.some(variant => {
      const hasColor = variant.attributes.some(a => 
        a.attributeValue.attribute.name === 'Cor' && 
        a.attributeValue.value === selectedColor
      );
      const hasSize = variant.attributes.some(a => 
        a.attributeValue.attribute.name === 'Tamanho' && 
        a.attributeValue.value === sizeValue
      );
      // Retorna true apenas se a variante tiver AMBAS as propriedades
      return hasColor && hasSize;
    });
  }, [product, selectedAttributes]);

  /**
   * @desc Lógica inteligente para selecionar atributos.
   * Se uma combinação inválida for clicada (ex: 'Azul' e 'P'),
   * ela automaticamente se corrige para a primeira válida (ex: 'Azul' e 'G').
   */
  const handleAttributeSelect = (attributeName, value) => {
    const newAttributes = { ...selectedAttributes, [attributeName]: value };

    // Se o usuário mudou a Cor, resetamos o Tamanho para 
    // forçar a lógica a encontrar um novo tamanho compatível.
    if (attributeName === 'Cor') {
      delete newAttributes['Tamanho'];
    }

    // 1. Encontre todas as variantes que correspondem ao atributo recém-clicado
    // (ex: todas as variantes "Azuis")
    const matchingVariants = product.variants.filter(v =>
      v.attributes.some(a =>
        a.attributeValue.attribute.name === attributeName &&
        a.attributeValue.value === value
      )
    );

    // 2. Dentre essas variantes, tente encontrar uma que corresponda 
    // ao *restante* dos atributos (ex: 'Tamanho: P' se ainda estiver lá)
    let compatibleVariant = matchingVariants.find(v =>
      Object.entries(newAttributes).every(([key, val]) =>
        v.attributes.some(a =>
          a.attributeValue.attribute.name === key &&
          a.attributeValue.value === val
        )
      )
    );

    // 3. Se não houver (ex: "Azul, P" não existe), 
    // apenas pegue a *primeira* variante correspondente (ex: "Azul, G")
    if (!compatibleVariant && matchingVariants.length > 0) {
      compatibleVariant = matchingVariants[0];
    }

    // 4. Agora, atualize o estado para corresponder a essa variante válida
    if (compatibleVariant) {
      const updatedAttributes = compatibleVariant.attributes.reduce((acc, attr) => {
        acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
        return acc;
      }, {});
      
      setSelectedAttributes(updatedAttributes);
      setSelectedVariantId(compatibleVariant.id);
    } else {
      // Failsafe: se nada for encontrado (não deve acontecer se a lógica acima estiver correta)
      setSelectedAttributes(newAttributes);
      setSelectedVariantId('');
    }
  };

  // --- Funções de Ação (Wishlist, Cart) ---
  const addToWishlist = async () => {
    try {
      setMessage('');
      await api.post('/wishlist', { productId: product.id });
      setMessage('Adicionado à wishlist');
    } catch (e) { setMessage(e.response?.data?.message || 'Falha ao favoritar'); }
  };

  const addToCart = async () => {
    try {
      setMessage('');
      if (auth?.isAuthenticated && consent) {
        await api.put('/cart', { productVariantId: selectedVariantId, quantity: 1 });
      } else {
        const raw = getCookie('local_cart');
        const arr = raw ? decodeCartCookie(raw) : [];
        const idx = arr.findIndex(function(i){ return i.productVariantId === selectedVariantId; });
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], quantity: Number(arr[idx].quantity || 0) + 1 };
        } else {
          const variant = (product?.variants || []).find(function(v){ return v.id === selectedVariantId; });
          arr.push({ id: 'local-'+selectedVariantId, quantity: 1, productVariantId: selectedVariantId, product: product, variant: variant || null });
        }
        const v = encodeCartCookie(arr);
        if (v) setCookie('local_cart', v, 7);
      }
      setMessage('Adicionado ao carrinho');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (e) { setMessage(e.response?.data?.message || 'Falha ao adicionar ao carrinho'); }
  };


  // --- Renderização ---
  if (loading) {
    return <div className="text-center p-10">Carregando produto...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }
  if (!product) {
    return <div className="text-center p-10">Produto não encontrado.</div>;
  }

  const selectedColorName = selectedAttributes['Cor'];

  // *** NOVAS FUNÇÕES E VARIÁVEIS DO CARROSSEL ***
  const totalImages = product.images.length;
  // Fallback seguro caso as imagens ainda não tenham carregado
  const currentImage = product.images[currentImageIndex] || product.images[0]; 

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };
  // --- FIM DAS NOVAS FUNÇÕES ---


  // --- NOVO LAYOUT RESPONSIVO ---
  return (
    <div className="bg-white">
      {/* Container principal: 
        - Centralizado e com padding
        - No desktop (lg), vira uma grade de 2 colunas 
      */}
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">

          {/* === COLUNA 1: IMAGENS (CARROSSEL HÍBRIDO) === */}
          <div className="flex flex-col">
            
            {/* Imagem Principal (com setas) */}
            <div className="relative aspect-h-4 aspect-w-3 w-full overflow-hidden rounded-lg">
              {/* Verificação para garantir que a imagem existe */}
              {currentImage && (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || product.name}
                  className="h-full w-full object-cover object-center"
                />
              )}

              {/* Setas de Navegação (Só aparecem se houver mais de 1 imagem) */}
              {totalImages > 1 && (
                <>
                  {/* Botão Anterior */}
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  
                  {/* Botão Próximo */}
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails (só mostra se houver mais de 1 imagem) */}
            {totalImages > 1 && (
              // Grid horizontal para as thumbnails (máximo de 5, com scroll se passar)
              <div className="mt-4">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      // Ajuste para o tamanho das thumbnails
                      className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none
                        ${index === currentImageIndex ? 'ring-2 ring-indigo-500 ring-offset-2' : 'ring-1 ring-gray-300'}
                      `}
                    >
                      <span className="sr-only">{image.altText || `Thumbnail ${index + 1}`}</span>
                      <img
                        src={image.url}
                        alt={image.altText || `Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* === COLUNA 2: INFO === */}
          {/* * Mobile: 'mt-10' para separar das imagens.
            * Desktop: 'mt-0' pois já está na coluna ao lado.
          */}
          <div className="mt-10 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl tracking-tight text-gray-900">
              R$ {product.basePrice}
            </p>
            {message && <div className="mt-4 text-sm font-medium text-indigo-600">{message}</div>}

            {/* Descrição (Movida para cima para melhor UX) */}
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-900">
                <p>{product.description}</p>
              </div>
            </div>

            {/* --- SELEÇÃO DE ATRIBUTOS (LÓGICA INALTERADA) --- */}
            <div className="mt-10 space-y-6">
              {Array.from(attributesMap.keys()).map(attributeName => {

                // --- RENDERIZAÇÃO DAS CORES ---
                if (attributeName.toLowerCase() === 'cor') {
                  return (
                    <div key={attributeName}>
                      <h3 className="text-sm font-medium text-gray-900">
                        Cor: <span className="font-normal">{selectedColorName}</span>
                      </h3>
                      <div className="flex items-center space-x-3 mt-2">
                        {Array.from(attributesMap.get(attributeName)).map(([value, meta]) => {
                          const colorHex = isValidHex(meta) ? meta : '#ffffff'; // Usa branco se o hex for inválido
                          const isSelected = selectedAttributes[attributeName] === value;
                          return (
                            // Wrapper para Tooltip
                            <div key={value} className="relative group">
                              <button
                                type="button"
                                onClick={() => handleAttributeSelect(attributeName, value)}
                                // Estilo do radio button de cor
                                className={`relative w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                                  ${isSelected ? 'ring-2 ring-black-500 ring-offset-2' : ''}
                                `}
                                style={{ backgroundColor: colorHex }}
                                aria-label={value}
                              >
                                {/** Adiciona um tique para cores muito claras (ex: branco) */}
                                {colorHex === '#ffffff' && isSelected && (
                                  <svg className="w-5 h-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              {/* O Tooltip */}
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // --- RENDERIZAÇÃO DOS TAMANHOS ---
                if (attributeName.toLowerCase() === 'tamanho') {
                  const colorIsSelected = !!selectedAttributes['Cor'];
                  return (
                    <div key={attributeName}>
                      <h3 className="text-sm font-medium text-gray-900">Tamanho</h3>
                      <div className={`flex items-center space-x-3 mt-2`}>
                        {Array.from(attributesMap.get(attributeName)).map(([value, _meta]) => {
                          const available = isSizeAvailable(value);
                          const selected = selectedAttributes[attributeName] === value;

                          return (
                            <button
                              key={value}
                              onClick={() => handleAttributeSelect(attributeName, value)}
                              // Desabilita se a cor não foi escolhida OU se a combinação é indisponível
                              disabled={!colorIsSelected || !available}
                              className={`relative flex items-center justify-center rounded-md border
                                // Botão menor
                                py-2 px-4 text-sm font-medium uppercase
                                
                                // Estilo de Selecionado
                                ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'bg-white text-gray-900 border-gray-300'}
                                
                                // Estilos de indisponível/desabilitado
                                ${!available && colorIsSelected ? 'bg-gray-50 text-gray-400' : ''}
                                ${!colorIsSelected ? 'cursor-not-allowed opacity-50' : ''}
                                ${available && !selected ? 'hover:bg-gray-50' : ''}
                                ${!colorIsSelected || !available ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                              `}
                            >
                              {value}
                              {/* Traço cinza cruzado */}
                              {!available && colorIsSelected && (
                                <span 
                                  aria-hidden="true" 
                                  className="absolute w-full h-0.5 bg-gray-400 transform -rotate-45 scale-110"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {!colorIsSelected && (
                        <p className="mt-2 text-xs text-gray-500">Por favor, selecione uma cor primeiro.</p>
                      )}
                    </div>
                  );
                }

                // Fallback para outros atributos (se houver)
                return null;
              })}
            </div>

            {/* Botões de Ação */}
            <div className="mt-10 flex gap-3">
              <button onClick={addToCart} disabled={!selectedVariantId} className="flex-1 flex items-center justify-center rounded-md border px-8 py-3 text-base disabled:opacity-50">Adicionar ao carrinho</button>
              <button onClick={addToWishlist} className="flex-1 flex items-center justify-center rounded-md border px-8 py-3 text-base">Favoritar</button>
            </div>


            {/* Avaliações (Movidas para o final) */}
            <div className="mt-10">
              <h4 className="font-semibold">Avaliações</h4>
              {product.reviews?.length ? (
                <div className="space-y-3 mt-2">
                  {product.reviews.map((r)=> (
                    <div key={r.id} className="border p-3">
                      <div className="text-sm text-gray-600">{r.user?.firstName} • Nota {r.rating}</div>
                      <div>{r.comment}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">Ainda não há avaliações.</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;