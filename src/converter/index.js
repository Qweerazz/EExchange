"use strict";
/*!
 * crypto-convert (c) 2022
 * Author: Elis
 * License: https://github.com/coinconvert/crypto-convert
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _CryptoConvert_instances, _CryptoConvert_getPrice, _CryptoConvert_wrapper, _CryptoConvert_isSafeKey, _CryptoConvert_setExtendedOptions, _CryptoConvert_populate;
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const worker_1 = __importDefault(require("./worker"));
const custom_1 = __importDefault(require("./custom"));
const customWorkers = new custom_1.default();
class CryptoConvert {
    constructor(options = {}) {
        _CryptoConvert_instances.add(this);
        this.precision = {
            fiat: 4,
            crypto: 8
        };
        if (helpers_1.isBrowser) {
            if (window['__ccInitialized']) {
                throw new Error("You have already initalized one instance of crypto-convert. You cannot initialize multiple instances.");
            }
            window['__ccInitialized'] = true;
        }
        __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_setExtendedOptions).call(this, options);
        this.worker = new worker_1.default(options);
        this.workerReady = this.worker.run();
        this.internalMethods = Object.getOwnPropertyNames(CryptoConvert.prototype);
        Promise.resolve(this.workerReady).then(() => {
            __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_populate).call(this);
            this.worker.onCryptoListRefresh = () => {
                __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_populate).call(this);
            };
        });
    }
    ;
    /**
     * Quick check if cache has loaded.
     */
    get isReady() {
        return this.worker.isReady;
    }
    /**
     * Supported currencies list
     */
    get list() {
        return {
            'crypto': this.worker.list.crypto.concat(customWorkers.list),
            'fiat': this.worker.list.fiat
        };
    }
    /**
     * Metadata information about cryptocurrencies
     */
    get cryptoInfo() {
        return this.worker.cryptoInfo;
    }
    /**
     * Get crypto prices last updated ms
     */
    get lastUpdated() {
        return this.worker.data.crypto.last_updated;
    }
    /**
     * Price Tickers
     */
    get ticker() {
        return this.worker.data;
    }
    /**
     * Update options
     */
    setOptions(options) {
        __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_setExtendedOptions).call(this, options);
        const workerIntervalChanged = (options.cryptoInterval || options.fiatInterval) && (options.cryptoInterval !== this.worker.options.cryptoInterval ||
            options.fiatInterval !== this.worker.options.fiatInterval);
        if (workerIntervalChanged ||
            (options.hasOwnProperty('refreshCryptoList') && options.refreshCryptoList !== this.worker.options.refreshCryptoList) ||
            (options.hasOwnProperty('useHostedAPI') && options.useHostedAPI !== this.worker.options.useHostedAPI) ||
            (options.listLimit && options.listLimit != this.worker.options.listLimit)) {
            if (!this.worker.isReady) {
                throw new Error("You cannot set these options here because CryptoConvert is not ready yet. Instead set the options on the constructor parameter.");
            }
            //Restart the worker in order to clear interval & update to new interval
            this.workerReady = Promise.resolve(this.worker.setOptions(options))
                .then(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.worker.restart();
                    if (options.listLimit) {
                        __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_populate).call(this);
                    }
                    return this.worker;
                }));
            return this.worker;
        }
        return this.worker.setOptions(options);
    }
    /**
     * Stop the worker.
     *
     * It's recommended to do this on Component unmounts (i.e if you are using React).
     */
    stop() {
        return this.worker.stop();
    }
    /**
     * Re-start the worker when it has been stopped.
     */
    restart() {
        this.workerReady = this.worker.restart();
        return this.workerReady;
    }
    /**
     * Promise function that resolves when cache has loaded.
     */
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve(this.workerReady);
            yield Promise.resolve(customWorkers.ready());
            return this;
        });
    }
    /**
     * Add a custom currency fetcher. Can be anything.
     *
     * @example
     * ```javascript
     * convert.addCurrency('ANY','USD', async fetchPrice()=>{
     * 		//...call your api here
     * 		return price;
     * }, 10000);
     * ```
     */
    addCurrency(base, ...rest) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasOwnProperty(base) && base != "RUB") {
                throw new Error("This property already exists.");
            }
            return Promise.resolve(customWorkers.addCurrency.apply(customWorkers, [base, ...rest])).then(() => {
                if (this.worker.isReady) {
                    __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_populate).call(this);
                }
            });
        });
    }
    ;
    /**
     * Remove custom currency fetcher.
     */
    removeCurrency(base, quote) {
        var _a, _b;
        if (customWorkers.list.includes(base) && __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_isSafeKey).call(this, base)) {
            delete this[base];
            const all_currencies = this.worker.list.crypto.concat(this.worker.list.fiat, customWorkers.list);
            for (const currency of all_currencies) {
                if ((_a = this[currency]) === null || _a === void 0 ? void 0 : _a[base]) {
                    (_b = this[currency]) === null || _b === void 0 ? true : delete _b[base];
                }
            }
        }
        return customWorkers.removeCurrency(base, quote);
    }
}
_CryptoConvert_instances = new WeakSet(), _CryptoConvert_getPrice = function _CryptoConvert_getPrice(coin, to = 'USD') {
    var customResult = customWorkers.ticker[coin + to] || (customWorkers.ticker[to + coin] ? 1 / customWorkers.ticker[to + coin] : null);
    var result = this.worker.data.crypto.current[coin + to] || (this.worker.data.crypto.current[to + coin] ? 1 / this.worker.data.crypto.current[to + coin] : null);
    return customResult || result;
}, _CryptoConvert_wrapper = function _CryptoConvert_wrapper(coin, currency) {
    var coin = coin;
    var toCurrency = currency;
    const doExchange = (function (fromAmount) {
        if ((0, helpers_1.isEmpty)(this.worker.data.crypto.current) || (0, helpers_1.isEmpty)(this.worker.data.fiat.current)) {
            console.warn("[~] Prices are loading.\nYou should use `await convert.ready()` to make sure prices are loaded before calling convert.");
            return false;
        }
        if (!fromAmount) {
            return false;
        }
        fromAmount = (0, helpers_1.formatNumber)(fromAmount);
        if (isNaN(fromAmount)) {
            return false;
        }
        const fiatCurrencies = this.worker.data.fiat.current;
        const cryptoCurrenciesList = this.worker.list.crypto.concat(customWorkers.list);
        //Same
        if (toCurrency == coin) {
            return fromAmount;
        }
        //Crypto to Crypto
        if (cryptoCurrenciesList.includes(coin) && cryptoCurrenciesList.includes(toCurrency)) {
            let exchangePrice = __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_getPrice).call(this, coin, toCurrency) ||
                __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_wrapper).call(this, "USD", toCurrency)(__classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_wrapper).call(this, coin, "USD")(1));
            return (0, helpers_1.formatNumber)(exchangePrice * fromAmount, this.precision.crypto);
        }
        //Fiat to Fiat
        if (fiatCurrencies[coin] && fiatCurrencies[toCurrency]) {
            return (0, helpers_1.formatNumber)(((fromAmount / fiatCurrencies[coin]) * fiatCurrencies[toCurrency]), this.precision.fiat);
        }
        //Crypto->Fiat || Crypto->BTC->Fiat
        var getCryptoPrice = (function (coin) {
            var coinPrice = __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_getPrice).call(this, coin) ||
                __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_wrapper).call(this, "BTC", "USD")(__classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_getPrice).call(this, coin, "BTC")) ||
                __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_wrapper).call(this, "ETH", "USD")(__classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_getPrice).call(this, coin, "ETH"));
            return coinPrice;
        }).bind(this);
        //Crypto to Fiat
        if (fiatCurrencies[toCurrency]) {
            let usdPrice = getCryptoPrice(coin);
            let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[toCurrency]; //Convert USD to chosen FIAT
            return (0, helpers_1.formatNumber)(exchangePrice * fromAmount, this.precision.crypto);
        }
        //Fiat to Crypto
        if (fiatCurrencies[coin]) {
            let usdPrice = getCryptoPrice(toCurrency);
            let exchangePrice = (usdPrice / fiatCurrencies['USD']) * fiatCurrencies[coin]; //Convert USD to chosen FIAT
            return (0, helpers_1.formatNumber)(fromAmount / exchangePrice, this.precision.crypto);
        }
        return null;
    }).bind(this);
    return doExchange;
}, _CryptoConvert_isSafeKey = function _CryptoConvert_isSafeKey(key) {
    const functionProto = function () { };
    return (!this.internalMethods.includes(key) &&
        !key.startsWith('__') &&
        !functionProto[key]);
}, _CryptoConvert_setExtendedOptions = function _CryptoConvert_setExtendedOptions(options) {
    if (options.precision) {
        for (const precisionKey in options.precision) {
            if (["crypto", "fiat"].includes(precisionKey) && typeof options.precision[precisionKey] == "number") {
                this.precision[precisionKey] = options.precision[precisionKey];
            }
        }
    }
}, _CryptoConvert_populate = function _CryptoConvert_populate() {
    let types = '';
    //Generate typescript interface
    types += `type amount = (amount: number | string) => number | false | null;`;
    types += '\nexport interface Pairs {';
    const all_currencies = this.worker.list.crypto.concat(this.worker.list.fiat, customWorkers.list);
    for (var i = 0; i < all_currencies.length; i++) {
        var coin = all_currencies[i];
        if (!coin || typeof coin !== "string" || !__classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_isSafeKey).call(this, coin)) {
            continue;
        }
        if (!this[coin]) {
            this[coin] = {};
        }
        types += `\n\t'${coin.replace(/\'/g, "\\'")}': {`;
        for (var a = 0; a < all_currencies.length; a++) {
            var currency = all_currencies[a];
            if (!currency || typeof currency !== "string" || !__classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_isSafeKey).call(this, coin)) {
                continue;
            }
            this[coin][currency] = __classPrivateFieldGet(this, _CryptoConvert_instances, "m", _CryptoConvert_wrapper).call(this, coin, currency);
            types += `\n\t\t'${currency.replace(/\'/g, "\\'")}': amount,`;
        }
        types += '\n},';
    }
    types += '\n}';
    //Create types file for Node.js. With Runtime types generation ^^
    if (typeof window === "undefined" && typeof module !== "undefined" && typeof process !== "undefined") {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // Here we save the types file. Using eval because static linting checks on frontend apps are annoying af.
                    eval(`
						const fs = require('fs');
						const path = require('path');
						const isDist = path.basename(__dirname) == 'dist';
						const typesFile = path.join(__dirname, isDist ? 'paris.d.ts' : 'paris.ts');

						fs.writeFileSync(typesFile, types, 'utf-8');
					`);
                }
                catch (err) {
                    console.warn(err);
                }
            });
        })();
    }
};
//@ts-ignore
CryptoConvert.default = CryptoConvert;
if (typeof module !== "undefined" && module.exports) {
    module.exports = CryptoConvert;
}
exports.default = CryptoConvert;
