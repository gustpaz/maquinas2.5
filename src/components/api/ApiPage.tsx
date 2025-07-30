import React, { useState } from 'react';
import ApiKeyForm from './ApiKeyForm';
import ApiKeyList from './ApiKeyList';
import { useToast } from '../../contexts/ToastContext';
import { Copy } from 'lucide-react';

const ApiPage: React.FC = () => {
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('success', 'Código copiado para a área de transferência!');
  };

  const handleKeyCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const exampleCode = `// Exemplo de uso da API
fetch('https://api.exemplo.com/machines', {
  headers: {
    'X-API-Key': 'sua-chave-aqui',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));`;

  const transactionCode = `// Registrar transação
fetch('https://api.exemplo.com/transactions', {
  method: 'POST',
  headers: {
    'X-API-Key': 'sua-chave-aqui',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    machineId: '123',
    type: 'revenue', // ou 'cost'
    amount: 100.50,
    description: 'Venda'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));`;

  return (
    <div className="space-y-6">
      {/* Seção de Chaves de API */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chaves de API</h2>
        <p className="text-gray-600 mb-6">
          Gere chaves de API para integrar seu sistema com nossa plataforma.
          Cada chave pode ter um nome personalizado e uma data de expiração opcional.
        </p>
        <ApiKeyForm onKeyCreated={handleKeyCreated} />
      </div>

      {/* Lista de Chaves */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Suas Chaves</h2>
        <ApiKeyList key={refreshKey} />
      </div>

      {/* Documentação da API */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Documentação da API</h2>
        
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium text-gray-800">Autenticação</h3>
          <p className="text-gray-600 mb-4">
            Para autenticar suas requisições, inclua sua chave de API no header
            <code className="bg-gray-100 px-2 py-1 rounded mx-2">X-API-Key</code>.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-6">Endpoints</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Listar Máquinas</h4>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => handleCopy(exampleCode)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  title="Copiar exemplo"
                >
                  <Copy size={20} />
                </button>
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {exampleCode}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Registrar Transação</h4>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => handleCopy(transactionCode)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  title="Copiar exemplo"
                >
                  <Copy size={20} />
                </button>
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {transactionCode}
                </pre>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-800 mt-6">Endpoints Disponíveis</h3>
          <table className="min-w-full mt-2">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Método</th>
                <th className="text-left py-2">Endpoint</th>
                <th className="text-left py-2">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">GET</span>
                </td>
                <td className="py-2"><code>/machines</code></td>
                <td className="py-2">Lista todas as máquinas</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">GET</span>
                </td>
                <td className="py-2"><code>/machines/:id</code></td>
                <td className="py-2">Retorna detalhes de uma máquina</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">POST</span>
                </td>
                <td className="py-2"><code>/transactions</code></td>
                <td className="py-2">Registra uma nova transação</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-lg font-medium text-gray-800 mt-6">Respostas</h3>
          <p className="text-gray-600">
            Todas as respostas são retornadas no formato JSON com a seguinte estrutura:
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg mt-2">
{`{
  "data": { ... },     // Dados da resposta
  "error": null,       // Mensagem de erro (se houver)
  "meta": {           // Metadados (paginação, etc)
    "page": 1,
    "perPage": 10,
    "total": 100
  }
}`}
          </pre>

          <h3 className="text-lg font-medium text-gray-800 mt-6">Códigos de Status</h3>
          <table className="min-w-full mt-2">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Código</th>
                <th className="text-left py-2">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">200</span>
                </td>
                <td className="py-2">Sucesso</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">400</span>
                </td>
                <td className="py-2">Requisição inválida</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">401</span>
                </td>
                <td className="py-2">Não autorizado</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">404</span>
                </td>
                <td className="py-2">Recurso não encontrado</td>
              </tr>
              <tr>
                <td className="py-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">500</span>
                </td>
                <td className="py-2">Erro interno do servidor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;