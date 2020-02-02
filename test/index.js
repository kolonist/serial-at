'use strict';

const assert = require('assert');


// require lib
const Port = require('../lib/at.js');


describe('Port class', async () => {
    it('should execute AT command', async function() {
        this.timeout(10000);
        const port = new Port('/dev/ttyACM0');
        await port.open();
        await port.at('ATE0')
        assert.equal(await port.at('AT', 'OK'), 'OK');
        await port.close();
    });
});
