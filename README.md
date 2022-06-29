# express-starter

## Test
### Library
```
jest
supertest
```

#### Running test one by one
Example: The following command only run the tests founds in the tests/note_api.js file
> npm test -- tests/notes_api.test.js

***-t*** option can be used for running tests with a specific test name
> npm test -- -t "Fetch all notes"

#### Notes
Eliminating the try-catch in Error handling with async-await, we can use lib
```
express-async-errors
```
