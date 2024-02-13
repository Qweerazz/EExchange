class RateLimiter {

    tokens: number = 20;
    tokenAwaiters: Function[] = [];
    interval: NodeJS.Timeout;
    constructor() {
        this.interval = setInterval(() => {
            this.tokens = 20;
            if (this.tokenAwaiters.length > 0) {
                for (; this.tokens > 0;) {
                    let callback = this.tokenAwaiters.shift();
                    if (!callback) {
                        break;
                    }
                    callback();
                    this.tokens--;
                }
            }
        }, 1000);
    }

    async getToken() {
        if (this.tokens > 0) {
            this.tokens--;
            return;
        }

        await new Promise((res) => {
            this.tokenAwaiters.push(() => {
                res(true);
            })
        });

        return;
    }
}

export { RateLimiter };