### How to setup

1. Clone the repo
2. Create a file `secret.js` at the root of the project and add the following code:

```
const id = <ADD_SECRET_HERE>;

module.exports = { id };

```

3. Run `npm i && npm start`
4. Go to `http://localhost:8000` to open the graphql playground