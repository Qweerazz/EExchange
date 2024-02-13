import https from 'https';
import http from 'http';
import { Readable } from 'stream';

class requests {
    static async request(options: https.RequestOptions, body?: string): Promise<{ headers: http.IncomingHttpHeaders, data: string, statusCode: number }> {
        return new Promise((resolve, reject) => {
            let req = https.request(options, (res) => {
                res.setEncoding('utf8');

                let body = '';
                res.on('data', function (chunk) {
                    body = body + chunk;
                });

                res.on('end', function () {
                    resolve({ headers: res.headers, data: body, statusCode: res.statusCode });
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            if (body) {
                req.write(body);
            }
            req.end();
        });
    }

    static async requestStream(options: https.RequestOptions, body?: string): Promise<{ headers: http.IncomingHttpHeaders, statusCode: number, stream: Readable }> {
        const stream = new Readable({ highWaterMark: 1024 * 1024 });
        stream._read = () => { };
        return new Promise((resolve, reject) => {
            let req = https.request(options, (res) => {
                resolve({ headers: res.headers, stream: stream, statusCode: res.statusCode })

                res.on('data', function (chunk) {
                    stream.push(chunk); //?
                });

                res.on('end', function () {
                    stream.push(null); //?
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
}

export { requests };