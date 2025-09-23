import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
import pytz
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import pandas as pd
from openpyxl import load_workbook
from src.models.user import db
from src.models.product import Product, Pickup

catalog_bp = Blueprint('catalog', __name__)

# Configurações de email (você pode ajustar conforme necessário)
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email_user': 'pedro.reigon@gmail.com',  # Substitua pelo email real
    'email_password': 'jcla hinw irjv qxbp',  # Substitua pela senha real
    'warehouse_emails': ['']  # Emails de destino
}

# Mapeamento de Centro de Custo -> e-mail do gerente responsável
# Ajuste os endereços conforme a sua organização
COST_CENTER_MANAGERS = {
    'Texturizado': 'pedro.reigon@gmail.com',
    'Manutenção': 'gerente.manutencao@empresa.com',
    'Logística': 'gerente.logistica@empresa.com',
    'Float': 'gerente.float@empresa.com'
}

@catalog_bp.route('/upload-catalog', methods=['POST'])
def upload_catalog():
    """Upload e processamento do arquivo Excel do catálogo"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'Arquivo deve ser Excel (.xlsx ou .xls)'}), 400
        
        # Salvar arquivo temporariamente
        filename = secure_filename(file.filename)
        # Usar caminho temporário compatível com Windows
        import tempfile
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)
        
        # Ler Excel (dados e imagens)
        df = pd.read_excel(temp_path)

        # Mapear imagens embutidas por linha (Excel): salva arquivos em static/uploads
        images_by_row = {}
        try:
            wb = load_workbook(temp_path, data_only=False)  # data_only=False para preservar imagens
            ws = wb.active
            upload_dir = os.path.join(current_app.static_folder, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)

            # Usar fuso horário do Brasil (UTC-3)
            brazil_tz = pytz.timezone('America/Sao_Paulo')
            timestamp = datetime.now(brazil_tz).strftime('%Y%m%d%H%M%S%f')
            print(f"Procurando imagens na planilha...")
            
            # Tentar diferentes formas de acessar imagens
            images = []
            if hasattr(ws, '_images'):
                images = ws._images
                print(f"Encontradas {len(images)} imagens via _images")
            elif hasattr(ws, 'images'):
                images = ws.images
                print(f"Encontradas {len(images)} imagens via images")
            else:
                print("Nenhuma imagem encontrada na planilha")
            
            for idx, img in enumerate(images):
                try:
                    print(f"Processando imagem {idx + 1}...")
                    
                    # obter linha (1-based) do topo esquerdo da âncora
                    excel_row = None
                    if hasattr(img, 'anchor'):
                        anchor = img.anchor
                        if hasattr(anchor, '_from'):
                            excel_row = anchor._from.row + 1  # _from.row é 0-based
                        elif hasattr(anchor, 'row'):
                            excel_row = anchor.row + 1
                    elif hasattr(img, 'row'):
                        excel_row = img.row + 1
                    
                    print(f"Imagem {idx + 1} na linha Excel: {excel_row}")
                    
                    # definir extensão
                    ext = 'png'
                    if hasattr(img, 'mime'):
                        mime = img.mime
                        if 'jpeg' in mime or 'jpg' in mime:
                            ext = 'jpg'
                        elif 'png' in mime:
                            ext = 'png'
                        elif 'gif' in mime:
                            ext = 'gif'
                        elif 'bmp' in mime:
                            ext = 'bmp'
                    
                    filename = f"catalog_{timestamp}_{idx}.{ext}"
                    save_path = os.path.join(upload_dir, filename)

                    # bytes da imagem
                    data_bytes = None
                    if hasattr(img, '_data') and callable(getattr(img, '_data')):
                        data_bytes = img._data()
                    elif hasattr(img, 'data') and callable(getattr(img, 'data')):
                        data_bytes = img.data()
                    elif hasattr(img, 'ref'):
                        # Tentar acessar via referência
                        try:
                            data_bytes = img.ref
                        except:
                            pass
                    
                    # salvar se possível
                    if data_bytes:
                        with open(save_path, 'wb') as f:
                            f.write(data_bytes)
                        print(f"Imagem salva: {filename}")
                        if excel_row is not None:
                            images_by_row[excel_row] = f"uploads/{filename}"
                            print(f"Mapeada para linha {excel_row}: uploads/{filename}")
                    else:
                        print(f"Não foi possível obter dados da imagem {idx + 1}")
                        
                except Exception as img_err:
                    print(f"Falha ao extrair imagem {idx + 1}: {img_err}")
                    import traceback
                    traceback.print_exc()
                    
            print(f"Total de imagens mapeadas: {len(images_by_row)}")
            print(f"Imagens por linha: {images_by_row}")
                    
        except Exception as e:
            print(f"Erro ao ler imagens do Excel: {e}")
            import traceback
            traceback.print_exc()
        
        # Debug: mostrar colunas encontradas
        print(f"Colunas encontradas no arquivo: {list(df.columns)}")
        print(f"Primeiras linhas do arquivo: {df.head()}")
        
        # Verificar colunas necessárias
        required_columns = ['Nome', 'Descrição', 'Código do Item', 'Quantidade em Estoque']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            os.remove(temp_path)
            return jsonify({
                'error': f'Colunas obrigatórias não encontradas: {", ".join(missing_columns)}. Colunas encontradas: {list(df.columns)}'
            }), 400
        
        # Verificar se há coluna Foto
        has_photo_column = 'Foto' in df.columns
        print(f"Coluna 'Foto' encontrada: {has_photo_column}")
        if has_photo_column:
            photo_values = df['Foto'].dropna().tolist()
            print(f"Valores não-nulos na coluna Foto: {photo_values}")
        
        # Limpar tabela de produtos existentes
        Product.query.delete()
        
        # Inserir novos produtos
        products_added = 0
        for i, row in df.iterrows():
            try:
                # A linha de dados no Excel geralmente começa na linha 2 (1 = cabeçalho)
                excel_row = int(i) + 2
                image_rel_path = images_by_row.get(excel_row)
                
                print(f"Processando produto linha {excel_row}: {row['Nome']}")
                print(f"  - Imagem encontrada: {image_rel_path}")
                print(f"  - Coluna Foto existe: {'Foto' in df.columns}")
                if 'Foto' in df.columns:
                    print(f"  - Valor coluna Foto: {row['Foto']}")
                
                product = Product(
                    code=str(row['Código do Item']).strip(),
                    name=str(row['Nome']).strip(),
                    description=str(row['Descrição']).strip() if pd.notna(row['Descrição']) else '',
                    stock=int(row['Quantidade em Estoque']) if pd.notna(row['Quantidade em Estoque']) else 0,
                    # Prioriza imagem embutida; senão tenta URL na coluna Foto
                    photo_url=(image_rel_path if image_rel_path else (str(row['Foto']).strip() if ('Foto' in df.columns and pd.notna(row['Foto'])) else None))
                )
                print(f"  - photo_url final: {product.photo_url}")
                db.session.add(product)
                products_added += 1
            except Exception as e:
                print(f"Erro ao processar linha: {e}")
                continue
        
        db.session.commit()
        os.remove(temp_path)
        
        return jsonify({
            'message': f'Catálogo atualizado com sucesso! {products_added} produtos adicionados.',
            'products_count': products_added
        })
        
    except Exception as e:
        import traceback
        print(f"Erro detalhado no upload: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Erro ao processar arquivo: {str(e)}'}), 500

@catalog_bp.route('/products/search', methods=['GET'])
def search_products():
    """Buscar produtos por nome ou código"""
    try:
        query = request.args.get('q', '').strip()
        print(f"Busca recebida: '{query}' de {request.remote_addr}")
        
        if not query:
            print("Query vazia, retornando lista vazia")
            return jsonify({'products': []})
        
        # Buscar produtos que contenham o termo no nome ou código
        products = Product.query.filter(
            db.or_(
                Product.name.ilike(f'%{query}%'),
                Product.code.ilike(f'%{query}%')
            )
        ).limit(20).all()
        
        print(f"Encontrados {len(products)} produtos para '{query}'")
        
        return jsonify({
            'products': [product.to_dict() for product in products]
        })
        
    except Exception as e:
        print(f"Erro na busca: {str(e)}")
        return jsonify({'error': f'Erro na busca: {str(e)}'}), 500

@catalog_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Obter detalhes de um produto específico"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({'product': product.to_dict()})
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar produto: {str(e)}'}), 500

@catalog_bp.route('/pickups', methods=['POST'])
def create_pickup():
    """Criar uma nova solicitação de retirada (aceita multipart com fotos obrigatórias)."""
    try:
        # Detectar fonte dos dados (JSON ou Form)
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json() or {}
            uploaded_files = []
        else:
            data = {
                'product_id': request.form.get('product_id'),
                'quantity': request.form.get('quantity'),
                'cost_center': request.form.get('cost_center'),
                'operator_name': request.form.get('operator_name'),
            }
            uploaded_files = request.files.getlist('photos')

        # Validar campos obrigatórios
        required_fields = ['product_id', 'quantity', 'cost_center', 'operator_name']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Campos obrigatórios não preenchidos: {", ".join(missing_fields)}'}), 400

        # Exigir pelo menos 1 foto
        photos_list = []
        if request.content_type and 'application/json' in request.content_type:
            # Se vier JSON, ainda assim exigir URLs/base64 não é suportado; forçar multipart
            return jsonify({'error': 'Envie as fotos via multipart/form-data no campo "photos".'}), 400
        else:
            if not uploaded_files or len([f for f in uploaded_files if f and f.filename]) == 0:
                return jsonify({'error': 'Pelo menos uma foto é obrigatória.'}), 400

        # Validar centro de custo
        cost_center_value = data['cost_center']
        if cost_center_value not in COST_CENTER_MANAGERS:
            valid_list = ', '.join(COST_CENTER_MANAGERS.keys())
            return jsonify({'error': f'Centro de custo inválido. Use um dos valores: {valid_list}'}), 400

        # Verificar se o produto existe
        product = Product.query.get(int(data['product_id']))
        if not product:
            return jsonify({'error': 'Produto não encontrado'}), 404

        # Verificar estoque disponível
        if int(data['quantity']) > product.stock:
            return jsonify({'error': f'Quantidade solicitada ({data["quantity"]}) maior que estoque disponível ({product.stock})'}), 400

        # Salvar fotos em static/uploads
        saved_relative_paths = []
        upload_dir = os.path.join(current_app.static_folder, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        # Usar fuso horário do Brasil (UTC-3)
        brazil_tz = pytz.timezone('America/Sao_Paulo')
        timestamp = datetime.now(brazil_tz).strftime('%Y%m%d%H%M%S%f')
        for index, file in enumerate(uploaded_files):
            if not file or not file.filename:
                continue
            filename = secure_filename(file.filename)
            name, ext = os.path.splitext(filename)
            safe_name = f"pickup_{timestamp}_{index}{ext.lower()}"
            save_path = os.path.join(upload_dir, safe_name)
            file.save(save_path)
            # armazenar caminho relativo servível pelo Flask static
            saved_relative_paths.append(f"uploads/{safe_name}")

        if not saved_relative_paths:
            return jsonify({'error': 'Falha ao processar as fotos. Tente novamente.'}), 400

        # Criar registro de retirada
        pickup = Pickup(
            product_id=int(data['product_id']),
            quantity=int(data['quantity']),
            cost_center=cost_center_value,
            operator_name=data['operator_name'],
            photos=json.dumps(saved_relative_paths)
        )

        db.session.add(pickup)
        db.session.commit()

        # Enviar email de notificação (com anexos)
        try:
            send_pickup_notification(pickup)
        except Exception as email_error:
            print(f"Erro ao enviar email: {email_error}")

        return jsonify({'message': 'Solicitação de retirada criada com sucesso!', 'pickup': pickup.to_dict()})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar solicitação: {str(e)}'}), 500

@catalog_bp.route('/pickups', methods=['GET'])
def list_pickups():
    """Listar todas as solicitações de retirada"""
    try:
        pickups = Pickup.query.order_by(Pickup.created_at.desc()).all()
        return jsonify({
            'pickups': [pickup.to_dict() for pickup in pickups]
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar solicitações: {str(e)}'}), 500

def send_pickup_notification(pickup):
    """Enviar email de notificação para a equipe do almoxarifado"""
    try:
        # Criar mensagem de email
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG['email_user']
        # Destinatários: almoxarifado + gerente do centro de custo
        manager_email = COST_CENTER_MANAGERS.get(pickup.cost_center)
        recipients = list(EMAIL_CONFIG['warehouse_emails'])
        if manager_email:
            recipients.append(manager_email)
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = f'Nova Solicitação de Retirada - {pickup.product.name}'
        
        # Corpo do email
        body = f"""
        Nova solicitação de retirada registrada no sistema:
        
        PRODUTO:
        - Nome: {pickup.product.name}
        - Código: {pickup.product.code}
        - Descrição: {pickup.product.description}
        
        SOLICITAÇÃO:
        - Quantidade: {pickup.quantity} unidades
        - Centro de Custo: {pickup.cost_center}
        - Operador: {pickup.operator_name}
        - Data/Hora: {pickup.created_at.strftime('%d/%m/%Y às %H:%M')}
        
        ESTOQUE:
        - Disponível: {pickup.product.stock} unidades
        - Após retirada: {pickup.product.stock - pickup.quantity} unidades
        
        Esta é uma notificação automática do Sistema de Catálogo Interativo.
        """
        
        msg.attach(MIMEText(body, 'plain'))

        # Anexar fotos, se houver
        photo_paths = []
        try:
            if pickup.photos:
                photo_paths = json.loads(pickup.photos)
        except Exception:
            photo_paths = []

        for rel_path in photo_paths:
            abs_path = os.path.join(current_app.static_folder, rel_path.replace('uploads/', 'uploads'+os.sep))
            if os.path.exists(abs_path):
                try:
                    with open(abs_path, 'rb') as img_file:
                        img_data = img_file.read()
                        img = MIMEImage(img_data)
                        img.add_header('Content-Disposition', f'attachment; filename="{os.path.basename(abs_path)}"')
                        msg.attach(img)
                except Exception as attach_err:
                    print(f"Falha ao anexar imagem {abs_path}: {attach_err}")

        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['email_user'], EMAIL_CONFIG['email_password'])
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG['email_user'], recipients, text)
        server.quit()
        
        
        print("Email de notificação seria enviado:")
        print(body)
        
    except Exception as e:
        raise Exception(f"Erro ao enviar email: {str(e)}")

@catalog_bp.route('/stats', methods=['GET'])
def get_stats():
    """Obter estatísticas do sistema"""
    try:
        total_products = Product.query.count()
        total_pickups = Pickup.query.count()
        pending_pickups = Pickup.query.filter_by(status='pending').count()
        
        return jsonify({
            'total_products': total_products,
            'total_pickups': total_pickups,
            'pending_pickups': pending_pickups
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao obter estatísticas: {str(e)}'}), 500

