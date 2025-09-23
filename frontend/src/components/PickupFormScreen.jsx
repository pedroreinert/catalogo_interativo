import React from 'react';
import { ArrowLeft, Camera, Send } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const PickupFormScreen = ({ 
  selectedProduct, 
  pickupData, 
  setPickupData, 
  handleSubmitPickup, 
  loading, 
  setCurrentScreen 
}) => {
  const handleQuantityChange = (e) => {
    setPickupData({...pickupData, quantity: e.target.value});
  };

  const handleCostCenterChange = (value) => {
    setPickupData({...pickupData, costCenter: value});
  };

  const handleOperatorNameChange = (e) => {
    setPickupData({...pickupData, operatorName: e.target.value});
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPickupData({ ...pickupData, photos: files });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          onClick={() => setCurrentScreen('details')}
          className="mb-6"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Detalhes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Solicitar Retirada</CardTitle>
            <p className="text-gray-600">
              Preencha os dados para solicitar a retirada do item
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="quantity" className="text-lg">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Digite a quantidade"
                value={pickupData.quantity}
                onChange={handleQuantityChange}
                className="mt-2 h-12 text-lg"
                max={selectedProduct?.stock}
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Máximo disponível: {selectedProduct?.stock} unidades
              </p>
            </div>

            <div>
              <Label className="text-lg">Centro de Custo *</Label>
              <div className="mt-2">
                <Select value={pickupData.costCenter} onValueChange={handleCostCenterChange}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Selecione o centro de custo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Texturizado">Texturizado</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                    <SelectItem value="Float">Float</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="operatorName" className="text-lg">Nome do Operador *</Label>
              <Input
                id="operatorName"
                type="text"
                placeholder="Digite seu nome completo"
                value={pickupData.operatorName}
                onChange={handleOperatorNameChange}
                className="mt-2 h-12 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="photos" className="text-lg">Fotos do Produto *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-3">Selecione uma ou mais fotos (obrigatório)</p>
                <Input 
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="h-12 text-lg"
                />
                {pickupData.photos && pickupData.photos.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">{pickupData.photos.length} foto(s) selecionada(s)</p>
                )}
              </div>
            </div>

            <Button 
              onClick={handleSubmitPickup}
              className="w-full h-14 text-lg"
              size="lg"
              disabled={!pickupData.quantity || !pickupData.costCenter || !pickupData.operatorName || !pickupData.photos || pickupData.photos.length === 0 || loading}
            >
              <Send className="w-6 h-6 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(PickupFormScreen); 