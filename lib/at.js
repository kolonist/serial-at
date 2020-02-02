'use strict';

const Serial   = require('serialport');
const Readline = Serial.parsers.Readline;


/**
 * Default options values to use in Port class constructor.
 * @const {object}
 */
const DEFAULT_PORT_OPTIONS = {
    baudRate : 115200,
    dataBits : 8,
    stopBits : 1,
    parity   : 'none',
    line_end : '\r\n',
    read_time: 1000
};


/**
 * Class serves connection to radio-module, sends AT-commands and receives
 * answers.
 */
class Port {
    /**
     * Create new Port object with given options.
     * @param {string} name Serial interface path (COM-port name), e.g.
     *                      '/dev/ttyUSB3' or 'COM3'.
     * @param {object} options Object with options to use in serial connection
     *                         and when sendining AT commands. Optional.
     *                         Awailable options:
     *                         baudRate  [default: 115200]
     *                         dataBits  [default: 8     ]
     *                         stopBits  [default: 1     ]
     *                         parity    [default: 'none']
     *                         line_end  [default: '\r\n']
     *                         read_time [default: 1000  ] - time to wait after
     *                                                       AT command send
     *                                                       before reading
     *                                                       answer, ms.
     */
    constructor (name, options = {}) {
        this.name    = name;
        this.options = Object.assign({}, DEFAULT_PORT_OPTIONS, options);
    }


    /**
     * Open serial port connection.
     * @return {Promise}
     */
    open () {
        return new Promise((resolve, reject) => {
            this.port = new Serial(this.name, this.options);

            this.port.on('open', ()   => void resolve()  );
            this.port.on('error', err => void reject(err));
        });
    }


    /**
     * Close serial port connection.
     * @return {Promise}
     */
    close () {
        return new Promise((resolve, reject) => {
            this.port.close(err => err ? reject(err) : resolve());
        });
    }


    /**
     * Send AT-command and read answer.
     * @param {string} command AT command to execute.
     * @param {string} read_until String which tells tha we need to stop reading. If
     *                            null given (default), stop reading by timeout.
     * @return {Promise} Resolves with string argument wich is answer read from
     *                   serial interface.
     */
    at (command, read_until = null) {
        return new Promise((resolve, reject) => {
            // we need this to measure time since last read to stop data waiting
            // when there are no more data
            let time = null;

            // read output
            let result = [];
            const reader = new Readline({delimiter: this.options.line_end});

            reader.on('data', chunk => {
                time = process.hrtime();
                result.push(chunk);

                // need to stop reading data
                if (read_until && chunk.trim() === read_until) {
                    this.port.unpipe();
                    resolve(result.join('\n'));
                }
            });

            this.port.pipe(reader);

            // send AT command
            this.port.write(`${command}${this.options.line_end}`, err => {
                if (err) return void reject(err);

                // wait until all data is transmitted to the serial port
                this.port.drain(err => {
                    if (!read_until) {
                        // stop if no data received from port for a long time
                        const interval = setInterval(
                            () => {
                                // no data read yet
                                if (time === null) return;

                                // calculate how much time lost sinse last data read
                                const diff = process.hrtime(time);
                                const diff_ms = diff[0] * 1000 + Math.round(diff[1] / 1000000);

                                // probably no more data
                                if (diff_ms > this.options.read_time) {
                                    clearInterval(interval);
                                    this.port.unpipe();
                                    resolve(result.join('\n'));
                                }
                            },
                            this.options.read_time
                        );
                    }
                });
            });
        });
    }
}

module.exports = Port;
