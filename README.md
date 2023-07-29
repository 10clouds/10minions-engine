## How to test?

Firstly, you need to evaluate what kind of test you want to run.\
There are three types of tests:

- createProcedure\
   In most cases we do those tests when something with procedure is wrong,
  but modification is correct.
  This is deterministic test.
- replaceProcedure\
  In most cases we do those tests when something with result is wrong,
  but modification and procedure is correct.
  This is deterministic test.
- score
  In most cases we do those tests when something with modification is wrong,
  but procedure and result is correct.
  This is nondeterministic test.

**Before running test run script that wile prepare test files for particular minionTask**

To generate files for particular minionTask set in config relevant minionTask id and name of your test:

```typescript
const config: TestConfig = {
  id: "", // pass id of minionTask from firestore
  testName: "", // name your test
  testType: TestType.REPLACE_PROCEDURE,
  withSelectedText: false, // if you want include selectedText in your score test files set this to true
  language: "typescript", // set language that is used in your test
};
```

```bash
yarn prepareTest
```

This script will generate files depends on what type of test you choose.
For `createProcedure` and `replaceProcedure` it will generate files:

- original.txt\
   this file contains original text from users file it is placed in originalText column in firestore
- procedure.txt\
   this file contains procedure that is generated by 10Minions it is placed in modificationProcedure column in firestore
- result.txt\
  which contains expected result of your test (content of thi file is take from finalContent column and it needs to be adjusted to your test)

for `createProcedure` it will also generate file:

- modification.txt\
   which contains modification description - it describes steb by step what kind of modification was done to original text
  it cames from modificationDescription column in firestore

For `score` it will generate files:\

- [test name].[extension 'ts' or 'js'].original.txt
- [test name].[extension 'ts' or 'js'].userQuery.txt
- [test name].[extension 'ts' or 'js'].tests.json
- [test name].[extension 'ts' or 'js'].selectedText.txt - optional\
  in this file you can define your tests

  ```json
  [{ "type": "gptAssert", "mode": "FAST", "assertion": "The code is valid typescript code" }]
  ```

  mode can be set to `FAST` or `QUALITY`

  `QUALITY` is for GPT-4

  `FAST` is for GPT-3.5

  in assertion you can define expectations what should be returned from GPT\
  eg. 'Import has been defined at the beginig of the file'

To run `createProcedure` and `replaceProcedure` test you need to run command:

```bash
yarn test
```

if you want to run just one test at time just set `grep` in your config to your test name.

The config is located in `src/test/runTest.ts`

```typescript
const mocha = new Mocha({
  grep: "Your test name",
});
```

To run `score` test you need to run command:

```bash
yarn score
```

The score tests always return score measured in percents.\

`runScore` script takes as second argument `iterations`

```typescript
async function runTest({ fileName, iterations = 10 });
```

Calculating score:

```typescript
const score = (iterations - failedTestsNumber) / iterations;
```

where `failed` is number of unpassed tests.

The score tests are non-determinstic,

**Non-determinism basically stands for flickering tests. These are tests that pass most of the time but fail once in a while and then if you try to run them one more time - turn green again.**