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
2. Create an index.js and specify the options:

```js

const reporter = require('k6-html-reporter');

const options = {
        jsonFile: <path-to-json-report>,
        output: <path-to-output-directory>,
    };

reporter.generateSummaryReport(options);
    
```
3. Run the k6 test and make sure to output the summary report to a json file by doing ```k6 run --summary-export=<path-to-json-report> <test-script>```
3. Run the above code in a node.js script after execution:
```bash
node index.js
```