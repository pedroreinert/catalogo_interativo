import React from 'react';
import { Search, Package, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

const SearchScreen = ({ searchTerm, setSearchTerm, handleSearch, loading, searchResults, handleProductSelect, setCurrentScreen }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Catálogo Interativo</h1>
          <p className="text-xl text-gray-600">Sistema de Retirada - Almoxarifado</p>
        </div>

        <div className="space-y-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Digite o código ou nome do produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-lg h-14"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="h-14 px-8 text-lg w-full sm:w-auto"
                    disabled={loading}
                  >
                    <Search className="w-6 h-6 mr-2" />
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setCurrentScreen('admin')}
              variant="outline"
              className="h-14 px-8 text-lg w-full sm:w-auto"
            >
              <Upload className="w-5 h-5 mr-2" />
              Admin
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductSelect(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Código: {product.code}</p>
                  <p className="text-sm text-green-600 font-medium">
                    Estoque: {product.stock} unidades
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && searchTerm && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">Nenhum produto encontrado</p>
            <p className="text-gray-500">Tente buscar por outro termo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchScreen);

