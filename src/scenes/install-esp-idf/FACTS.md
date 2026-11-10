# install-esp-idf: facts

**Versions read / recorded (2026-11):** ESP-IDF **v6.1** (latest stable, released 2026-08-27;
v6.0.3 2026-09-02 — GitHub releases API) · ESP-IDF Installation Manager (EIM) **v0.20.1**
(`https://dl.espressif.com/dl/eim/eim_unified_release.json`) · ESP-IDF extension
**2.3.0** (Marketplace) · VS Code 1.145.0 (Linux) · demo machine: Fedora (Nobara), x86-64.
The take itself is a source: anything it shows is what that setup really does.

**Course note:** the course's other videos were checked against v6.0.2. EIM's Easy
Installation offers only v6.1, v6.0.3, v5.5.6, v5.4.4, v5.3.6 (dropdown, read from the GUI),
so a learner following this video gets **v6.1**. `AGENTS.md`: "ESP-IDF v6.0 or later. Always."

| # | Claim | Source |
|---|---|---|
| 1 | You need VS Code, the ESP-IDF extension, and ESP-IDF (installed by EIM) | extension docs "Install ESP-IDF and Tools" (docs.espressif.com/projects/vscode-esp-idf-extension/en/latest/installation.html): install VS Code → install the extension → `ESP-IDF: Open ESP-IDF Installation Manager` |
| 2 | VS Code: code.visualstudio.com/download | the page itself (take) |
| 3 | Windows: run the installer (`VSCodeUserSetup-{version}.exe`) | code.visualstudio.com/docs/setup/windows: "Download the Visual Studio Code User setup for Windows. Run the installer" |
| 4 | Mac: open the download and drag VS Code into Applications | code.visualstudio.com/docs/setup/mac: "Open the downloaded .dmg file. Drag Visual Studio Code.app to the Applications folder." |
| 5 | Linux: .deb (Debian, Ubuntu) or .rpm (Fedora) | code.visualstudio.com/docs/setup/linux (".deb … Debian and Ubuntu-based", ".rpm … RHEL, Fedora, and CentOS-based"); download page card |
| 6 | The Snap version can't open the installer window | extension 2.3.0 `dist/extension.js`: "VS Code installed via Snap cannot launch EIM's GUI due to sandbox restrictions" (it then offers the CLI wizard in a terminal) |
| 7 | Extensions view: Ctrl+Shift+X (Mac ⇧⌘X); search ESP-IDF; publisher Espressif Systems | extension docs (claim 1); take: first result "ESP-IDF … Espressif Systems" (verified), 1.7M installs |
| 8 | VS Code asks "Do you trust the publisher 'Espressif Systems'?" → Trust Publisher & Install | take (first extension from that publisher) |
| 9 | After install the Espressif icon appears in the Activity Bar | take; extension README step 5 |
| 10 | Prerequisites page: docs.espressif.com/projects/idf-im-ui/en/latest/prerequisites.html | linked from the extension's walkthrough step "Configuring the ESP-IDF Extension" (`package.nls.json`) |
| 11 | Windows: no prerequisites to install; EIM installs missing Git/Python after asking | prerequisites page "Windows": "The ESP-IDF Installation Manager will verify the required prerequisites on your system and install any that are missing"; ESP-IDF v6.1 windows-setup "Step 1 … (Optional)"; EIM binary: install_all_prerequisites "only affects Windows platforms" |
| 12 | Mac: Homebrew (brew.sh), then `brew install libgcrypt glib pixman sdl2 libslirp dfu-util cmake python` | ESP-IDF v6.1 docs, get-started/macos-setup.html "Step 1: Install the Prerequisites" (verbatim) |
| 13 | Ubuntu/Debian: `sudo apt-get install git wget flex bison gperf python3 python3-pip python3-venv cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0` | ESP-IDF v6.1 docs, get-started/linux-macos-setup-legacy.html, "Ubuntu and Debian" (verbatim); covers the EIM list on the prerequisites page (git wget flex bison gperf ccache libffi-dev libssl-dev dfu-util libusb-1.0-0, Python with pip/venv) |
| 14 | Other Linux: install the listed packages; without them EIM stops | prerequisites page: "On POSIX systems, the installer will check for the required prerequisites. If they are not met, the installation will not proceed"; EIM string "Please install these required prerequisites before proceeding: %{items}" |
| 15 | Command palette: Ctrl+Shift+P (Mac ⇧⌘P) → `ESP-IDF: Open ESP-IDF Installation Manager` | extension docs (claim 1); take |
| 16 | In a folder with no project, the extension asks to activate anyway | take: "No standard ESP-IDF project was found in this workspace. Do you want to activate the ESP-IDF extension anyway?" → Activate Anyway |
| 17 | It then starts up (~30 s here) and opens its guide "ESP-IDF Basic Usage Guide"; running the command again asks for the mirror | take (events `activate-click` → `palette2` → `mirror`); walkthrough `espIdf.walkthrough.basic-usage` in `package.json` |
| 18 | It asks for a download mirror: Github / Espressif (faster in China) / Open Releases URL | extension `dist/extension.js` showQuickPick(["Github","Espressif (faster in China)","Open Releases URL"]); take |
| 19 | The extension downloads EIM and opens it | take: "Downloading EIM: …/v0.20.1/eim-gui-linux-x64-v0.20.1.zip", "extracted to: /home/learner/.espressif/eim_gui" |
| 20 | EIM: New Installation → Start Installation → Easy Installation → Start Easy Installation → Ready to Install | take; ESP-IDF v6.1 linux-setup.html "Online Installation Using EIM GUI" |
| 20b | Before "Ready to Install", EIM checks the system (prerequisites, path) | ESP-IDF v6.1 linux-setup.html: "If all prerequisites and path checks pass, you will see the Ready to Install page"; take: ~15 s between Start Easy Installation and Ready |
| 21 | Ready to Install: version v6.1 (2.35 GB), install location ~/.espressif, estimated 10–45 minutes | take (EIM page text) |
| 22 | The install here took ~14 min (download ~8.5 min) | take timestamps (rehearsal 823 s) |
| 23 | EIM shows "Installation Complete!" | take; v6.1 linux-setup.html |
| 24 | Command palette → `ESP-IDF: Select Current ESP-IDF Version` → pick the version → the status bar shows it | extension docs step 5 ("type select current esp-idf version"); take: row "Version: v6.1.0 · IDF_PATH: /home/learner/.espressif/v6.1/esp-idf", status "ESP-IDF v6.1.0", toast "ESP-IDF has been configured" |
| 25 | Status bar terminal icon ("Open ESP-IDF Terminal") opens an ESP-IDF terminal; `idf.py --version` → `ESP-IDF v6.1` | take; status bar item `espIdf.createIdfTerminal` (aria-label "terminal, Open ESP-IDF Terminal") |
| 26 | Linux serial port: `sudo usermod -a -G dialout $USER`, then re-login (Arch: `uucp`) | ESP-IDF v6.1 docs, get-started/establish-serial-connection.html "Adding User to dialout or uucp on Linux" |
| 27 | Windows/Mac: drivers usually install automatically; else CP210x (silabs.com/developers/usb-to-uart-bridge-vcp-drivers) or FTDI (ftdichip.com/drivers/vcp-drivers) | same page, "Connect ESP32 to PC" |
| 28 | Next video: create an empty project that prints Hello World | the course author (2026-11-09); `AGENTS.md` course order, section 0 |
