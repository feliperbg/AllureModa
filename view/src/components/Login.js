
import React, { useState, useContext } from 'react';
import apiClient from '../api/axiosConfig';
// import { AuthContext } from '../context/AuthContext'; // Exemplo de como usar um Contexto

const Login = () => {
  // Supondo que você tenha um AuthContext para gerenciar o estado de autenticação
  // const { setAuth } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // Se o login for bem-sucedido, o backend retorna os dados do usuário
      const userData = response.data;
      
      // --- Gerenciamento de Estado Global ---
      // Aqui você atualizaria seu estado global (Context, Redux, etc.)
      // Exemplo com um hipotético AuthContext:
      // setAuth({ user: userData, isAuthenticated: true });

      console.log('Login bem-sucedido!', userData);
      
      // Você pode redirecionar o usuário para a página principal ou um dashboard
      // window.location.href = '/dashboard';

    } catch (err) {
      setLoading(false);
      // O interceptador do Axios já pode ter logado o erro, mas aqui
      // definimos uma mensagem amigável para o usuário.
      if (err.response) {
        // Erro vindo da API (ex: 401 - Credenciais inválidas)
        setError(err.response.data.message || 'E-mail ou senha incorretos.');
      } else {
        // Erro de rede ou outro problema
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Entrar na sua conta</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
