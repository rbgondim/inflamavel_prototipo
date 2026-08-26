#!/usr/bin/env python3
"""Servidor de desenvolvimento do site da Inflamável.

Existe por um motivo só: `python3 -m http.server` não manda cabeçalho
Cache-Control. Sem ele o navegador cacheia CSS e JS por heurística própria, e
você edita um arquivo, recarrega a página e continua vendo a versão antiga —
sem nenhum aviso de que está olhando para algo velho.

Este aqui manda no-store em tudo, então cada reload busca os arquivos de novo.

    python3 dev-server.py          # porta 4322
    python3 dev-server.py 8080     # outra porta

Em produção quem manda é o vercel.json, não este arquivo.
"""
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

RAIZ = Path(__file__).parent.resolve()
PORTA_PADRAO = 4322


class SemCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_head(self):
        # Com no-store o navegador não deveria mandar requisição condicional,
        # mas se mandar, o handler padrão responderia 304 e a página ficaria com
        # o arquivo velho. Descartar esses cabeçalhos garante 200 sempre.
        del self.headers['If-Modified-Since']
        del self.headers['If-None-Match']
        return super().send_head()


def main():
    porta = PORTA_PADRAO
    if len(sys.argv) > 1:
        try:
            porta = int(sys.argv[1])
        except ValueError:
            print('Porta inválida: %s' % sys.argv[1])
            return 1

    handler = partial(SemCache, directory=str(RAIZ))
    try:
        servidor = HTTPServer(('127.0.0.1', porta), handler)
    except OSError as e:
        print('Não consegui subir na porta %d: %s' % (porta, e))
        print('Tente outra: python3 dev-server.py %d' % (porta + 1))
        return 1

    print('Inflamável → http://localhost:%d   (sem cache)' % porta)
    print('Ctrl+C para parar.')
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print('\nParado.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
