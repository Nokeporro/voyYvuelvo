from pathlib import Path
import secrets
import base64

path = Path(__file__).resolve().parents[1] / 'voyYvuelvo' / '.env'
if path.exists():
    raise SystemExit(f'{path.name} ya existe; no se sobrescribió.')
with path.open('x', encoding='utf-8') as f:
    f.write(f'DB_ROOT_PASSWORD={secrets.token_hex(24)}\nDB_PASSWORD={secrets.token_hex(24)}\nJWT_SECRET_BASE64={base64.b64encode(secrets.token_bytes(32)).decode()}\nSQS_QUEUE_URL=\nAWS_REGION=us-east-1\n')
try:
    path.chmod(0o600)
except OSError:
    pass
print('Configuración local generada en voyYvuelvo/.env (no subir a GitHub).')
