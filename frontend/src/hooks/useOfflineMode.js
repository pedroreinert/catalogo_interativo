import { useState, useEffect } from 'react';
import offlineStorage from '../services/offlineStorage';

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineData, setOfflineData] = useState({
    products: [],
    pickups: []
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineMode(false);
      // Tentar sincronizar quando voltar online
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Inicializar storage offline
    initOfflineStorage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initOfflineStorage = async () => {
    try {
      await offlineStorage.init();
      console.log('Storage offline inicializado');
    } catch (error) {
      console.error('Erro ao inicializar storage offline:', error);
    }
  };

  const loadOfflineData = async () => {
    try {
      const products = await offlineStorage.getProducts();
      const pickups = await offlineStorage.getPickups();
      
      setOfflineData({ products, pickups });
      console.log('Dados offline carregados:', { products: products.length, pickups: pickups.length });
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  };

  const syncWithServer = async (apiBase = 'https://reach-worldwide-phillips-pittsburgh.trycloudflare.com/api') => {
    try {
      const synced = await offlineStorage.syncWithServer(apiBase);
      if (synced) {
        await loadOfflineData();
        console.log('Sincronização concluída');
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  };

  const searchProductsOffline = async (query) => {
    try {
      const results = await offlineStorage.searchProducts(query);
      return results;
    } catch (error) {
      console.error('Erro na busca offline:', error);
      return [];
    }
  };

  const savePickupOffline = async (pickupData) => {
    try {
      const id = await offlineStorage.savePickup(pickupData);
      await loadOfflineData();
      return id;
    } catch (error) {
      console.error('Erro ao salvar retirada offline:', error);
      throw error;
    }
  };

  return {
    isOnline,
    isOfflineMode,
    offlineData,
    loadOfflineData,
    syncWithServer,
    searchProductsOffline,
    savePickupOffline
  };
};
