# Success criteria

1. The codes A1, A2, B1, B2, C1, and C2 are visible in that order.
2. The initial value is A2. The slider `aria-valuenow` is 1, `aria-valuemin` is 0, and `aria-valuemax` is 5.
3. `aria-valuetext` contains the selected code.
4. From A2, Arrow Right selects B1. Arrow Left then selects A1. A further Arrow Left stays on A1.
5. End selects C2. Home selects A1.
6. Activating the button named B2 selects B2, and the text “Selected level” shows B2.
7. The page contains the words “Sample control. Not a learner record.”
8. Under `prefers-reduced-motion: reduce`, the needle’s computed transition duration is 0s. The selected code is still in the text without waiting for motion.
