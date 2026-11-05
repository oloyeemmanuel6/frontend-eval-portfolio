# Verification

```
npm ci
npx playwright test e2e/highlighter.spec.ts
```

Manual pass, after `npm run dev`:

1. Open `/samples/error-highlighter`.
2. Read the text equivalent for sample 1. “was play” is marked, and the note is in the list.
3. Tab to the sample list. Press Arrow Down. Sample 2’s two marks are in the text equivalent.
4. Press End, then Home.
5. Confirm the canvas region is labelled as a rendering and that the equivalent remains available with the canvas ignored by assistive technology (`aria-hidden`).
