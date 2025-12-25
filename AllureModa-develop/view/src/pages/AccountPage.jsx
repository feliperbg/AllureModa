import React from 'react';
import api from '../api/axiosConfig';

const AccountPage = () => {
  const [form, setForm] = React.useState({ firstName:'', lastName:'', phone:'', cpf:'', birthDate:'' });
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      const birthDate = data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '';
      setForm({ firstName: data.firstName||'', lastName: data.lastName||'', phone: data.phone||'', cpf: data.cpf||'', birthDate });
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev=>({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    setMessage('');
    try {
      const dataToSend = { ...form };
      if (dataToSend.birthDate) {
        dataToSend.birthDate = new Date(dataToSend.birthDate).toISOString();
      }
      await api.put('/users/me', dataToSend);
      setMessage('Dados atualizados com sucesso');
    } catch (e) { setMessage('Falha ao atualizar dados'); }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Meus Dados</h1>
      {message && <div className="mb-4 p-3 border">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="firstName" value={form.firstName} onChange={onChange} placeholder="Nome" className="border p-2" />
        <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Sobrenome" className="border p-2" />
        <input name="phone" value={form.phone} onChange={onChange} placeholder="Telefone" className="border p-2" />
        <input name="cpf" value={form.cpf} onChange={onChange} placeholder="CPF" className="border p-2" />
        <input name="birthDate" type="date" value={form.birthDate} onChange={onChange} placeholder="Data de Nascimento" className="border p-2" />
      </div>
      <button onClick={onSave} className="mt-4 px-4 py-2 bg-black text-white">Salvar</button>
    </div>
  );
};

export default AccountPage;
