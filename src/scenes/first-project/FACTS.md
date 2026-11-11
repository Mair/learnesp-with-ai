# first-project: facts

**Versions read / recorded (2026-11):** ESP-IDF **v6.1** (the version `install-esp-idf`
installs; local copy in the take's home, `capture/.devhome/.espressif/v6.1/esp-idf`,
`git describe` → `v6.1`) · ESP-IDF extension **2.3.0** · VS Code 1.145.0 (Linux) · demo
machine: Fedora (Nobara), x86-64. **Board on the take: an ESP32-S3** (`esptool chip-id`: "ESP32-S3
(QFN56) (revision v0.1) … USB mode: USB-Serial/JTAG", MAC f4:12:fa:e2:29:38, `/dev/ttyACM2`). The
course's other videos use the original ESP32; the VO says so in the chip step (the course author
chose to record this video with the S3, 2026-11-11). The take itself is a source: anything it shows is what
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
| 8 | `printf` goes down the USB cable: on the original ESP32 the console is UART0, wired to the board's USB-serial chip; on the ESP32-S3 the console also goes out through its built-in USB-Serial/JTAG port | v6.1 `components/esp_stdio/Kconfig`: primary console UART0 by default; `ESP_CONSOLE_SECONDARY` "default ESP_CONSOLE_SECONDARY_USB_SERIAL_JTAG" on chips with USB-Serial/JTAG (34–55); take `hello` (the monitor on `/dev/ttyACM2`, the S3's USB-Serial/JTAG) |
| 9 | Status bar chip icon = "Set Espressif Device Target (IDF_TARGET)"; picking the chip (`esp32s3` here; the original ESP32 is `esp32`) then asks for an OpenOCD board config; first entry "ESP32-S3 chip (via builtin USB-JTAG)" (`board/esp32s3-builtin.cfg`; for `esp32` the list starts with the WROVER kits and has "ESP32 chip (via ESP-PROG)") | take `target-item` (aria-label "chip esp32, Set Espressif Device Target (IDF_TARGET)"), `target-pick`, `ocd`, `ocd-row`; the esp32 list from the earlier take (2026-11-10) |
| 10 | The second list only matters for JTAG debugging (OpenOCD), not for building or flashing over USB | extension setting `idf.openOcdConfigs` ("List of configuration files inside OpenOCD scripts directory"), used by the OpenOCD server / debug adapter; build uses `IDF_TARGET` only |
| 11 | "Target ESP32S3 Set Successfully." a few seconds later | take `target-done` (16.5 s after the click here; the extension runs `idf.py set-target`) |
| 12 | Wrench icon = "Build Project"; the build ends with "Build Successful" and the size summary ("Total image size: 142115 bytes") | take `build-item` (aria-label "symbol-property, Build Project"), `build-done` (toast "Build Successful": `to.infoNotify("Build Successful")` in `dist/extension.js`), `build-size` |
| 13 | The first build took about a minute here (61 s for the S3; ≈ 50 s for esp32 the day before); it compiles ESP-IDF's components with your code (≈ 1000 build steps); later builds only redo what changed | take `build-click` → `build-done`; extension output log `[1035/1035]` (esp32); ninja rebuilds only out-of-date targets |
| 14 | The course's chip is the original ESP32 (target `esp32`) | `AGENTS.md` (QEMU machine `esp32`, DAC on GPIO 25/26 in section 3) |
| 15 | Plug icon = "Select Port to Use (COM, tty, usbserial)"; the list shows the board as `/dev/ttyACM2 ESP32-S3` | take `port-item`, `port-row` (the extension asks each port for its chip, `idf.enableSerialPortChipIdRequest` default true). This machine also has five ESP32-C5 boards of another project attached; the take hides them (`serialPorts` in the stage config → `capture/lib/udevadm-filter.py`), as a learner with one board would see |
| 16 | Port names: Linux `/dev/tty…` (`/dev/ttyUSB0`, `/dev/ttyACM0`), Windows `COM…`, Mac `/dev/cu.…` | ESP-IDF v6.1 docs get-started/establish-serial-connection.rst 190–206 (`COM3`, `/dev/ttyUSB0`, `/dev/cu.usbserial-1401`), 248 (`ls /dev/cu.*`) |
| 17 | Lightning icon = "Flash Device"; the first time it asks "Select flash method" (JTAG / UART / DFU); UART flashes over the same USB cable; "Flash Done ⚡️" a few seconds later | take `flash-item` (aria-label "zap, Flash Device"), `method` (placeholder "Select flash method, you can modify the choice later from 'settings.json' (idf.flashType)"), `flash-done` (3.8 s after the click); extension string `"Flash Done ⚡️"` |
| 18 | Monitor icon = "Monitor Device"; the board restarts and prints `I (253) main_task: Calling app_main()`, `Hello world!`, `I (263) main_task: Returned from app_main()` | take `monitor-item`, `hello`; app_startup.c 204–207 (claim 7) |
| 19 | Ctrl+] stops the monitor | ESP-IDF v6.1 docs api-guides/tools/idf-monitor.rst ("Ctrl-]" → "Exit the program", 24, 66); take `monitor-exit` → the terminal returns to the prompt |
| 20 | Next video: Basic GPIO (its intro) | `AGENTS.md` course order: the last video of a section points to the next section's intro |

**Not used:** the extension's `ESP-IDF: New Project` wizard. In 2.3.0 its template list offers
`sample_project`, but selecting it shows no "Create project" button (the button only appears for
templates/examples with a README; `sample_project` has none), so the empty project is made with
`Create New Empty Project` instead.
