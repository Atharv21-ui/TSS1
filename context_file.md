# Context File

## Changes Made
- Added a new `StoreInfo` component that integrates Google Maps iframe and live google reviews data.
- The `StoreInfo` component was styled inline and with updated CSS in `App.css` to match the existing dark mode, neon color palette, typography and layout (using bento-grid styles).
- Included the `StoreInfo` component in `Home.tsx` to render at the bottom of the home page.
- Fixed an unused import warning for React in `StoreInfo.tsx`.

## Current File Structure
```
g:/TSS/src/
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── assets/
├── components/
│   ├── AnimatedButton.tsx
│   ├── StoreInfo.tsx      <-- [NEW] Added StoreInfo component
│   └── ui/
├── context/
├── hooks/
├── lib/
└── pages/
    ├── Home.tsx           <-- [MODIFIED] Added StoreInfo integration
    └── ... (other pages)
```
