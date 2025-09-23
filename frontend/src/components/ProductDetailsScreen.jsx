import React from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const ProductDetailsScreen = ({ 
  selectedProduct, 
  setCurrentScreen, 
  handlePickupClick 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => setCurrentScreen('search')}
          className="mb-6"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Busca
        </Button>

        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {selectedProduct?.photo_url ? (
                    <img src={selectedProduct.photo_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-24 h-24 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedProduct?.name}
                </h1>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Código do Item</h3>
                    <p className="text-xl text-blue-600 font-mono bg-blue-50 px-3 py-2 rounded">
                      {selectedProduct?.code}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Descrição</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProduct?.description || 'Descrição não disponível'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Estoque Disponível</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${
                        selectedProduct?.stock > 10 ? 'text-green-600' : 
                        selectedProduct?.stock > 0 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {selectedProduct?.stock} unidades
                      </span>
                      {selectedProduct?.stock === 0 && (
                        <span className="text-red-500 text-sm font-medium">
                          Produto indisponível
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={handlePickupClick}
                    className="w-full h-14 text-lg"
                    size="lg"
                    disabled={!selectedProduct?.stock || selectedProduct?.stock === 0}
                  >
                    <Package className="w-6 h-6 mr-2" />
                    {selectedProduct?.stock > 0 ? 'Retirar Item' : 'Item Indisponível'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(ProductDetailsScreen); 