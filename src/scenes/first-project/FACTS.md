# first-project: facts

**Versions read / recorded (2026-11):** ESP-IDF **v6.1** (the version `install-esp-idf`
installs; local copy in the take's home, `capture/.devhome/.espressif/v6.1/esp-idf`,
`git describe` → `v6.1`) · ESP-IDF extension **2.3.0** · VS Code 1.145.0 (Linux) · demo
machine: Fedora (Nobara), x86-64. The take itself is a source: anything it shows is what
that setup really does (event ids in `take.json`).

| # | Claim | Source |
|---|---|---|
| 1 | Command palette → `ESP-IDF: Create New Empty Project` asks for a name, then a folder, creates the project and offers "Open <name>" | extension 2.3.0 `dist/extension.js`, `espIdf.createNewProject`: `showInputBox({placeHolder:"Enter ESP-IDF project name"})` → `showOpenDialog({canSelectFolders:true})` → copies `templates/template-app` → `showInformationMessage("ESP-IDF project {name} has been created", "Open {name}")` → `vscode.openFolder(…, true)` (a new window). Take: `name`, `folder`, `created`, `open-click`, `win2` |
| 2 | In an empty folder the extension asks to activate first ("Activate Anyway"); it asks every time, it isn't remembered | `dist/extension.js` activation check: the prompt is shown whenever no workspace folder has a root `CMakeLists.txt` with `include($ENV{IDF_PATH}/tools/cmake/project.cmake)` and `idf.extensionActivationMode` is `detect` (default); nothing is stored. Take: `activate` |
| 3 | The folder picker starts in the open folder (`/home/learner/esp32/`) | take `folder` (text `/home/learner/esp32/`). The take uses VS Code's own folder picker (`files.simpleDialog.enable`); on a learner's machine the same step is the system's folder dialog |
| 4 | The project opens in a new VS Code window | `vscode.openFolder(uri, true)` (forceNewWindow); take `win2` (title `hello_world`) |
| 5 | The new project: `CMakeLists.txt`, `main/CMakeLists.txt`, `main/main.c` = `#include <stdio.h>` + empty `void app_main(void) {}` (plus `.devcontainer`, `.clangd`, `.gitignore` the extension adds) | extension `templates/template-app/` (3 files, verbatim); take `win2`, `editor` |
| 6 | The top-level `CMakeLists.txt` is what makes the folder an ESP-IDF project | its lines `include($ENV{IDF_PATH}/tools/cmake/project.cmake)` + `project(hello_world)`; ESP-IDF v6.1 docs, api-guides/build-system "Example Project" / "Minimal Example CMakeLists"; the extension's own detection (claim 2) looks for exactly that include |
| 7 | `app_main` is where your program starts: ESP-IDF starts up, then its main task calls `app_main()` | v6.1 `components/freertos/app_startup.c` 134–135 ("Used to dispatch `void app_main(void)` … main_task will self delete if app_main returns"), 204–207 (`ESP_LOGI(MAIN_TAG, "Calling app_main()"); app_main(); ESP_LOGI(MAIN_TAG, "Returned from app_main()")`) |
| 8 | `printf` goes to the console, which is UART0 by default, i.e. the board's USB-serial chip → down the USB cable | v6.1 `components/esp_system/Kconfig` `ESP_CONSOLE_UART_DEFAULT` (default on the original ESP32); ESP-IDF docs api-guides/stdio "Standard I/O: by default, stdout goes to UART0" |
| 9 | Status bar chip icon = "Set Espressif Device Target (IDF_TARGET)"; picking `esp32` then asks for an OpenOCD board config; "ESP32 chip (via ESP-PROG)" | take `target-item` (aria-label "chip esp32, Set Espressif Device Target (IDF_TARGET)"), `target-pick`, `ocd`, `ocd-row` |
| 10 | The second list only matters for JTAG debugging (OpenOCD), not for building or flashing over USB | extension setting `idf.openOcdConfigs` ("List of configuration files inside OpenOCD scripts directory"), used by the OpenOCD server / debug adapter; build uses `IDF_TARGET` only |
| 11 | "Target ESP32 Set Successfully." a few seconds later | take `target-done` (18.6 s after the click here, the extension runs `idf.py set-target`) |
| 12 | Wrench icon = "Build Project"; the build ends with "Build Successful" and the size summary ("Total image size: 142115 bytes") | take `build-item` (aria-label "symbol-property, Build Project"), `build-done` (toast "Build Successful": `to.infoNotify("Build Successful")` in `dist/extension.js`), `build-size` |
| 13 | The first build took about a minute here (≈ 50 s); it compiles ESP-IDF's components with your code (≈ 1035 build steps); later builds only redo what changed | take `build-click` → `build-done`; extension output log `[1035/1035]`; ninja rebuilds only out-of-date targets (ESP-IDF build-system docs: "incremental builds") |
| 14 | The course's chip is the original ESP32 (target `esp32`) | `AGENTS.md` (QEMU machine `esp32`, DAC on GPIO 25/26 in section 3) |
| 15 | Next (not recorded yet): plug in the board, select its port, flash, monitor → "Hello world!" | planned; needs a real ESP32 on the take machine (`BOARD=…`). The six boards on this machine are another project's ESP32-C5s (USB-JTAG, `303a:1001`) and were not touched |

**Not used:** the extension's `ESP-IDF: New Project` wizard. In 2.3.0 its template list offers
`sample_project`, but selecting it shows no "Create project" button (the button only appears for
templates/examples with a README; `sample_project` has none), so the empty project is made with
`Create New Empty Project` instead.
