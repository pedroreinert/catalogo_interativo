import React, { useState } from 'react';
import { Upload, Download, Database } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import offlineStorage from '../services/offlineStorage.js';

const OfflineDataManager = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      // Ler arquivo Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new (await import('xlsx')).read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = new (await import('xlsx')).utils.sheet_to_json(worksheet);

      // Converter para formato do sistema
      const products = jsonData.map((row, index) => ({
        id: index + 1,
        code: String(row['Código do Item'] || '').trim(),
        name: String(row['Nome'] || '').trim(),
        description: String(row['Descrição'] || '').trim(),
        stock: parseInt(row['Quantidade em Estoque'] || 0),
        photo_url: String(row['Foto'] || '').trim() || null
      }));

      // Salvar no storage offline
      await offlineStorage.saveProducts(products);
      
      setMessage(`✅ ${products.length} produtos importados com sucesso!`);
      onDataLoaded && onDataLoaded();
      
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      setMessage(`❌ Erro ao importar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const products = await offlineStorage.getProducts();
      const pickups = await offlineStorage.getPickups();

      // Criar arquivo JSON com os dados
      const data = {
        products,
        pickups,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogo-offline-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage(`✅ Dados exportados: ${products.length} produtos, ${pickups.length} retiradas`);
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      setMessage(`❌ Erro ao exportar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Gerenciar Dados Offline
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Importe um catálogo Excel para usar o sistema offline, ou exporte os dados atuais.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Importar Catálogo Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileImport}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Arquivo deve ter colunas: Nome, Descrição, Código do Item, Quantidade em Estoque, Foto
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exportar Dados</label>
            <Button
              onClick={handleExportData}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
            <p className="text-xs text-gray-500">
              Exporta produtos e retiradas para backup
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Processando...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineDataManager;
