from pathlib import Path
import json, re, shutil
from bs4 import BeautifulSoup

root = Path('.')
legacy = root / 'legacy'
legacy.mkdir(exist_ok=True)
for name in ['js', 'css', 'admin']:
    if not (legacy / name).exists():
        shutil.copytree(root / name, legacy / name)
for f in root.glob('*.html'):
    if not (legacy / f.name).exists(): shutil.copy2(f, legacy / f.name)
Path('public').mkdir(exist_ok=True)
shutil.copytree('img', 'public/img', dirs_exist_ok=True)
Path('src/data').mkdir(parents=True, exist_ok=True)
products = (root / 'js/productos-data.js').read_text(encoding='utf-8')
products = products[products.index('const productos ='):].replace('const productos =', 'export const initialProducts =', 1)
products = products.replace('"img/', '"/img/')
Path('src/data/products.js').write_text(products + ';\n', encoding='utf-8')
regions = (root / 'js/regiones-comunas.js').read_text(encoding='utf-8')
regions = regions[regions.index('window.REGIONES_COMUNAS ='):].replace('window.REGIONES_COMUNAS =', 'export const regions =', 1)
Path('src/data/regions.js').write_text(regions, encoding='utf-8')

# El contenido editorial se convierte en JSX; React controla toda la interfaz.
routes = {'index.html':'/', 'productos.html':'/productos', 'contacto.html':'/contacto', 'rutas.html':'/rutas', 'blogs.html':'/blogs', 'nosotros.html':'/nosotros', 'registro.html':'/registro', 'login.html':'/login', 'detalle-blog-1.html':'/blogs/1', 'detalle-blog-2.html':'/blogs/2'}
void = {'img','br','hr','input','meta','link','source','wbr'}
def jsx(n):
    if not getattr(n, 'name', None):
        from bs4 import Comment
        if isinstance(n, Comment): return ''
        return '{' + json.dumps(str(n), ensure_ascii=False) + '}' if str(n).strip() else ''
    if n.name == 'script': return ''
    attrs=[]
    for k,v in n.attrs.items():
        if k == 'style': continue
        if isinstance(v,list): v=' '.join(v)
        if k == 'href': v=routes.get(v,v)
        if k == 'src' and v.startswith('img/'): v='/' + v
        k={'class':'className','for':'htmlFor','tabindex':'tabIndex'}.get(k,k)
        attrs.append(k+'='+json.dumps(v, ensure_ascii=False))
    start='<'+n.name+(' '+' '.join(attrs) if attrs else '')
    return start+' />' if n.name in void else start+'>'+''.join(jsx(c) for c in n.children)+'</'+n.name+'>'
Path('src/pages').mkdir(parents=True, exist_ok=True)
for file, component in [('nosotros.html','About'),('blogs.html','Blog'),('detalle-blog-1.html','ArticleOne'),('detalle-blog-2.html','ArticleTwo')]:
    soup=BeautifulSoup((legacy/file).read_text(encoding='utf-8'),'html.parser')
    main=soup.find('main')
    main.name='div'
    Path(f'src/pages/{component}.jsx').write_text('export default function '+component+'() { return ('+jsx(main)+'); }\n',encoding='utf-8')

shell='''<!doctype html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="description" content="Voy & Vuelvo: rutas de trekking, turismo aventura y equipamiento en Chile." /><title>Voy & Vuelvo | Turismo aventura</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
'''
for f in [*root.glob('*.html'), *Path('admin').glob('*.html')]: f.write_text(shell,encoding='utf-8')
