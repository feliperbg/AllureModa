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
    fullName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Validação básica
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios.');
      return false;
    }
    if (!isLogin && !formData.fullName) {
      setError('Nome completo é obrigatório.');
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
        fullName: formData.fullName,
      });

      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      setError('');
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });

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

      setSuccess('Login realizado com sucesso!');
      setError('');
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });

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
          {/* Nome Completo (apenas registro) */}
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                  placeholder="Seu nome completo"
                />
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
                setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
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