import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import './App.css';

import SearchScreen from './components/ui/SearchScreen.jsx';
import PickupFormScreen from './components/PickupFormScreen.jsx';
import ProductDetailsScreen from './components/ProductDetailsScreen.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import { useOfflineMode } from './hooks/useOfflineMode.js';

// Detectar ambiente e escolher a base da API
const getApiBase = () => {
  // Localhost (desktop)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Acesso via túnel Cloudflare (sempre usar HTTPS e a URL do túnel do backend)
  if (window.location.hostname.includes('trycloudflare.com')) {
    return 'https://reach-worldwide-phillips-pittsburgh.trycloudflare.com/api';
  }
  // Acesso por IP da rede local
  return `http://${window.location.hostname}:5000/api`;
};

const API_BASE = getApiBase();

function App() {
  const [currentScreen, setCurrentScreen] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickupData, setPickupData] = useState({
    quantity: '',
    costCenter: '',
    operatorName: '',
    photos: []
  });

  // Hook para modo offline
  const {
    isOnline,
    isOfflineMode,
    offlineData,
    loadOfflineData,
    syncWithServer,
    searchProductsOffline,
    savePickupOffline
  } = useOfflineMode();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      let results = [];
      
      if (isOfflineMode) {
        // Modo offline - buscar no storage local
        console.log('Buscando offline...');
        results = await searchProductsOffline(searchTerm);
      } else {
        // Modo online - buscar no servidor
        const searchUrl = `${API_BASE}/products/search?q=${encodeURIComponent(searchTerm)}`;
        console.log('Buscando online em:', searchUrl);
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        console.log('Resposta da busca:', { status: response.status, data });
        
        if (response.ok) {
          results = data.products || [];
        } else {
          console.error('Erro na busca:', data.error);
          // Fallback para modo offline
          results = await searchProductsOffline(searchTerm);
        }
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      // Fallback para modo offline
      try {
        const results = await searchProductsOffline(searchTerm);
        setSearchResults(results);
      } catch (offlineError) {
        console.error('Erro na busca offline:', offlineError);
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/${product.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedProduct(data.product);
        setCurrentScreen('details');
      } else {
        console.error('Erro ao buscar produto:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupClick = () => {
    setCurrentScreen('pickup');
  };

  const handleSubmitPickup = async () => {
    if (!pickupData.quantity || !pickupData.costCenter || !pickupData.operatorName) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!pickupData.photos || pickupData.photos.length === 0) {
      alert('Pelo menos uma foto é obrigatória.');
      return;
    }

    setLoading(true);
    try {
      if (isOfflineMode) {
        // Modo offline - salvar localmente
        console.log('Salvando retirada offline...');
        const pickupDataOffline = {
          productId: selectedProduct.id,
          product: selectedProduct,
          quantity: parseInt(pickupData.quantity),
          costCenter: pickupData.costCenter,
          operatorName: pickupData.operatorName,
          photos: pickupData.photos
        };
        
        await savePickupOffline(pickupDataOffline);
        alert('Retirada salva offline! Será sincronizada quando houver conexão.');
      } else {
        // Modo online - enviar para servidor
        const formData = new FormData();
        formData.append('product_id', String(selectedProduct.id));
        formData.append('quantity', String(parseInt(pickupData.quantity)));
        formData.append('cost_center', pickupData.costCenter);
        formData.append('operator_name', pickupData.operatorName);
        (pickupData.photos || []).forEach((file) => {
          formData.append('photos', file);
        });

        const response = await fetch(`${API_BASE}/pickups`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Solicitação de retirada enviada com sucesso!');
        } else {
          alert(`Erro: ${data.error}`);
          return;
        }
      }
      
      // Limpar formulário
      setCurrentScreen('search');
      setSelectedProduct(null);
      setPickupData({
        quantity: '',
        costCenter: '',
        operatorName: '',
        photos: []
      });
      setSearchTerm('');
      setSearchResults([]);
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/upload-catalog`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Catálogo atualizado com sucesso! ${data.products_count} produtos adicionados.`);
        setCurrentScreen('search');
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };







  return (
    <div className="font-sans">
      {/* Indicador de Status de Conexão */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Botão de Sincronização (quando offline) */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => syncWithServer()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Wifi className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
        </div>
      )}

      {currentScreen === 'search' && <SearchScreen 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        loading={loading}
        searchResults={searchResults}
        handleProductSelect={handleProductSelect}
        setCurrentScreen={setCurrentScreen}
      />}
             {currentScreen === 'details' && <ProductDetailsScreen 
         selectedProduct={selectedProduct}
         setCurrentScreen={setCurrentScreen}
         handlePickupClick={handlePickupClick}
       />}
             {currentScreen === 'pickup' && <PickupFormScreen 
         selectedProduct={selectedProduct}
         pickupData={pickupData}
         setPickupData={setPickupData}
         handleSubmitPickup={handleSubmitPickup}
         loading={loading}
         setCurrentScreen={setCurrentScreen}
       />}
      {currentScreen === 'admin' && <AdminScreen handleFileUpload={handleFileUpload} loading={loading} setCurrentScreen={setCurrentScreen} />}
    </div>
  );
}

export default App;


