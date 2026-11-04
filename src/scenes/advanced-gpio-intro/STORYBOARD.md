# Advanced GPIO intro: storyboard v1 (draft for approval)

- Slug `advanced-gpio-intro`, composition `AdvancedGPIOIntro`, output `out/3-advanced-gpio/advanced-gpio-intro.mp4`, about 2 min.
- **Section intro** (`SCRIPT.md`, "Section intro"). It follows the last FreeRTOS video (task stats) and comes before `pwm`.
- Every claim is sourced in `FACTS.md`.
- Hardware: the `Wroom` drawing with the LED on GPIO 2, the speaker on GPIO 4, the button on GPIO 18, a potentiometer (its pin is decided in `adc`), and GPIO 25 for the DAC.

| # | Scene | Job |
|---|---|---|
| 1 | The want | so far, on/off and asking; now: dim, play a note, catch a press, read a voltage, make one |
| 2 | What it is | peripherals: hardware behind the pins, each doing one job on its own once you set it up |
| 3 | The map | four cards: PWM · GPIO interrupts · ADC · DAC |
| 4 | What you need | the parts, and both earlier sections |
| 5 | Go | "First up: PWM" |

## 1 · The want
| VO | Visual |
|---|---|
| w1 "So far, a pin is on or off, and your code keeps asking the button how it is." | the board: LED snapping on/off; a polling loop ticking `gpio_get_level?` again and again beside the button |
| w2 "Now you'll dim a light, play a note, catch a press the instant it happens, read a voltage, and make one of your own." | five quick vignettes in a row: LED glowing at half · speaker with rings · button with a lightning edge · a knob and a needle · a voltage bar rising |
| w3 "So how do you get more out of a pin than on and off?" | the vignettes dim; the pins stay lit |

## 2 · What it is
| VO | Visual |
|---|---|
| g1 "Behind the pins, the ESP32 has pieces of hardware that each do one job." | behind the module, four blocks appear: `LED controller` · `GPIO interrupt` · `ADC` · `DAC` |
| g2 "They're called peripherals. You set one up with a few calls, and then it does the work on its own." | the word **peripherals**; one block lights, its pin starts working, and the code lane goes idle: "your code is free" |
| g3 "So your code is free to do something else." | a task lane carries on with other work while the block keeps going |

## 3 · The map
| VO | Visual |
|---|---|
| m1 "This section has four videos." | four dimmed cards with a path between them |
| m2 "PWM. Switch a pin so fast that an LED looks dim and a speaker plays a note." | card 1: **PWM** · `ledc_set_duty` · `ledc_set_freq` · a dimming LED and a speaker |
| m3 "GPIO interrupts. Let the pin tell you when the button is pressed, instead of asking it." | card 2: **GPIO interrupts** · `gpio_isr_handler_add` · `xQueueReceive` · press → a bolt → a task wakes |
| m4 "ADC. Turn a voltage into a number, from zero to four thousand and ninety-five." | card 3: **ADC** · `adc_oneshot_read` · a knob turns and `0 … 4095` follows |
| m5 "And DAC, the other way: turn a number from zero to two fifty-five into a voltage. Only the original ESP32 and the S2 have one." | card 4: **DAC** · `dac_oneshot_output_voltage` · `128 → ≈ 1.66 V` on GPIO 25 · a badge "ESP32 · ESP32-S2 only" |

## 4 · What you need
| VO | Visual |
|---|---|
| n1 "On the bench: the LED and button from before, a small speaker on GPIO four, and a potentiometer: a knob that gives you a voltage." | the parts drop in beside the board, labelled |
| n2 "And both earlier sections. The interrupt video hands each press to a task through a queue, so it needs FreeRTOS." | two badges tick: `Basic GPIO` · `FreeRTOS`, with a thin line from FreeRTOS to the interrupts card |

## 5 · Go
| VO | Visual |
|---|---|
| z1 "First up: PWM." | the PWM card grows to fill the frame: "next: PWM → `pwm`" |

## Open questions
1. **The speaker.** The PWM video just says "a speaker on GPIO 4". A passive piezo buzzer can go straight on the pin; a magnetic speaker needs a transistor. Which should the parts list say?
2. **The DAC card** shows `128 → ≈ 1.66 V` (3.3 × 128 / 255 ≈ 1.66 V; "≈" because Vref is the real supply). OK, or leave the number off until the `dac` video is researched?
