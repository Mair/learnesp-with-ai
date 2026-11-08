# vscode-spike: facts

**ESP-IDF tag:** `v6.0.2` (`~/.espressif/v6.0.2/esp-idf`) · **VS Code** 1.145.0 (Linux) ·
**ESP-IDF extension** `espressif.esp-idf-extension` 2.3.0. The take (`take.json`) was recorded
on this setup by `capture/takes/spike.ts`, so anything it shows is what that setup really does.

| # | Claim (VO / screen) | Source |
|---|---|---|
| 1 | The status bar shows `ESP-IDF v6.0.2` once the extension finds the install | the take, event `start` (box = that status item); the install comes from `~/.espressif/tools/eim_idf.json` (`"name": "v6.0.2"`) |
| 2 | **Ctrl+Shift+P** opens the command palette; **Ctrl+P** opens a file by name (Quick Open). On a Mac: ⌘⇧P / ⌘P | VS Code default keybindings (Linux/Windows; macOS uses Cmd); used in the take, events `palette-open`, `quick-open` |
| 3 | The command is called **ESP-IDF: Open ESP-IDF Terminal** | extension `package.nls.json` line 46 `"espIdf.createIdfTerminal.title": "Open ESP-IDF Terminal"`, category `ESP-IDF`; it's the palette row in the take |
| 4 | That terminal has ESP-IDF's tools already set up | the take: on open it prints `Environment setup complete for the current shell session.` and `You are now using IDF version 6.0.2.`, and `idf.py` runs without any manual export step |
| 5 | `idf.py --version` prints `ESP-IDF v6.0.2` | the take, event `version` (`text: "ESP-IDF v6.0.2"`) |
| 6 | `gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT)` makes the pin an output | `components/esp_driver_gpio/include/driver/gpio.h:146-161`: "GPIO set direction · Configure GPIO mode, such as output_only…"; returns `ESP_OK` / `ESP_ERR_INVALID_ARG` |
| 7 | The demo program blinks an LED on GPIO 2 (on 500 ms, off 500 ms) | `capture/demo-project/main/main.c`: `#define LED_PIN GPIO_NUM_2`, `vTaskDelay(pdMS_TO_TICKS(500))` twice in `while (1)` |
| 8 | This course uses ESP-IDF version 6 | project `AGENTS.md` ("ESP-IDF v6.0 or later. Always.", reference tag v6.0.2) |

Not claimed: the extension's own shortcut (Ctrl+E T, ⌘I T on a Mac: `package.json:603-605`) is visible on
the palette row but isn't narrated.
