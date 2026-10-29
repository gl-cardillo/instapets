# Instapets project

<br/>

## Description:
---
This project is something similiar to instagram (with less functionalities of course) but for pets.
I used React and React Router and firebase for this project.

<br/>

## Functionalities:
---

- Create a profile.
- Signup login and logout.
- Search for pets.
- Add picture, with caption and time.
- change profile picture.
- Like pictures.
- Comment on pictures.
- Follow/Unfollow other pets.
- Check followers and following for each pets.
- Delete pictures.
- Delete comments.
- Delete users.

## Link
---
Check the [demo]( https://gl-cardillo.github.io/instapets/#/login) 

## Development
---

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Firebase web app config
3. `npm run dev` and open http://localhost:5173/instapets/

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`.
`npm run deploy` builds and publishes `dist/` to the `gh-pages` branch.
`npm test` runs the unit tests (components and helpers, in jsdom).
`npm run test:rules` runs the security rules tests in the Firestore emulator
(needs Java 11+).

Security rules live in `firestore.rules` (`firebase deploy --only firestore`).
Pictures are stored in Firestore (the `images` collection and `users.profilePic`),
because Firebase Storage requires the paid Blaze plan. The project runs on the
free Spark plan