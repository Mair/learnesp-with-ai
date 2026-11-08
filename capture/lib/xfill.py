#!/usr/bin/env python3
"""Resize every mapped top-level window on DISPLAY to fill the screen.

Xvfb runs without a window manager, so nothing honours "maximize" or
"fullscreen"; we configure the window ourselves.
"""
import sys
from Xlib import X, display

d = display.Display(sys.argv[1] if len(sys.argv) > 1 else None)
screen = d.screen()
w, h = screen.width_in_pixels, screen.height_in_pixels
n = 0
for win in screen.root.query_tree().children:
    attrs = win.get_attributes()
    if attrs.map_state != X.IsViewable or attrs.override_redirect:
        continue
    geo = win.get_geometry()
    if geo.width < 200 or geo.height < 200:
        continue
    win.configure(x=0, y=0, width=w, height=h, border_width=0)
    n += 1
d.sync()
print(n)
