import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Auth = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    city: '',
    state: '',
    addressLine2: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const v = name === 'phone' ? maskPhone(value) : name === 'cpf' ? maskCpf(value) : name === 'cep' ? maskCep(value) : value;
    setFormData(prev => ({ ...prev, [name]: v }));
    setError('');
  };

  const maskPhone = (v) => {
    const d = (v || '').replace(/\D/g, '');
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
  };

  const maskCpf = (v) => {
    const d = (v||'').replace(/\D/g,'').slice(0,11);
    const p1 = d.slice(0,3);
    const p2 = d.slice(3,6);
    const p3 = d.slice(6,9);
    const p4 = d.slice(9,11);
    let out = '';
    if (p1) out = p1;
    if (p2) out = `${out}.${p2}`;
    if (p3) out = `${out}.${p3}`;
    if (p4) out = `${out}-${p4}`;
    return out;
  };

  const maskCep = (v) => {
    const d = (v||'').replace(/\D/g,'').slice(0,8);
    const p1 = d.slice(0,5);
    const p2 = d.slice(5,8);
    return p2 ? `${p1}-${p2}` : p1;
  };

  React.useEffect(() => {
    const d = formData.cep.replace(/\D/g,'');
    if (!isLogin && d.length === 8) {
      fetch(`https://viacep.com.br/ws/${d}/json/`).then(r=>r.json()).then((data)=>{
        if (!data.erro) {
          setFormData(prev=>({
            ...prev,
            street: data.logradouro || prev.street,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      }).catch(()=>{});
    }
  }, [formData.cep, isLogin]);

  // Validação básica
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios.');
      return false;
    }
    if (!isLogin && (!formData.firstName || !formData.lastName)) {
      setError('Nome e sobrenome são obrigatórios.');
      return false;
    }
    if (!isLogin && formData.phone && formData.phone.replace(/\D/g,'').length < 10) {
      setError('Telefone inválido.');
      return false;
    }
    if (!isLogin && formData.cpf && formData.cpf.replace(/\D/g,'').length !== 11) {
      setError('CPF inválido.');
      return false;
    }
    if (!isLogin && (!formData.cep || !formData.street || !formData.city || !formData.state)) {
      setError('Endereço incompleto.');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }
    return true;
  };

  // Registrar
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.replace(/\D/g,'') || undefined,
        cpf: formData.cpf.replace(/\D/g,''),
        address: {
          postalCode: formData.cep.replace(/\D/g,''),
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: 'Brazil',
          addressLine2: formData.addressLine2 || undefined,
        },
      });

      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      setError('');
      setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', cpf: '', cep: '', street: '', city: '', state: '', addressLine2: '' });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Armazenar dados do usuário no contexto
      setAuth({
        user: response.data.user || response.data,
        isAuthenticated: true,
      });

      const getCookie = (name) => {
        const m = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')) : null;
        return m ? m[1] : '';
      };
      const delCookie = (name) => { if (typeof document !== 'undefined') document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; };
      const decodeCartCookie = (v) => { try { return JSON.parse(decodeURIComponent(atob(v))); } catch { return []; } };
      const raw = getCookie('local_cart');
      if (raw) {
        const arr = decodeCartCookie(raw);
        for (let i = 0; i < arr.length; i++) {
          const it = arr[i];
          try { await api.put('/cart', { productVariantId: it.productVariantId, quantity: Number(it.quantity || 1) }); } catch {}
        }
        delCookie('local_cart');
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart-updated'));
      }

      setSuccess('Login realizado com sucesso!');
      setError('');
      setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', cpf: '', cep: '', street: '', city: '', state: '', addressLine2: '' });

      // Redirecionar para home após 1.5 segundos
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou senha incorretos.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    isLogin ? handleLogin(e) : handleRegister(e);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Entrar' : 'Registrar'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Acesse sua conta AllureModa' : 'Crie sua conta AllureModa'}
          </p>
        </div>

        {/* Mensagens de erro e sucesso */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" placeholder="Seu nome" />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" placeholder="Seu sobrenome" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" placeholder="(99) 99999-9999" />
              </div>
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                <input id="cpf" name="cpf" type="text" value={formData.cpf} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                <input id="cep" name="cep" type="text" value={formData.cep} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" placeholder="00000-000" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua</label>
                <input id="street" name="street" type="text" value={formData.street} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label>
                <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Complemento</label>
                <input id="addressLine2" name="addressLine2" type="text" value={formData.addressLine2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                placeholder="seu@email.com"
                autoComplete={isLogin ? 'email' : 'email'}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                placeholder="Mínimo 6 caracteres"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha (apenas registro) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                  placeholder="Confirme a senha"
                />
              </div>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-allure-gold text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 cursor-disabled"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        {/* Toggle entre Login e Register */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Não tem conta?' : 'Já tem uma conta?'}
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', cpf: '', cep: '', street: '', city: '', state: '', addressLine2: '' });
              }}
              className="text-allure-gold font-semibold hover:underline"
            >
              {isLogin ? 'Registre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
