# Testing

This project uses mocha and nyc to test. You can run the tests using:

```sh
npm test
```

```
npm run coverage
```

To test, this project uses a non-exported patch of `ink-testing-library` available [here](/src/patch/ink-testing-library.js) that uses the neccessary fork, however, this will be removed when no longer necessary. The [test-utils](/src/test-utils.js) file also contains functions used to test components. For testing your own code, I recommend copying these files into your project.
