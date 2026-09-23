# QuoteScope

Contractor bids, finally comparable.

Three contractors, three totally different quotes - on purpose. QuoteScope lines them up against one shared scope, flags what each bid quietly left out (priced at the worst competitor rate so teaser totals stop winning), and calls out outlier line items that run far above the lowest bid.

## Use it

Open `index.html` for the landing page, or go straight to `app.html`.

Everything runs client-side; your bids are stored in the browser's localStorage. No account, no server.

## Files

- `index.html` - landing page
- `app.html` - the app
- `engine.js` - pure bid-normalization math, shared by the app and tests

Built by the hourly app factory.
