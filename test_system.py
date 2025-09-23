import requests
import time
import webbrowser

def test_system():
    print("🔍 Testando o Sistema de Catálogo Interativo...")
    print("=" * 50)
    
    # Teste 1: Backend
    print("\n1️⃣ Testando Backend (porta 5000)...")
    try:
        response = requests.get('http://localhost:5000/api/stats', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend funcionando!")
            print(f"   📊 Estatísticas: {data['total_products']} produtos, {data['total_pickups']} retiradas")
        else:
            print(f"❌ Backend retornou erro: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend não está rodando na porta 5000")
        print("   💡 Execute: cd backend && python src/main.py")
    except Exception as e:
        print(f"❌ Erro ao testar backend: {e}")
    
    # Teste 2: Frontend
    print("\n2️⃣ Testando Frontend (porta 5173)...")
    try:
        response = requests.get('http://localhost:5173', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend funcionando!")
        else:
            print(f"❌ Frontend retornou erro: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Frontend não está rodando na porta 5173")
        print("   💡 Execute: cd frontend && pnpm run dev")
    except Exception as e:
        print(f"❌ Erro ao testar frontend: {e}")
    
    # Teste 3: API de busca
    print("\n3️⃣ Testando API de busca...")
    try:
        response = requests.get('http://localhost:5000/api/products/search?q=teste', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API de busca funcionando!")
            print(f"   📦 Produtos encontrados: {len(data.get('products', []))}")
        else:
            print(f"❌ API de busca retornou erro: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro ao testar API de busca: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Resumo do Sistema:")
    
    # Verificar se ambos estão rodando
    backend_ok = False
    frontend_ok = False
    
    try:
        requests.get('http://localhost:5000/api/stats', timeout=2)
        backend_ok = True
    except:
        pass
    
    try:
        requests.get('http://localhost:5173', timeout=2)
        frontend_ok = True
    except:
        pass
    
    if backend_ok and frontend_ok:
        print("✅ Sistema completo funcionando!")
        print("🌐 Acesse: http://localhost:5173")
        print("📱 Pronto para uso em tablets!")
        
        # Perguntar se quer abrir no navegador
        try:
            open_browser = input("\n🚀 Abrir no navegador? (s/n): ").lower()
            if open_browser in ['s', 'sim', 'y', 'yes']:
                webbrowser.open('http://localhost:5173')
                print("🌐 Abrindo no navegador...")
        except:
            pass
    else:
        print("❌ Sistema incompleto:")
        if not backend_ok:
            print("   - Backend não está rodando")
        if not frontend_ok:
            print("   - Frontend não está rodando")
        print("\n🔧 Para iniciar o sistema:")
        print("   1. Terminal 1: cd backend && python src/main.py")
        print("   2. Terminal 2: cd frontend && pnpm run dev")

if __name__ == "__main__":
    test_system() 