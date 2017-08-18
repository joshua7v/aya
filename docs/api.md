# API

```js
const { Aya } = require('@joshua7v/aya');

// es6
import { Aya } from '@joshua7v/aya';

const logger = new Aya();
const logger = new Aya({ showDate: false }); // construct with options
```

## options

```js
// default options:

//for browser
{
  showDate         : true,
  showFunctionName : false,
  showLevel        : true,
  showFileName     : false,
  showLineNumber   : false,
  showColumnNumber : false,
  dateFormat       : 'YYYY-MM-DD HH:mm:ss.SSS',
}

// for node:
{
  showDate         : true,
  showFunctionName : true,
  showLevel        : true,
  showFileName     : true,
  showLineNumber   : true,
  showColumnNumber : false,
  dateFormat       : 'YYYY-MM-DD HH:m:ss.SSS',
}
```

## levels

```js
trace
debug
info
warn
error
fatal
```
