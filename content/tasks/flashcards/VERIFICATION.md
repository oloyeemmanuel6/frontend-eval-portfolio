# Verification

```
npm ci
npx playwright test e2e/flashcards.spec.ts
```

Manual pass, after `npm run dev`:

1. Open `/samples/flashcards`.
2. Read card 1, front. Tab to the card. Press Space. The back text is visible and the kicker says Back.
3. Press Arrow Right. Card 2 is on the front.
4. Press Arrow Left until Previous is disabled. The first front is back.
5. Move to card 4 and confirm Next is disabled.
6. Repeat the flip with reduced motion on. The word Back appears without a required animation.
