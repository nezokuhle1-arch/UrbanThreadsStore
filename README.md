# Urban Threads

A trendy streetwear e-commerce store for young adults, built as a vanilla HTML/CSS/JavaScript project backed by Firebase (Firestore + Authentication).

**Live site:** https://urbnthrds.netlify.app/

## Features

- **Dynamic product catalog** — all products pulled live from Firestore, no hardcoded data
- **Category filtering & search** — filter by Hoodies, T-shirts, Sneakers, or Accessories; search bar in the nav redirects into the shop with results
- **Authentication** — email/password signup and login, plus Google Sign-In, via Firebase Authentication
- **Shopping cart** — add, adjust quantity, remove; persisted per-user in Firestore so it survives across sessions and devices
- **Wishlist** — heart-toggle on any product card, persisted per-user in Firestore, with a dedicated filter view
- **Mock checkout** — clears the cart and confirms the order (no real payment processing, out of scope for this project)
- **Responsive layout** — CSS Grid/Flexbox throughout, monochrome design system with a single reserved accent color for sale tags, errors, and the active wishlist state

## Tech stack

- HTML, CSS, JavaScript — no framework, no bundler, no build step.
- Firebase Firestore — product catalog, per-user cart/wishlist data.
- Firebase Authentication — email/password + Google Sign-In.
- 21st Dev - Used for log in design inspiration.
- Dribble.com - Used for website design ideas.
- Deployed on Netlify, connected directly to this GitHub repo.

## Project structure

urban-threads/
index.html → Landing page (hero, category tiles, featured products, trust row)
shop.html → Product listing, filters, search results
login.html → Sign in / create account
cart.html → Cart summary and checkout
css/
  style.css
js/
  firebase-config.js → Firebase init, exports db/auth/googleProvider
  navbar.js → Shared nav: auth status, cart count badge
  products.js → Product fetch/render, filtering, search, wishlist toggle, add-to-cart
  auth.js → Signup, login, Google sign-in, validation
  cart.js → Cart mutations, totals, mock checkout
  featured.js → "New drop" section on the homepage
assets/
  images/


## Firestore schema

products/{productId}
name: string
price: number
category: string → "Hoodies" | "T-shirts" | "Sneakers" | "Accessories"
description: string
imageURL: string

users/{uid}
email: string
displayName: string
cart: [ { productId, name, price, imageURL, quantity } ]
wishlist: [ productId, productId, ... ]


## Running locally

This project uses ES modules (`import`/`export`), which browsers block on the `file://` protocol — you can't just double-click `index.html`. Use a local server instead:

- **VS Code:** install the "Live Server" extension, right-click `index.html` → "Open with Live Server"
- **Terminal:** `npx serve .` from the project root, then open the printed `localhost` URL

## Deliverables

- **Git repo:** https://github.com/nezokuhle1-arch/UrbanThreadsStore.git
- **Live site:** https://urbnthrds.netlify.app/
- **Loom walkthrough:** Video pending - kind of struggling with my loom, i will find an alternative way and submit after by adding the link here.

## Notes

- Firestore security rules are locked down — `products` is public read-only, `users/{uid}` documents are readable/writable only by their owner.
- Checkout is a mock confirmation (clears the cart, shows a confirmation message) since a real payment gateway is outside this assignment's scope.
