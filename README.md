# k6-html-reporter
A html reporter for k6

***Notes:***
The project is still under development


## Install

``` bash
npm install k6-html-reporter --save-dev
```



## Usage

1. Install the package
2. Create a js/ts file and specify the options:

```js

const reporter = require('k6-html-reporter');

const options = {
        jsonFile: <path-to-json-report>,
        output: <path-to-output-directory>,
    };

reporter.generateSummaryReport(options);
    
```

for typescript

```ts
import {generateSummaryReport} from 'k6-html-reporter';

const options = {
        jsonFile: <path-to-json-report>,
        output: <path-to-output-directory>,
    };

generateSummaryReport(options);
```
3. Run the k6 test with this command ```k6 run --summary-export=<path-to-json-report> <test-script>``` to output a json summary report
4. Run the code in step two as a node.js script after the test execution:
```bash
node xxxx.js
```