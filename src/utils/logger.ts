const fs = require('fs');

export function log(message: string) {
    const timestamp = new Date().toLocaleString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);

    fs.appendFile('logs.txt', log + '\n', function (err) {
        if (err) throw err;
    });
}

export function error(message: string) {
    log(`[ERROR] ${message}`);
}
