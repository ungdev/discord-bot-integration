const fs = require('fs');

export function log(message: string) {
    const timestamp = new Date().toLocaleString(undefined, {
        timeZone: 'Europe/Paris',
        hour12: false,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const log = `[${timestamp}] ${message}`;
    console.log(log);

    fs.appendFile(__dirname + '/../data/logs.txt', log + '\n', function (err) {
        if (err) {
            console.log(`[FATAL ERROR] ${err}`);
        }
    });
}

export function error(message: string) {
    log(`[ERROR] ${message}`);
}
