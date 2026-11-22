"""Build the local and single-file previews using the public site's rendered shell."""
from base64 import b64encode
from pathlib import Path
from shutil import copyfile
from sys import argv

root = Path(__file__).resolve().parent
site = root.parents[1]
copyfile(site / 'app/[locale]/karacsonyi-utalvanyok/voucher.css', root / 'voucher-shop.css')
header, footer = (root / 'site-shell.html').read_text().split('\n<!-- FOOTER -->\n')
html = (root / 'preview.html').read_text().replace('<!-- SITE_HEADER -->', header).replace('<!-- SITE_FOOTER -->', footer)

html = html.replace('<!-- VOUCHER_EXAMPLES -->', (site / 'lib/vouchers/examples.json').read_text())

def data_url(filename, mime):
    return f'data:{mime};base64,' + b64encode((root / filename).read_bytes()).decode('ascii')

# The browser can load images and scripts from a local file but restricts fetch(file://…).
html = html.replace('href="teli-mese-a5.pdf"', 'href="' + data_url('teli-mese-a5.pdf', 'application/pdf') + '"')
(root / 'index.html').write_text(html, encoding='utf-8')
if len(argv) > 1:
    for css in ['site-chrome.css', 'voucher-shop.css', 'utalvany.css']:
        html = html.replace(f'<link rel="stylesheet" href="{css}">', '<style>' + (root / css).read_text() + '</style>')
    for filename, mime in {
        'site-logo.webp': 'image/webp', 'teli-mese-a5.webp': 'image/webp',
        'vendor/pdf-lib.min.js': 'text/javascript', 'vendor/fontkit.umd.min.js': 'text/javascript',
        'vendor/recipient-font.js': 'text/javascript', 'voucher.js': 'text/javascript', 'utalvany.js': 'text/javascript',
    }.items():
        html = html.replace(f'="{filename}"', '="' + data_url(filename, mime) + '"')
    for filename in ['pdf-lib-LICENSE.md', 'fontkit-LICENSE.txt', 'recipient-font-LICENSE.txt']:
        html = html.replace('</head>', '<script type="text/plain">' + (root / 'vendor' / filename).read_text() + '</script></head>')
    Path(argv[1]).write_text(html, encoding='utf-8')
