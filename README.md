# Description

Very simple library to execute AT commands in node.js. Uses Promises.

It uses [serialport](https://www.npmjs.com/package/serialport) node package under the hood, so it is crossplatform and could be used in both linux and windows.

# Installation

You can install it with this command:
```bash
npm install serial-at
```


# Usage

Usage is very simple (in example below we use async/await interface instead of plain promises):

```JavaScript
'use strict';

// require lib
const Port = require('serial-at');

(async function main() {
    // create serial connection
    const port = new Port({path:'/dev/ttyUSB3'});

    // open serial connection
    await port.open();

    // execute AT command and diaplay result
    console.log(await port.at('AT'));

    // close serial connection
    await port.close();
})();
```

All asynchronous functions in this library return Promises.


# Documentation
- [Port](#port)
- [constructor](#constructor-name--options)
- [open](#open)
- [close](#close)
- [at](#atcommand)

## `Port`
Class serves connection to radio-module, sends AT-commands and receives answers.

## `constructor (options)`
Create new Port object with given options.

### Parameters

**options**<br>
Key-value object with options to use in serial connection and when sendining AT commands.

**path** *[required]*<br>
Serial interface path (COM-port name), e.g. `/dev/ttyUSB3` or `COM3`.

#### Awailable options are:

**dataBits** *[optional, default: 8]*<br>
Must be one of these: 8, 7, 6, or 5.

**stopBits** *[optional, default: 1]*<br>
Must be one of these: 1 or 2.

**parity** *[optional, default: 'none']*<br>
Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.

**baudRate** *[optional, default: 115200]*<br>
The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.

**line_end** *[optional, default: '\r\n']*<br>
Line termination symbols to send after AT command. Commonly used `CRLF` (`'\r\n'`) line end, but some devices could support also `LF` (`'\n'`) line end.

**read_time** *[optional, default: 1000]*<br>
Time to wait after AT command send before reading answer in milliseconds. Increase this time if you do not get complete answers from serial port.


## `open()`
Opens a connection to the given serial port. Returns `Promise`.


## `close()`
Closes the opened connection. Returns `Promise`.


## `at(command)`
Sends AT-command and reads an answer. Returns `Promise`.

### Parameters
**command**
AT command to execute without line termination symbols.

### Example:
```JavaScript
// execute AT command and diaplay result
port
    // send AT command
    // note that we do not need to send 'AT\r\n'
    .at('AT')

    // get result of AT command execution
    .then(result => {
        console.log(result);
    })

    // handle possible errors
    .catch(err => console.log(err));
```

***

@license MIT\
@version 0.0.3\
@author Alexander Russkiy <developer@xinit.ru>
