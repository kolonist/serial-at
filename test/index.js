'use strict';

const assert = require('assert');


// require lib
const Port = require('../lib/at.js');


describe('Port class', async () => {
    it('should execute AT command', async function() {
        this.timeout(10000);
        const port = new Port('/dev/ttyUSB3');
        await port.open();
        assert.equal(await port.at('AT'), 'OK');
        await port.close();
    });
});
