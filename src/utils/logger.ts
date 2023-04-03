const fs = require('fs');

export function log(message: string) {
    const timestamp = new Date().toLocaleString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);

    fs.appendFile(__dirname + '/../../logs.txt', log + '\n', function (err) {
        if (err) {
            console.log(`[FATAL ERROR] ${err}`);
        }
    });
}

export function error(message: string) {
    log(`[ERROR] ${message}`);
}
