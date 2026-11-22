"""Start the private Checkout sandbox and forward verified Stripe test events."""
import getpass
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import threading

root = Path(__file__).resolve().parent
env = os.environ.copy()
local = root / ".env.local"
if local.exists():
    for line in local.read_text().splitlines():
        name, _, value = line.partition("=")
        if name in ("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET") and value.strip():
            env.setdefault(name, value.strip())
key = env.get("STRIPE_SECRET_KEY") or getpass.getpass("Stripe szerveroldali tesztkulcs (rejtett bevitel): ")
if not key.startswith(("sk_test_", "rk_test_")):
    sys.exit("A helyi próba szerveroldali Stripe-tesztkulccsal indítható.")
env["STRIPE_SECRET_KEY"] = key
env["STRIPE_API_KEY"] = key
cli = shutil.which("stripe") or str(Path.home() / ".local/bin/stripe")
node = shutil.which("node")
if not node:
    runtimes = [
        Path.home() / "Desktop/ChatGPT.app/Contents/Resources/node",
        Path("/Applications/ChatGPT.app/Contents/Resources/node"),
    ]
    node = next((str(p) for p in runtimes if p.is_file()), None)
if not node:
    sys.exit("A tesztoldalhoz Node.js 24 vagy újabb szükséges.")
listener = subprocess.Popen([cli, "listen", "--color", "off", "--events",
    "checkout.session.completed,checkout.session.async_payment_succeeded,charge.refunded",
    "--forward-to", "http://127.0.0.1:8790/stripe/webhook"], env=env,
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
try:
    for line in listener.stdout:
        found = re.search(r"whsec_[A-Za-z0-9]+", line)
        if found:
            env["STRIPE_WEBHOOK_SECRET"] = found.group()
            break
    else:
        sys.exit("A Stripe eseménykapcsolat nem indult el. Ellenőrizze a tesztkulcs jogosultságát és a hálózatot.")
    def drain():
        for _ in listener.stdout:
            pass
    threading.Thread(target=drain, daemon=True).start()
    print("A Stripe tesztesemények továbbítása aktív.", flush=True)
    server = subprocess.Popen([node,"server.mjs"], cwd=root, env=env)
    try:
        sys.exit(server.wait())
    finally:
        server.terminate()
finally:
    listener.terminate()
