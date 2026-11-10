#!/usr/bin/env python3
"""Window control on a WM-less Xvfb display, by (part of) the window title.

  xwin.py :99 list                    → JSON [{id, name, x, y, w, h}] (mapped, top-level)
  xwin.py :99 fill   "<title part>"   → move/resize to fill the screen
  xwin.py :99 raise  "<title part>"   → put on top
  xwin.py :99 center "<title part>"   → center on screen (keeps size)
  xwin.py :99 geom   "<title part>"   → JSON {id, name, x, y, w, h}
  xwin.py :99 move   "<title part>" X Y → move (e.g. off-screen to hide it)
  xwin.py :99 nudge  "<title part>"   → resize by 2 px and back: forces a full
                                         repaint (Electron leaves regions exposed
                                         by another window unpainted otherwise)

Xvfb has no window manager, so nothing honours maximize/fullscreen/raise
requests from apps; we configure the windows ourselves. When several windows
match, the largest one wins (Chromium and VS Code map small helper windows).
"""
import json
import sys
from Xlib import X, display

d = display.Display(sys.argv[1])
screen = d.screen()
SW, SH = screen.width_in_pixels, screen.height_in_pixels


NET_WM_NAME = d.intern_atom('_NET_WM_NAME')
UTF8 = d.intern_atom('UTF8_STRING')


def title(win):
    # Electron/GTK set the UTF-8 _NET_WM_NAME; plain X apps only WM_NAME.
    p = win.get_full_property(NET_WM_NAME, UTF8)
    if p and p.value:
        v = p.value
        return v.decode('utf-8', 'replace') if isinstance(v, bytes) else str(v)
    n = win.get_wm_name() or ''
    return n.decode('utf-8', 'replace') if isinstance(n, bytes) else n


def windows():
    out = []
    for win in screen.root.query_tree().children:
        a = win.get_attributes()
        if a.map_state != X.IsViewable or a.override_redirect:
            continue
        g = win.get_geometry()
        if g.width < 200 or g.height < 200:
            continue
        name = title(win)
        out.append((win, {'id': win.id, 'name': name, 'x': g.x, 'y': g.y, 'w': g.width, 'h': g.height}))
    return out


def find(part):
    hits = [(w, i) for w, i in windows() if part.lower() in i['name'].lower()]
    if not hits:
        sys.exit(f'no window matching {part!r}: ' + json.dumps([i['name'] for _, i in windows()]))
    return max(hits, key=lambda h: h[1]['w'] * h[1]['h'])


cmd = sys.argv[2]
if cmd == 'list':
    print(json.dumps([i for _, i in windows()]))
else:
    win, info = find(sys.argv[3])
    if cmd == 'fill':
        win.configure(x=0, y=0, width=SW, height=SH, border_width=0)
    elif cmd == 'raise':
        win.configure(stack_mode=X.Above)
    elif cmd == 'center':
        win.configure(x=(SW - info['w']) // 2, y=max(0, (SH - info['h']) // 2), stack_mode=X.Above)
    elif cmd == 'nudge':
        import time
        win.configure(width=info['w'] - 2)
        d.sync()
        time.sleep(0.15)
        win.configure(width=info['w'])
    elif cmd == 'move':
        win.configure(x=int(sys.argv[4]), y=int(sys.argv[5]))
    elif cmd != 'geom':
        sys.exit(f'unknown command {cmd}')
    d.sync()
    if cmd == 'geom':
        print(json.dumps(info))
