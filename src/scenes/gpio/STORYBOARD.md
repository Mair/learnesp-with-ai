# GPIO — storyboard (draft for approval)

Slug `gpio` · composition `GPIO` · `out/gpio.mp4` · ~5 min · every claim → `FACTS.md`.
Sketch used throughout:

```cpp
const int LED = 2;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
```

Colour mapping (STYLE.md): pin = pink · voltage on the wire / waveform = magenta ·
registers, ticks, code = cyan · your value (HIGH/LOW, the LED, current) = amber ·
works/fits/CPU free = green · wrong/rejected/over limit = red.

## Arc

| # | Scene | Job | ~s |
|---|---|---|---|
| 1 | Problem | code says "on", LED stays dark: every pin starts as a listener | 16 |
| 2 | Answer | two steps — make it an output, set its level → G·P·I·O | 10 |
| 3 | The circuit | pin → resistor → LED → ground; why the resistor; which pins | 55 |
| 4 | `pinMode` | Explainer: pin, mode | 55 |
| 5 | `digitalWrite` | Explainer: pin, value | 45 |
| 6 | Blink | CodeToHardware demo, real time | 22 |
| 7 | `delay` | Explainer: ms; ticks; CPU is free; the pin holds itself | 35 |
| 8 | Second knob: current | code sets on/off, the resistor sets how much; a pin is a signal, not a supply | 35 |
| 9 | Under the hood | `digitalWrite` → Arduino core → `gpio_set_level` → `out_w1ts` → W1TS register | 45 |
| 10 | Payoff | "Make it an output. Set its level. That's GPIO." + recap → PWM hook | 8 |

## 1 · Problem

| VO | Visual |
|---|---|
| p1 "You've written a line of code, and on the breadboard there's an LED." | left: code card `digitalWrite(2, HIGH);` · right: breadboard LED, dark |
| p2 "But right after reset, every ESP32 pin is listening, not driving. So this line does nothing." | pin card `GPIO 2 · listening`; code line runs (bar sweeps), LED stays dark; a RED serial-monitor line types out: `IO 2 is not set as GPIO. Execute pinMode(2, OUTPUT) first.` |
| p3 "So how do you make a pin switch something on?" | caption |

## 2 · Answer

| VO | Visual |
|---|---|
| a1 "Two steps. First, make the pin an output. Then set its level: high, or low. That's a GPIO: a general-purpose input/output pin." (`say`: "… That's a G P I O …") | **the pin diagram** (reused all video): a pad with an output driver = a switch. "make it an output" → the switch connects to the pad (listening → driving). "high" → switch to 3.3 V rail (amber), "low" → to ground. G·P·I·O lands letter by letter, then the words |

## 3 · The circuit

Explainer-style: a chain `GPIO 2 → 220 Ω → LED → GND` with one card per part.

| VO | Visual |
|---|---|
| c1 "First, the circuit. From GPIO 2, through a resistor, into the long leg of the LED, and out of the short leg to ground." | schematic draws part by part on each spoken word; cards light: pin · resistor · LED (long leg = +) · ground |
| c2 "When the pin is high, it sits at about three point three volts. Current flows out of the pin, through the LED, to ground, and it lights." | pin goes amber, current dots flow along the wire, LED lights |
| c3 "The resistor sets how much current flows. The LED drops about two volts, leaving one point three across the resistor. One point three volts over two hundred and twenty ohms is about six milliamps." | worked chain builds on screen: `3.3 V − 2.0 V = 1.3 V` → `1.3 V ÷ 220 Ω ≈ 5.9 mA` |
| c4 "Which pin? Not just any. Thirty-four to thirty-nine can only be inputs. Six to eleven are wired to the flash chip. And one and three carry your uploads." | ESP32 pin map, 34 GPIOs: 34–39 RED "input only", 6–11 RED "flash", 1/3 muted "TX/RX" — each group lights on its word |
| c5 "GPIO 2 is a strapping pin: the chip reads it at reset to decide how to boot. Wired to ground through the LED, it stays low, and low is safe for both booting and flashing. Many boards already have an LED on it, but not all, so check yours." | strapping pins outlined amber (0, 2, 5, 12, 15); GPIO 2 zooms: `reset → reads 0 → ✓ boot ✓ flash` |

## 4 · `pinMode(LED, OUTPUT);`

Explainer: two cards — `pin · GPIO 2 · which pin`, `mode · OUTPUT · what it does`.

| VO | Visual (stage view) |
|---|---|
| m1 "In setup, pinMode makes the pin an output. It takes two things: which pin, and what mode." | call line + cards light on "which pin", "what mode" |
| m2 "The pin is the GPIO number, not the pin's position on the board. The ESP32 has thirty-four GPIOs, and twenty-eight of them can be outputs." | ✗/✓ cards: ✗ "the 2nd pin on the header" / ✓ "the pin labelled GPIO 2"; count bar 34 → 28 (34–39 struck RED) |
| m3 "OUTPUT switches on the pin's output driver. Until now it was only listening. Now it can drive the wire high or low." | **the pin diagram** from scene 2 (callback): driver switch closes; pill `listening → driving` |
| m4 "On an ESP32, OUTPUT keeps the input switched on too, so digitalRead can still tell you what the pin is doing." | register-card: `OUTPUT = 0x03` → bit 0 `input ✓` · bit 1 `output ✓` |
| m5 "Ask for an output on a pin that can't drive, like thirty-four, and pinMode prints an error and leaves the pin alone. Your sketch keeps running." | `pinMode(34, OUTPUT);` → RED log `IO 34 config failed`; pin 34 stays `listening` |
| m6 "And the datasheet doesn't promise which level the pin starts at. So right after pinMode, set the level you want." | output bit shown as `?` → `digitalWrite(LED, LOW);` → `0` |

## 5 · `digitalWrite(LED, HIGH);`

Explainer: `pin · GPIO 2 · the pin you set up`, `value · HIGH · the level`.

| VO | Visual |
|---|---|
| d1 "Then digitalWrite sets the level. It takes two things: the pin, and HIGH or LOW." | call line + cards |
| d2 "HIGH drives the pin to three point three volts, and the LED lights. LOW pulls it to zero, and it goes dark." | voltage meter 0…3.3 V + LED; value card toggles HIGH ↔ LOW |
| d3 "The datasheet guarantees high is at least two point six four volts, and low is at most zero point three three. Those are the only two levels a digital output gives you." | voltage axis with two GREEN bands (≥ 2.64 V, ≤ 0.33 V) and the gap between greyed |
| d4 "HIGH is just the number one, and LOW is zero. In fact, any number that isn't zero counts as HIGH." | `HIGH = 1 · LOW = 0`; `digitalWrite(LED, 7)` → HIGH ✓ |
| d5 "And it doesn't wait. digitalWrite sets the level and returns straight away. The pin holds that level on its own, until you write it again." | CPU lane: a short `digitalWrite` box, then GREEN `CPU free`; pin trace stays high underneath |

## 6 · Blink (CodeToHardware)

| VO | Visual |
|---|---|
| b1 "Put it together and you get blink. In setup, make the pin an output. In loop: high, wait half a second, low, wait half a second." | the sketch on the left, each line lit on its word; LED right; scope underneath; `real time` |
| b2 "On, off, about once a second, for as long as it has power." | runs; square wave scrolls, 1 s period bracketed |

## 7 · `delay(500);`

Explainer: one card — `ms · 500 · how long`.

| VO | Visual |
|---|---|
| y1 "delay takes one number: milliseconds. Five hundred is half a second." | card; `500 ms = 0.5 s` |
| y2 "Underneath, it asks FreeRTOS to put your loop to sleep for five hundred ticks. On Arduino, one tick is one millisecond." | tick ruler: 500 ticks × 1 ms |
| y3 "While your loop sleeps, the CPU is free for other work, and the pin keeps its level. Nothing is holding it high. It's a bit in a register." | CPU lane: `loop` sleeping, GREEN `CPU free`; pin stays high; register bit glows |
| y4 "Take the delays out, and the pin flips far too fast to see. The LED just looks dimmer. Hold that thought." | delays struck out; scope compresses to a blur; LED settles dimmer |

## 8 · Second knob: current

| VO | Visual |
|---|---|
| k1 "Your code decides on or off. The resistor decides how much current, and so how bright. Two twenty ohms: about six milliamps. One kilohm: about one point three, and the LED is dimmer." | resistor value slides 220 Ω → 1 kΩ; current bar + LED brightness follow |
| k2 "But a pin is a signal, not a power supply. By default it's set to deliver about twenty milliamps, and about forty at most." | budget bars: LED 5.9 mA GREEN under a `default ~20 mA` line; `max ~40 mA` line above |
| k3 "A motor, a relay or a strip of LEDs needs far more. For those, the pin switches a transistor, and the transistor switches the load." | RED bar running off the chart; then ✓ card: `pin → transistor → motor` |

## 9 · Under the hood

Layer descent, real source trimmed with "…".

| VO | Visual |
|---|---|
| i1 "So what does digitalWrite really do? Let's follow it down." | `sketch.ino`: `digitalWrite(LED, HIGH);` |
| i2 "In the Arduino core, it checks that pinMode claimed the pin. If not, that's the error from the start. Then it calls ESP-IDF's gpio_set_level." | `cores/esp32/esp32-hal-gpio.c` `__digitalWrite` (real): the `log_e(…Execute pinMode…)` line marked (callback to scene 1), `gpio_set_level` marked |
| i3 "gpio_set_level checks that the pin can be an output, and passes it down to the hardware layer." | `esp_driver_gpio/src/gpio.c` `gpio_set_level` |
| i4 "And at the bottom, it's one line. HIGH writes a one to bit two of the set register. LOW writes it to the clear register." | `hal/esp32/include/hal/gpio_ll.h` `gpio_ll_set_level`: `hw->out_w1ts = 1 << gpio_num;` / `out_w1tc` |
| i5 "Write-one-to-set means only your pin's bit changes. Every other pin stays exactly as it was." | 32-bit register card `GPIO_OUT_W1TS_REG · 0x3FF44008`: bit 2 lights, `GPIO_OUT_REG` bit 2 flips, others untouched; TRM quote |
| i6 "pinMode, underneath, is a few writes like this one: route the plain GPIO output to the pin, and set its bit in the output-enable register." | card: `enable_w1ts = 1 << 2` · `out_sel = 256 (simple GPIO output)` · `function = GPIO` |

## 10 · Payoff

| VO | Visual |
|---|---|
| x1 "Make it an output. Set its level. That's GPIO." | the line in `GRAD_TEXT`; recap rows: `pinMode → output driver on` · `digitalWrite → one bit, one register` · `resistor → how much current` · `HIGH or LOW → nothing in between` (→ *next: PWM*) |

## Open decisions

1. **Pin:** GPIO 2 (matches the PWM video and the vertical slice, safe with LED-to-ground) vs a non-strapping pin like GPIO 4 (no strapping detour in scene 3).
2. **Resistor / LED:** 220 Ω and a red LED at ~2.0 V — need the kit's real parts (Vf is UNVERIFIED).
3. **y4 tease** ("take the delays out → dimmer") is physics, not hardware-verified yet — keep, or end the tease at the payoff only.
4. Footage: placeholder `<Led>` like the PWM video, swapped for macro footage later.
