# Success criteria

1. The deck shows “Card 1 of 4”, the word Front, and the first front string.
2. The page says the cards are synthetic and not a student’s deck.
3. Activating Flip shows the word Back and the first back string. Activating Flip again returns to the front.
4. Arrow Right, or Next, shows card 2 on its front. Previous is disabled on card 1. Next is disabled on card 4.
5. Arrow Right on card 4 stays on card 4. Arrow Left from card 2 returns to card 1 and the front.
6. Space or Enter on the card flips the side.
7. Under `prefers-reduced-motion: reduce`, the card’s computed transition duration is 0s, and the side text still changes.
