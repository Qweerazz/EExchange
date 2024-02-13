/*!
 * crypto-convert (c) 2022
 * Author: Elis
 * License: https://github.com/coinconvert/crypto-convert
 */
import PricesWorker, { Options } from "./worker";
import { Pairs } from './paris';
interface ExtendedOptions extends Options {
    /**
     * The converted value number precision
     */
    precision?: {
        /**
         * Default 4
         */
        fiat?: number;
        /**
         * Default 8
         */
        crypto?: number;
    };
}
declare class CryptoConvert {
    #private;
    private worker;
    private internalMethods;
    private workerReady;
    private precision;
    constructor(options?: ExtendedOptions);
    /**
     * Quick check if cache has loaded.
     */
    get isReady(): boolean;
    /**
     * Supported currencies list
     */
    get list(): {
        crypto: string[];
        fiat: string[];
    };
    /**
     * Metadata information about cryptocurrencies
     */
    get cryptoInfo(): {
        [crypto: string]: {
            /**
             * Recursively creates the conversion wrapper functions for all the currencies.
             */
            id: number;
            symbol: string;
            title: string;
            logo: string;
            rank: number;
        };
    };
    /**
     * Get crypto prices last updated ms
     */
    get lastUpdated(): any;
    /**
     * Price Tickers
     */
    get ticker(): {
        crypto: {
            last_updated: any;
            current: any;
        };
        fiat: {
            last_updated: any;
            current: any;
        };
    };
    /**
     * Update options
     */
    setOptions(options: ExtendedOptions): PricesWorker | Promise<PricesWorker>;
    /**
     * Stop the worker.
     *
     * It's recommended to do this on Component unmounts (i.e if you are using React).
     */
    stop(): PricesWorker;
    /**
     * Re-start the worker when it has been stopped.
     */
    restart(): Promise<false | PricesWorker>;
    /**
     * Promise function that resolves when cache has loaded.
     */
    ready(): Promise<this>;
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
    addCurrency(base: string, ...rest: any): Promise<void>;
    /**
     * Remove custom currency fetcher.
     */
    removeCurrency(base: string, quote?: string): void;
}
/**
 * Convert crypto to fiat and vice-versa.
 *
 * @example
 * ```javascript
 * convert.BTC.USD(1);
 * convert.USD.BTC(1);
 * convert.BTC.ETH(1);
 * convert.ETH.JPY(1);
 * convert.USD.EUR(1);
 * ```
 *
 * @see {@link https://github.com/coinconvert/crypto-convert Documentation}
 *
 */
interface CryptoConvert extends Pairs {
}
export default CryptoConvert;
