#!/usr/bin/env python3
# udevadm, minus serial ports a take shouldn't show. VS Code's ESP-IDF extension lists
# serial ports with `udevadm info -e`; this passes everything through except device
# blocks for /dev/ttyACM*, /dev/ttyUSB* and /dev/ttyS* not named in TAKE_SERIAL_PORTS
# (space-separated), so the port picker shows the learner's one board.
import os, re, subprocess, sys

args = sys.argv[1:]
p = subprocess.run(['/usr/bin/udevadm', *args], capture_output=True, text=True)
if args[:2] != ['info', '-e'] and args[:2] != ['info', '--export-db']:
    sys.stdout.write(p.stdout); sys.stderr.write(p.stderr); sys.exit(p.returncode)
keep = set(os.environ.get('TAKE_SERIAL_PORTS', '').split())
tty = re.compile(r'^E: DEVNAME=(/dev/tty(?:ACM|USB|S)\d+)$', re.M)
out = []
for block in p.stdout.split('\n\n'):
    m = tty.search(block)
    if m and m.group(1) not in keep:
        continue
    out.append(block)
sys.stdout.write('\n\n'.join(out)); sys.stderr.write(p.stderr); sys.exit(p.returncode)
