import React from 'react';
import Select from 'react-select';
import api from '../../api/axiosConfig';

function ProductsAdmin() {
  const [products, setProducts] = React.useState([]);
  const [attributeValues, setAttributeValues] = React.useState([]);
  const [brandOptions, setBrandOptions] = React.useState([]);
  const [categoryOptions, setCategoryOptions] = React.useState([]);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name:'', description:'', brandId:'', categoryId:'', basePrice:'', isPromotional:false, variants:[], images:[] });
  const [editing, setEditing] = React.useState(null);

  const load = async function() {
    try {
      const [{ data: productsData }, { data: attributeValuesData }, { data: brandsData }, { data: categoriesData }] = await Promise.all([
        api.get('/products'),
        api.get('/attributes'),
        api.get('/brands'),
        api.get('/categories')
      ]);
      setProducts(productsData);
      setAttributeValues(attributeValuesData.map(function(attr) { return { value: attr.id, label: attr.value }; }));
      setBrandOptions(brandsData.map(function(b) { return { value: b.id, label: b.name }; }));
      setCategoryOptions(categoriesData.map(function(c) { return { value: c.id, label: c.name }; }));
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar dados');
    }
  };

  React.useEffect(function() { load(); },[]);

  const onChange = function(e) { const {name,value} = e.target; setForm(function(prev) { return { ...prev, [name]: value }; }); };

  const addVariant = function() {
    setForm(function(prev) { return { ...prev, variants: [...prev.variants, { sku:'', price:'', stock:0, attributes:[] }] }; });
  };

  const deleteProduct = async function(id) {
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Falha ao excluir produto'); }
  };

  const save = async function() {
    try {
      const payload = {
        ...form,
        brandId: form.brandId ? Number(form.brandId) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        variants: form.variants.map(function(v) {
          return {
            ...v,
            attributes: v.attributes.map(function(a) { return { attributeValueId: a.value }; })
          };
        })
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm({ name:'', description:'', brandId:'', categoryId:'', basePrice:'', isPromotional:false, variants:[], images:[] });
      setEditing(null);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Falha ao salvar produto'); }
  };

  const startEdit = function(product) {
    setEditing(product);
    setForm({
      ...product,
      brandId: product.brandId || (product.brand ? product.brand.id : ''),
      categoryId: product.categoryId || (product.category ? product.category.id : ''),
      variants: product.variants.map(function(v) {
        return {
          ...v,
          attributes: v.attributes.map(function(a) { return { value: a.attributeValue.id, label: a.attributeValue.value }; })
        };
      })
    });
  };

  const cancelEdit = function() {
    setEditing(null);
    setForm({ name:'', description:'', brandId:'', categoryId:'', basePrice:'', isPromotional:false, variants:[], images:[] });
  };

  const handleVariantAttributeChange = function(selectedOptions, variantIndex) {
    const newVariants = [...form.variants];
    newVariants[variantIndex] = { ...newVariants[variantIndex], attributes: selectedOptions };
    setForm(function(prev) { return { ...prev, variants: newVariants }; });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Produtos</h1>
      {error && <div className="mb-4 p-3 border">{error}</div>}
      <div className="border p-4 mb-6">
        <h2 className="font-semibold mb-2">{editing ? 'Editar produto' : 'Criar produto'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" value={form.name} onChange={onChange} placeholder="Nome" className="border p-2" />
          <input name="basePrice" value={form.basePrice} onChange={onChange} placeholder="Preço base" className="border p-2" />
          <Select
            options={brandOptions}
            value={brandOptions.find(function(o){ return o.value === form.brandId; }) || null}
            onChange={function(opt){ setForm(function(prev){ return { ...prev, brandId: opt ? opt.value : '' }; }); }}
            placeholder="Marca"
            classNamePrefix="select"
          />
          <Select
            options={categoryOptions}
            value={categoryOptions.find(function(o){ return o.value === form.categoryId; }) || null}
            onChange={function(opt){ setForm(function(prev){ return { ...prev, categoryId: opt ? opt.value : '' }; }); }}
            placeholder="Categoria"
            classNamePrefix="select"
          />
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Descrição" className="border p-2 sm:col-span-2" />
          <label className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={form.isPromotional} onChange={function(e){setForm(function(prev){return {...prev, isPromotional:e.target.checked}})}} />
            <span>Produto em promoção</span>
          </label>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold mb-2">Variantes</h3>
          <button onClick={addVariant} className="border px-3 py-2">Adicionar variante</button>
          <div className="space-y-3 mt-3">
            {form.variants.map(function(v,idx){
              return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <input value={v.sku} onChange={function(e){
                  const nv=[...form.variants]; nv[idx]={...nv[idx], sku:e.target.value}; setForm(function(prev){return {...prev, variants:nv}});
                }} placeholder="SKU" className="border p-2" />
                <input value={v.price} onChange={function(e){
                  const nv=[...form.variants]; nv[idx]={...nv[idx], price:e.target.value}; setForm(function(prev){return {...prev, variants:nv}});
                }} placeholder="Preço" className="border p-2" />
                <input value={v.stock} onChange={function(e){
                  const nv=[...form.variants]; nv[idx]={...nv[idx], stock:Number(e.target.value||0)}; setForm(function(prev){return {...prev, variants:nv}});
                }} placeholder="Estoque" className="border p-2" />
                <Select
                  isMulti
                  options={attributeValues}
                  value={v.attributes}
                  onChange={function(options) { return handleVariantAttributeChange(options, idx);}}
                  placeholder="Selecione atributos"
                  className="md:col-span-1"
                />
                <button onClick={function(){
                  const nv=[...form.variants]; nv.splice(idx,1); setForm(function(prev){return {...prev, variants:nv}});
                }} className="border px-2 py-1 text-sm">Remover</button>
              </div>
            )})}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold mb-2">Imagens</h3>
          <div className="space-y-3">
            {(form.images||[]).map(function(img,idx){
              return (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <input value={img.url||''} onChange={function(e){
                  const ni=[...form.images]; ni[idx]={...ni[idx], url:e.target.value}; setForm(function(prev){return {...prev, images:ni}});
                }} placeholder="URL da imagem" className="border p-2" />
                <input value={img.altText||''} onChange={function(e){
                  const ni=[...form.images]; ni[idx]={...ni[idx], altText:e.target.value}; setForm(function(prev){return {...prev, images:ni}});
                }} placeholder="Alt text" className="border p-2" />
                <button onClick={function(){
                  const ni=[...form.images]; ni.splice(idx,1); setForm(function(prev){return {...prev, images:ni}});
                }} className="border px-2 py-1 text-sm">Remover</button>
              </div>
            )})}
            <button onClick={function(){setForm(function(prev){return {...prev, images:[...prev.images, { url:'', altText:'' }]}})}} className="border px-3 py-2">Adicionar imagem</button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-black text-white">{editing ? 'Salvar alterações' : 'Criar produto'}</button>
          {editing && <button onClick={cancelEdit} className="px-4 py-2 border">Cancelar</button>}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Lista de produtos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(function(p) {
            return (
            <div key={p.id} className="border p-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.category?.name}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={function() { return startEdit(p); }} className="text-sm border px-2 py-1">Editar</button>
                <button onClick={function() { return deleteProduct(p.id); }} className="text-sm border px-2 py-1">Excluir</button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;