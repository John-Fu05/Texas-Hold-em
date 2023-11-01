Change log:

## 10/31/2023

Removed unused commented code from both files.

## index.html

Renamed button_1-4 to ready,check,fold, and bet.

Rewrote disableCheckButton, disableReadyButton, sendBet, sendFold, onTurn, game start, and reset game functions to reduce redundant code using new helper functions: clearDisplay and disableButtons.

Cleaned up display cards code into one display function.

## index.js

Moved User class into its own file.
Changed some function calls to reflect changes in index.html.
