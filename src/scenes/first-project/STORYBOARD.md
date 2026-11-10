# first-project: storyboard

**Narration** follows `SCRIPT.md` "Sound like a teacher, not a list"; the exact lines are in
`timeline.ts` `VO`. Slug `first-project`, composition `FirstProject`, output
`out/0-setup/first-project.mp4`. After `install-esp-idf`; next: `basic-gpio-intro`.

**Goal:** a beginner makes an empty ESP-IDF project, adds one `printf`, picks the chip, builds,
then flashes it and sees "Hello world!" in the monitor, clicking along.

**Take:** one continuous recording (`capture/takes/first-project.ts`): VS Code with the
extension and ESP-IDF v6.1 from `install-esp-idf` (home `capture/.devhome` shown as
`/home/learner`), workspace `/home/learner/esp32` (empty). Step pills top left.

**Status:** steps 1–4 recorded and cut (preview ends with the build). Step 5 (port → flash →
monitor) needs an original ESP32 plugged into this machine: `BOARD=/dev/ttyUSB0 npm run
first-project:take` records it in the same take; then add its beats and VO (below) and replace
the preview outro.

| # | Beat | Take events | VO (gist) | Visual |
|---|---|---|---|---|
| 0 | intro | `begin` → `palette` | last video installed it; now the first program, prints Hello world; the five steps; start in the empty esp32 folder | card: five steps; sidebar zoom |
| 1 | new1–2 | `palette` → `palette-enter` | Step one: create the project. Ctrl+Shift+P; run ESP-IDF: Create New Empty Project | palette zoom, callout Mac ⇧⌘P |
| 1 | act1–3 | → `name` | the folder is still empty, so it asks again; Activate Anyway; next it asks for a name | toast, button spot |
| 1 | name, folder | → `folder-click` | type hello_world, Enter; it starts in esp32, click OK | input, OK spot |
| 1 | created, win2 | → `open-click`, `win2` | creates it, offers to open it; Open hello_world; opens in a new window | toast, button |
| 1 | tour1–3 | `cmake` → `type-start` | same shape every time: CMakeLists = a project; code in main → main.c; an include and an empty app_main; app_main is where your program starts (ESP-IDF sets up, then calls it) | spots on rows and lines |
| 2 | code1–3 | `type-start` → `target-item` | step two: type this printf; printf sends text down the USB cable, \n ends the line; Ctrl+S | typed line spot, callouts |
| 3 | chip1–5 | `target-item` → `build-item` | step three: which chip; chip icon; the original ESP32 → esp32 (else your chip); debug adapter list: not used, ESP32 chip via ESP-PROG; Target ESP32 Set Successfully | status icon, list rows, toast |
| 4 | build1–3 | `build-item` → `end` | step four: build; wrench = Build Project; first build ~1 min (compiles ESP-IDF too), later only what changed; Build Successful + size | icon, panel ×N, toast, size line |
| 5 | (to record) port | `port-item` → `port-done` | step five: plug the board in; plug icon, pick its port | status icon, port row |
| 5 | (to record) flash | `flash-item` → `flash-done` | lightning = Flash Device; (first time: UART); Flash Done | icon, toast |
| 5 | (to record) monitor | `monitor-item` → `monitor-exit` | monitor icon; the board restarts and prints its boot messages, then Hello world!; app_main returns; Ctrl+] stops the monitor | terminal, "Hello world!" spot |
| 6 | outro | | that's your first program; next: Basic GPIO | full view |

Preview outro (until step 5 is recorded): "Next, you plug in your board, flash the program onto
it, and watch it print Hello world."
