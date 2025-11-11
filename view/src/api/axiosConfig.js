
import axios from 'axios';

// Define a URL base da sua API backend.
// O ideal é que essa URL venha de uma variável de ambiente
// para diferenciar entre desenvolvimento e produção.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Cria uma instância do Axios com configurações pré-definidas
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  /**
   * withCredentials: true é a chave para fazer a autenticação baseada em cookies funcionar.
   * Isso instrui o Axios a enviar cookies (como o token JWT HttpOnly) em todas as
   * requisições para o backend. O backend, por sua vez, precisa estar configurado
   * com CORS para aceitar essas credenciais.
   */
  withCredentials: true,
});

// --- Interceptadores (Opcional, mas recomendado) ---

// Interceptador de Requisição:
// Pode ser usado para adicionar headers dinamicamente, logs, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Exemplo: logar cada requisição
    console.log(`Enviando requisição para: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de Resposta:
// Permite tratar erros de forma global.
apiClient.interceptors.response.use(
  (response) => {
    // Qualquer status code dentro do range 2xx causa o acionamento desta função
    return response;
  },
  (error) => {
    // Qualquer status code fora do range 2xx causa o acionamento desta função
    const { response } = error;

    // Exemplo: Tratar erros de autenticação (401) de forma centralizada
    if (response && response.status === 401) {
      // Aqui você poderia, por exemplo, deslogar o usuário e redirecioná-lo
      // para a página de login.
      console.error('Não autorizado! Redirecionando para o login...');
      // window.location.href = '/login';
    }
    
    // Exemplo: Tratar erros de permissão (403)
    if (response && response.status === 403) {
        console.error('Acesso negado!');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
