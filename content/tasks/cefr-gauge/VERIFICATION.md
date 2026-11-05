# Verification

From a clean checkout:

```
npm ci
npx playwright test e2e/cefr-gauge.spec.ts
```

Manual pass, after `npm run dev`:

1. Open `/samples/cefr-gauge`.
2. Confirm the visible selection is A2 and the sample line is present.
3. Tab to the slider. Press Arrow Right once. The text reads B1.
4. Press End. The text reads C2. Press Home. The text reads A1.
5. Activate the B2 button. The text reads B2.
6. With reduced motion enabled in the browser, repeat step 3. The code changes at once.

The criteria file is the contract. A difference in pixel colour from the mockup is not a failure.
