# install-esp-idf: storyboard

**Narration** follows `SCRIPT.md` "Sound like a teacher, not a list" (whole sentences, signposts, transitions); the exact lines are in `timeline.ts` `VO`, and the table below gives the beats.

**Goal:** a beginner installs VS Code, the ESP-IDF extension and ESP-IDF, and checks it works,
following along click by click. Demonstrated on this Linux (Fedora) machine; Windows/Mac
differences only where they really differ. Every claim → `FACTS.md`.

**Take:** one continuous recording (`capture/takes/install-esp-idf.ts`): the distrobox
Playwright Chromium (web pages) and a fresh VS Code (no extensions, home = `/home/learner`,
no ESP-IDF, no `eim` on PATH) on one 4K Xvfb screen; EIM's window is driven through its
WebKit inspector. The real ESP-IDF install (~14 min) is one sped-up beat.

On screen throughout: a **step pill** (top left, "Step 2 of 7 · The ESP-IDF extension").
Mac shortcuts as callouts; commands for Linux/Mac as **command cards** (big mono text).

| # | Beat | Take events | VO (text) | Visual |
|---|---|---|---|---|
| 0 | intro | `begin` → `vsc-page` | i1 Before you can program an ESP32, you need three things on your computer. / i2 VS Code, the ESP-IDF extension, and ESP-IDF itself. / i3 I'm on Linux. Where Windows or a Mac is different, I'll tell you. | card: the three things |
| 1 | vscode | `vsc-page` → `vscode-window` | v1 Step one: get VS Code from code.visualstudio.com/download. / v2 On Windows, run the installer you download. / v3 On a Mac, open the download and drag VS Code into Applications. / v4 On Linux, take the .deb for Ubuntu or Debian, or the .rpm for Fedora. / v5 Skip the Snap version: it can't open the installer window you'll need later. | URL bar spot + callout; spot each OS card |
| 1b | open | `vscode-window` | v6 Open VS Code, and open an empty folder for your projects. Mine is called esp32. | VS Code, folder name |
| 2 | ext | `ext-open` → `ext-done` | e1 Step two: the ESP-IDF extension. Press Ctrl+Shift+X to open Extensions. / e2 Search for ESP-IDF, and pick the one from Espressif Systems. / e3 Click Install. / e4 VS Code asks if you trust the publisher. Click Trust Publisher and Install. / e5 When it's done, the Espressif icon appears on the left. | callout "Mac: ⇧⌘X"; spot row, button, dialog, icon |
| 3 | prereq | `pre-page` → `pre-linux` | p1 Step three: a few tools ESP-IDF needs, listed on this page. / p2 On Windows, skip this step. The installer adds anything that's missing. / p3 On a Mac, install Homebrew from brew.sh, then run this one command. / p4 On Ubuntu or Debian, this command installs everything. / p5 On other Linux systems, install the packages listed here. / p6 This machine already has them. | URL callout; Windows section; cards: brew, apt; Linux list |
| 4 | eim | `palette` → `eim-done` | s1 Step four: install ESP-IDF itself. Press Ctrl+Shift+P to open the command palette, and run ESP-IDF: Open ESP-IDF Installation Manager. / s2 The folder is still empty, so VS Code asks to turn the extension on anyway. Click Activate Anyway. / s3 The extension starts up and opens its guide. Run the same command again. / s4 Now it asks where to download the installer from. Pick GitHub. / s5 A moment later, the ESP-IDF Installation Manager opens. Click Start Installation. / s6 Then Start Easy Installation. First, it checks that your system has what it needs. / s7 Leave the version on the newest, v6.1. This course needs version 6 or later. / s8 It installs into a folder in your home folder, and takes 10 to 45 minutes. / s9 Click Start Installation. / s10 It downloads about 2.35 gigabytes and unpacks it. On Windows, if it asks to install Git or Python, say yes. / s11 Installation complete. You can close the installer. | callout "Mac: ⇧⌘P"; spots on each button; ×N badge on the wait |
| 5 | select | `to-vscode-3` → `sel-done` | c1 Step five: tell VS Code which ESP-IDF to use. From the command palette, run ESP-IDF: Select Current ESP-IDF Version. / c2 Pick v6.1. / c3 The status bar now shows ESP-IDF v6.1. | spots: button, row, status item |
| 6 | check | `term-open` → `version` | k1 Step six: check that it works. Click the terminal icon in the status bar to open an ESP-IDF terminal. / k2 Type idf.py --version. / k3 ESP-IDF v6.1. It's installed. | typed row, version row |
| 7 | serial | (holds last frame) | l1 Step seven, before you plug in a board. / l2 On Linux, give yourself access to the USB serial port with this command, then log out and back in. / l3 On Windows and Mac the USB driver usually installs itself. If your board doesn't show up, get the CP210x or FTDI driver from these pages. | cards: usermod; driver URLs |
| 8 | outro | | z1 That's it: VS Code, the extension, and ESP-IDF v6.1. Next up: Basic GPIO. | full view |

Every click has a mark just before it (`*-click`) so its beat lands the click on the spoken word;
only the waits after clicks are sped up. In an empty folder the first run of the Installation
Manager command only activates the extension (its guide opens and closes any quick pick), so the
take runs it again: deterministic, and what a learner will see.

Not shown (on purpose): the OpenOCD udev rule in the extension's guide (JTAG debugging only,
not used in this course), Custom/Offline installation, ESP-IDF versions other than the default.
