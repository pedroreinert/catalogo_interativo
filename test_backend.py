import requests
import time

def test_backend():
    print("Testando conexão com o backend...")
    
    try:
        # Aguardar um pouco para o servidor inicializar
        time.sleep(2)
        
        # Testar a rota de estatísticas
        response = requests.get('http://localhost:5000/api/stats', timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
        
        if response.status_code == 200:
            print("✅ Backend está funcionando corretamente!")
        else:
            print("❌ Backend retornou erro")
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao backend na porta 5000")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_backend() 