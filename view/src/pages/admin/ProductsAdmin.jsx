import React from 'react';
import Select from 'react-select';
import api from '../../api/axiosConfig';
import { Plus, Trash2 } from 'lucide-react';

// Hook para estilos do react-select
const useSelectStyles = () => ({
  control: (provided) => ({
    ...provided,
    borderColor: '#D1D5DB', // border-gray-300
    borderRadius: '0.375rem', // rounded-md
    '&:hover': {
      borderColor: '#BFA181', // allure-gold
    },
    boxShadow: 'none',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#BFA181' : state.isFocused ? '#F7F3EF' : 'white',
    color: state.isSelected ? '#1A1A1A' : '#1A1A1A',
    '&:active': {
      backgroundColor: '#F7F3EF',
    },
  }),
});

function ProductsAdmin() {
  const [products, setProducts] = React.useState([]);
  const [attributeValues, setAttributeValues] = React.useState([]);
  const [brandOptions, setBrandOptions] = React.useState([]);
  const [categoryOptions, setCategoryOptions] = React.useState([]);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name:'', description:'', brandId:'', categoryId:'', basePrice:'', isPromotional:false, variants:[], images:[] });
  const [editing, setEditing] = React.useState(null);

  const selectStyles = useSelectStyles();

  const load = async function() {
    try {
      const [{ data: productsData }, { data: attributeValuesData }, { data: brandsData }, { data: categoriesData }] = await Promise.all([
        api.get('/products'),
        api.get('/attributes'),
        api.get('/brands'),
        api.get('/categories')
      ]);
      setProducts(productsData);
      setAttributeValues(attributeValuesData.map(attr => ({ value: attr.id, label: attr.value })));
      setBrandOptions(brandsData.map(b => ({ value: b.id, label: b.name })));
      setCategoryOptions(categoriesData.map(c => ({ value: c.id, label: c.name })));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar dados');
    }
  };

  React.useEffect(() => { load(); },[]);

  const onChange = (e) => { const {name,value} = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const addVariant = () => {
    setForm(prev => ({ ...prev, variants: [...prev.variants, { sku:'', price:'', stock:0, attributes:[] }] }));
  };

  const deleteProduct = async (id) => {
    // Adicionar confirmação
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/products/${id}`);
        load();
      } catch (err) { setError(err.response?.data?.message || 'Falha ao excluir produto'); }
    }
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        brandId: form.brandId ? Number(form.brandId) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        variants: form.variants.map(v => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock),
          attributes: v.attributes.map(a => ({ attributeValueId: a.value }))
        }))
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      cancelEdit(); // Limpa o formulário e reseta o estado
      load();
    } catch (err) { setError(err.response?.data?.message || 'Falha ao salvar produto'); }
  };

  const startEdit = (product) => {
    setEditing(product);
    setForm({
      ...product,
      brandId: product.brandId || (product.brand ? product.brand.id : ''),
      categoryId: product.categoryId || (product.category ? product.category.id : ''),
      basePrice: product.basePrice || '',
      variants: product.variants.map(v => ({
        ...v,
        attributes: v.attributes.map(a => ({ value: a.attributeValue.id, label: a.attributeValue.value }))
      })),
      images: product.images || [],
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name:'', description:'', brandId:'', categoryId:'', basePrice:'', isPromotional:false, variants:[], images:[] });
  };

  const handleVariantAttributeChange = (selectedOptions, variantIndex) => {
    const newVariants = [...form.variants];
    newVariants[variantIndex] = { ...newVariants[variantIndex], attributes: selectedOptions };
    setForm(prev => ({ ...prev, variants: newVariants }));
  };

  // Funções auxiliares para classes de botões
  const btnPrimary = "inline-flex items-center justify-center px-4 py-2 bg-allure-black text-white font-semibold rounded-md shadow-sm hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-allure-gold focus:ring-offset-2";
  const btnSecondary = "inline-flex items-center justify-center px-4 py-2 bg-white text-allure-black font-semibold border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-allure-gold focus:ring-offset-2";
  const btnDanger = "inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors";
  const inputClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-allure-gold focus:ring-allure-gold sm:text-sm";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-serif text-allure-black">Produtos</h1>
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}
      
      {/* Formulário de Criação/Edição */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-allure-black mb-4">
          {editing ? 'Editar produto' : 'Adicionar novo produto'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" value={form.name} onChange={onChange} placeholder="Nome do Produto" className={inputClass} />
          <input name="basePrice" value={form.basePrice} onChange={onChange} placeholder="Preço base (ex: 199.90)" className={inputClass} />
          <Select
            options={brandOptions}
            value={brandOptions.find(o => o.value === form.brandId) || null}
            onChange={opt => setForm(prev => ({ ...prev, brandId: opt ? opt.value : '' }))}
            placeholder="Marca"
            classNamePrefix="select"
            styles={selectStyles}
          />
          <Select
            options={categoryOptions}
            value={categoryOptions.find(o => o.value === form.categoryId) || null}
            onChange={opt => setForm(prev => ({ ...prev, categoryId: opt ? opt.value : '' }))}
            placeholder="Categoria"
            classNamePrefix="select"
            styles={selectStyles}
          />
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Descrição" className={`${inputClass} md:col-span-2`} rows="3" />
          <label className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={form.isPromotional} onChange={e => setForm(prev => ({...prev, isPromotional:e.target.checked}))} className="rounded text-allure-gold focus:ring-allure-gold" />
            <span>Produto em promoção</span>
          </label>
        </div>

        {/* Variantes */}
        <div className="mt-6">
          <h3 className="font-semibold text-allure-black mb-2">Variantes</h3>
          <div className="space-y-3">
            {form.variants.map((v,idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-3 border rounded-md">
                <input value={v.sku} onChange={e => {
                  const nv=[...form.variants]; nv[idx]={...nv[idx], sku:e.target.value}; setForm(prev => ({...prev, variants:nv}));
                }} placeholder="SKU" className={inputClass} />
                <input value={v.price} onChange={e => {
                  const nv=[...form.variants]; nv[idx]={...nv[idx], price:e.target.value}; setForm(prev => ({...prev, variants:nv}));
                }} placeholder="Preço (variante)" className={inputClass} />
                <input value={v.stock} onChange={e => {
                  const nv=[...form.variants]; nv[idx]={...nv[idx], stock:Number(e.target.value||0)}; setForm(prev => ({...prev, variants:nv}));
                }} placeholder="Estoque" className={inputClass} />
                <Select
                  isMulti
                  options={attributeValues}
                  value={v.attributes}
                  onChange={options => handleVariantAttributeChange(options, idx)}
                  placeholder="Atributos"
                  className="md:col-span-2"
                  styles={selectStyles}
                />
                <button onClick={() => {
                  const nv=[...form.variants]; nv.splice(idx,1); setForm(prev => ({...prev, variants:nv}));
                }} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addVariant} className={`${btnSecondary} mt-3`}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar variante
          </button>
        </div>

        {/* Imagens */}
        <div className="mt-6">
          <h3 className="font-semibold text-allure-black mb-2">Imagens</h3>
          <div className="space-y-3">
            {(form.images||[]).map((img,idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-3 border rounded-md">
                <input value={img.url||''} onChange={e => {
                  const ni=[...form.images]; ni[idx]={...ni[idx], url:e.target.value}; setForm(prev => ({...prev, images:ni}));
                }} placeholder="URL da imagem" className={`${inputClass} md:col-span-1`} />
                <input value={img.altText||''} onChange={e => {
                  const ni=[...form.images]; ni[idx]={...ni[idx], altText:e.target.value}; setForm(prev => ({...prev, images:ni}));
                }} placeholder="Alt text" className={`${inputClass} md:col-span-1`} />
                <button onClick={() => {
                  const ni=[...form.images]; ni.splice(idx,1); setForm(prev => ({...prev, images:ni}));
                }} className={`${btnDanger} md:col-span-1`}><Trash2 className="w-4 h-4" /> Remover</button>
              </div>
            ))}
          </div>
          <button onClick={() => setForm(prev => ({...prev, images:[...prev.images, { url:'', altText:'' }]}))} className={`${btnSecondary} mt-3`}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar imagem
          </button>
        </div>
        
        {/* Botões de Ação */}
        <div className="mt-6 flex gap-3">
          <button onClick={save} className={btnPrimary}>
            {editing ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
          {editing && <button onClick={cancelEdit} className={btnSecondary}>Cancelar</button>}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-allure-black mb-4">Lista de produtos ({products.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md">
              <div className="font-semibold text-allure-black">{p.name}</div>
              <div className="text-sm text-allure-grey">{p.category?.name}</div>
              <div className="text-sm font-bold text-allure-black mt-1">R$ {p.basePrice}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(p)} className="text-sm font-medium text-allure-black hover:underline">Editar</button>
                <button onClick={() => deleteProduct(p.id)} className="text-sm font-medium text-red-600 hover:underline">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;