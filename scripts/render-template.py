from pathlib import Path
from textwrap import indent
root = Path(__file__).resolve().parents[1]
plantilla = (root/'cloud/template.yaml').read_text()
placeholder = "          # Se sustituye por serverless/handler.py mediante provision.sh\n          def lambda_handler(event, context):\n              raise RuntimeError('Debe desplegarse usando scripts/provision.sh')"
assert plantilla.count(placeholder) == 1
print(plantilla.replace(placeholder, indent((root/'serverless/handler.py').read_text().rstrip(), '          ')), end='')
