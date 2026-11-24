"""Prueba real HTTP desde el frontend o Gateway; no requiere dependencias externas."""
import argparse
import datetime
import json
import secrets
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:5173/backend')
parser.add_argument('--e2e', action='store_true', help='Crea una cuenta, perfil y reserva de prueba')
args = parser.parse_args()
base = args.base.rstrip('/')

def llamar(method, path, status=(200,), data=None, token=None):
    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        headers['Content-Type'] = 'application/json'
    req = Request(base + path, data=body, headers=headers, method=method)
    try:
        with urlopen(req, timeout=15) as response:
            code, raw = response.status, response.read()
    except HTTPError as exc:
        code, raw = exc.code, exc.read()
    if code not in status:
        raise RuntimeError(f'{method} {path}: HTTP {code}, se esperaba {status}: {raw[:300]!r}')
    print(f'{method} {path} -> {code}', flush=True)
    try:
        return json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        return raw.decode(errors='replace')

# Los documentos OpenAPI verifican las rutas de todos los microservicios sin revelar datos.
for intento in range(30):
    try:
        for recurso in ('usuarios', 'rutas', 'equipamiento', 'reservas', 'pagos'):
            spec = llamar('GET', f'/api/{recurso}/v3/api-docs')
            assert isinstance(spec, dict) and 'openapi' in spec, 'No llegó OpenAPI'
        rutas = llamar('GET', '/api/rutas')
        llamar('GET', '/api/equipamiento')
        llamar('GET', '/api/reservas', (401,))
        break
    except (RuntimeError, URLError, AssertionError, TimeoutError):
        if intento == 29:
            raise
        time.sleep(5)

if args.e2e:
    identificador = secrets.token_hex(6)
    cuenta = {'username': 'ep3_' + identificador, 'password': secrets.token_urlsafe(18)}
    llamar('POST', '/auth/register', (201,), cuenta)
    token = llamar('POST', '/auth/login', (200,), cuenta)['token']
    llamar('GET', '/api/reservas', (403,), token=token)
    llamar('POST', '/auth/perfil', (201,), {'nombre':'Prueba EP3', 'email':f'ep3_{identificador}@example.com','telefono':'999999999'}, token)
    llamar('GET', '/auth/perfil', token=token)
    if isinstance(rutas, dict):
        listas = rutas.get('_embedded', {})
        rutas = next((v for v in listas.values() if isinstance(v, list)), [])
    ruta = next((x for x in rutas if x['cupoMaximo'] > 0), None)
    if not ruta:
        raise RuntimeError('No hay rutas con cupos; preparar datos de demostración.')
    payload = {'rutaId':ruta['id'], 'cantidadPersonas':1,'necesitaGuia':False,
               'fechaReserva':str(datetime.date.today()+datetime.timedelta(days=7)), 'equipamientos':[]}
    reserva = llamar('POST','/auth/reservas',(201,),payload,token)
    print('RESERVA_ID=' + str(reserva.get('id')), flush=True)
    if not reserva.get('id'):
        print('Respuesta de reserva:', json.dumps(reserva, ensure_ascii=False))
    assert reserva.get('id'), 'La reserva no devolvió identificador'
print('Prueba HTTP completada.')
