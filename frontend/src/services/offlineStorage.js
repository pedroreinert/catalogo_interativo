// Serviço para armazenamento offline usando IndexedDB
class OfflineStorage {
  constructor() {
    this.dbName = 'CatalogoInterativo';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store para produtos
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('code', 'code', { unique: true });
        }
        
        // Store para retiradas
        if (!db.objectStoreNames.contains('pickups')) {
          const pickupStore = db.createObjectStore('pickups', { keyPath: 'id', autoIncrement: true });
          pickupStore.createIndex('productId', 'productId', { unique: false });
          pickupStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // Store para configurações
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Produtos
  async saveProducts(products) {
    const transaction = this.db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    
    // Limpar produtos existentes
    await store.clear();
    
    // Salvar novos produtos
    for (const product of products) {
      await store.add(product);
    }
  }

  async getProducts() {
    const transaction = this.db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchProducts(query) {
    const products = await this.getProducts();
    if (!query.trim()) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.code.toLowerCase().includes(lowerQuery)
    );
  }

  // Retiradas
  async savePickup(pickup) {
    const transaction = this.db.transaction(['pickups'], 'readwrite');
    const store = transaction.objectStore('pickups');
    
    const pickupData = {
      ...pickup,
      createdAt: new Date().toISOString(),
      status: 'pending_offline'
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(pickupData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPickups() {
    const transaction = this.db.transaction(['pickups'], 'readonly');
    const store = transaction.objectStore('pickups');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Configurações
  async saveSetting(key, value) {
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.put({ key, value });
  }

  async getSetting(key, defaultValue = null) {
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value || defaultValue);
      request.onerror = () => reject(request.error);
    });
  }

  // Sincronização
  async syncWithServer(apiBase) {
    try {
      // Verificar se há internet
      const response = await fetch(`${apiBase}/stats`);
      if (!response.ok) throw new Error('Sem conexão');
      
      // Buscar produtos do servidor
      const productsResponse = await fetch(`${apiBase}/products/search?q=`);
      const productsData = await productsResponse.json();
      
      if (productsData.products) {
        await this.saveProducts(productsData.products);
        console.log('Produtos sincronizados:', productsData.products.length);
      }
      
      // Enviar retiradas pendentes
      const pendingPickups = await this.getPickups();
      const offlinePickups = pendingPickups.filter(p => p.status === 'pending_offline');
      
      for (const pickup of offlinePickups) {
        try {
          const formData = new FormData();
          formData.append('product_id', pickup.productId);
          formData.append('quantity', pickup.quantity);
          formData.append('cost_center', pickup.costCenter);
          formData.append('operator_name', pickup.operatorName);
          
          // Adicionar fotos se existirem
          if (pickup.photos && pickup.photos.length > 0) {
            for (const photo of pickup.photos) {
              formData.append('photos', photo);
            }
          }
          
          const response = await fetch(`${apiBase}/pickups`, {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            // Marcar como sincronizado
            pickup.status = 'synced';
            await this.updatePickup(pickup);
          }
        } catch (error) {
          console.error('Erro ao sincronizar retirada:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.log('Modo offline ativo:', error.message);
      return false;
    }
  }

  async updatePickup(pickup) {
    const transaction = this.db.transaction(['pickups'], 'readwrite');
    const store = transaction.objectStore('pickups');
    await store.put(pickup);
  }
}

export default new OfflineStorage();
