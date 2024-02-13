"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("./worker");
class CustomWorkers {
    constructor() {
        this.ticker = {};
        this.list = [];
        this.workers = {};
        this.workersPromises = [];
        //nothing
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.workersPromises);
        });
    }
    addCurrency(base, quote, getter, interval) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof base !== "string" || typeof quote !== "string" || !worker_1.initialCoinList.fiat.includes(quote)) {
                throw new Error("Invalid currency pair.");
            }
            if (typeof getter !== "function") {
                throw new Error("No function specified.");
            }
            base = base.toUpperCase(),
                quote = quote.toUpperCase();
            if (this.ticker[base + quote] || this.ticker[quote + base] || this.list.indexOf(base) != -1) {
                console.warn(`This custom currency already exists, it will be overriden.`);
                this.removeCurrency(base);
            }
            this.list.push(base);
            if (interval) {
                if (typeof interval !== "number") {
                    throw new Error("Invalid interval specfied.");
                }
                this.workers[base + quote] = setInterval(() => {
                    return Promise.resolve(getter())
                        .then((value) => {
                        this.ticker[base + quote] = Number(value);
                    });
                }, interval);
            }
            const currentPromise = Promise.resolve(getter())
                .then((value) => {
                this.ticker[base + quote] = Number(value);
            });
            this.workersPromises.push(currentPromise);
            return currentPromise;
        });
    }
    removeCurrency(base, quote) {
        base = base.toUpperCase(),
            quote = quote ? quote.toUpperCase() : '';
        for (const worker in this.workers) {
            if (worker.includes(base + quote)) {
                clearInterval(this.workers[worker]);
                delete this.ticker[worker];
            }
        }
        this.list = this.list.filter((v) => v !== base);
    }
}
exports.default = CustomWorkers;
