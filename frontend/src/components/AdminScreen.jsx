import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import OfflineDataManager from './OfflineDataManager.jsx';

const AdminScreen = ({ handleFileUpload, loading, setCurrentScreen }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          onClick={() => setCurrentScreen('search')}
          className="mb-6"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Catálogo
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Administração do Sistema</CardTitle>
            <p className="text-gray-600">
              Faça upload do arquivo Excel para atualizar o catálogo
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload do Catálogo Excel</h3>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Selecione o arquivo Excel do catálogo</p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Escolher Arquivo
                  </label>
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Formato: Excel (.xlsx ou .xls)<br/>
                  Colunas obrigatórias: Nome, Descrição, Código do Item, Quantidade em Estoque
                </p>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Processando arquivo...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciador de Dados Offline */}
        <div className="mt-8">
          <OfflineDataManager />
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminScreen); 