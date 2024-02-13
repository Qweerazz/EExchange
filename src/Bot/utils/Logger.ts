function StringifyError(err: any) {
    let copy = { ...err };
    if (err.message) {
        copy.message = err.message;
    }
    if (err.name) {
        copy.name = err.name;
    }
    if (err.stack) {
        copy.stack = err.stack;
    }

    return copy;
}


type errorLogFunc = (location: string, message: string, date: Date, additionalData: any) => void;
type infoLogFunc = (location: string, message: string, date: Date, additionalData?: any) => void;

class Logger {
    static errorLogs: errorLogFunc[] = [];
    static infoLogs: infoLogFunc[] = [];

    static setDefaultConsole() {
        Logger.infoLogs.push((location: string, message: string, date: Date, additionalData?: any) => {
            console.log(`INFO//${date.toLocaleTimeString()}//${location}:${message}`);
            if (additionalData) {
                console.log(additionalData);
            }
        });

        Logger.errorLogs.push((location: string, message: string, date: Date, additionalData: any) => {
            console.log(`ERROR//${date.toLocaleTimeString()}//${location}:${message}`);
            if (additionalData) {
                console.log(additionalData);
            }
        });
    }

    static info(location: string, log: string, additionalData?: any) {
        for (let x of Logger.infoLogs) {
            x(location, log, new Date(), (additionalData && StringifyError(additionalData)));
        }
    }
    static error(location: string, message: string, additionalData: any) {
        for (let x of Logger.errorLogs) {
            x(location, message, new Date(), StringifyError(additionalData));
        }
    }
}

export { Logger };