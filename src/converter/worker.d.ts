export interface Options {
    /**
     * Crypto prices update interval in ms (Default: 5s Node.js/15s browsers)
     */
    cryptoInterval?: number;
    /**
     * Fiat prices update interval in ms (Default: 1 hour) `[server-side only]`
     */
    fiatInterval?: number;
    /**
     * Calculate Average prices from multiple exchanges (Default: true)
     */
    calculateAverage?: boolean;
    /**
     * Fetch prices from Binance (Default: true)
     */
    binance?: boolean;
    /**
     * Fetch prices from Coinbase (Default: true)
     */
    coinbase?: boolean;
    /**
     * Fetch prices from Bitfinex (Default: true)
     */
    bitfinex?: boolean;
    /**
     * Fetch prices from Kraken (Default: true)
     */
    kraken?: boolean;
    /**
     * Callback to call on prices update
     */
    onUpdate?: (tickers: any, isFiat?: boolean) => any;
    /**
     * Use a custom server on the browsers side (default: https://api.coinconvert.net)
     */
    serverHost?: string;
    /**
     * The behaviour when disabling exchanges (default: saveLastCache) `[server-side only]`
     *
     * - `"saveAllCache"`: Rates are not used on conversions but all the exchanges are still polled and cached internally so you can enable/disable exchanges seamlessly.
     * - `"saveLastCache"`: Disabled exchanges are not polled and saved on cache. When switching between enabled/disabled the last cache will be used until prices/cache is updated on the next interval.
     * - `"noCache"`: Exchanges are not polled and saved on cache when disabled, though when switching between enabled/disabled the prices will be updated by making new requests to the exchanges.
     */
    disableExchangeMode?: "saveAllCache" | "saveLastCache" | "noCache";
    /**
     * Use the hosted version of the API on server-side as well, instead of using the multiple exchanges API directly. `[server-side only]`
     */
    useHostedAPI?: boolean;
    /**
     * Refreshes crypto list. `[server-side only]`
     */
    refreshCryptoList?: boolean;
    /**
     * Change the number of supported cryptocurrencies. (Max: 1000) `[server-side only]`
     */
    listLimit?: number;
    /**
     * HTTP agent for proxies support. `[server-side only]`
     */
    HTTPAgent?: any;
}
export interface Tickers {
    crypto: {
        last_updated: number | null;
        current: {
            [symbol: string]: number;
        } | null;
        binance?: {
            [symbol: string]: number;
        };
        bitfinex?: {
            [symbol: string]: number;
        };
        coinbase?: {
            [symbol: string]: number;
        };
        kraken?: {
            [symbol: string]: number;
        };
    };
    fiat: {
        last_updated: number | null;
        current: null | {
            USD: number;
            JPY: number;
            BGN: number;
            CZK: number;
            DKK: number;
            GBP: number;
            HUF: number;
            PLN: number;
            RON: number;
            SEK: number;
            CHF: number;
            ISK: number;
            NOK: number;
            HRK: number;
            RUB: number;
            TRY: number;
            AUD: number;
            BRL: number;
            CAD: number;
            CNY: number;
            HKD: number;
            IDR: number;
            ILS: number;
            INR: number;
            KRW: number;
            MXN: number;
            MYR: number;
            NZD: number;
            PHP: number;
            SGD: number;
            THB: number;
            ZAR: number;
            EUR: number;
        };
    };
}
export declare const initialCoinList: {
    crypto: string[];
    fiat: string[];
};
declare class PricesWorker {
    exchanges: string[];
    list: {
        crypto: string[];
        fiat: string[];
    };
    cryptoInfo: {
        [crypto: string]: {
            id: number;
            symbol: string;
            title: string;
            logo: string;
            rank: number;
        };
    };
    data: {
        crypto: {
            last_updated: any;
            current: any;
        };
        fiat: {
            last_updated: any;
            current: any;
        };
    };
    options: Options;
    isReady: boolean;
    isRunning: boolean;
    private fiat_worker;
    private crypto_worker;
    private lists_worker;
    private hostedAPI;
    onCryptoListRefresh: (list: any) => any;
    private log;
    constructor(o?: Options | ((currentOptions: Options) => Options));
    /**
     * Options
     */
    setOptions(o?: Options | ((currentOptions: Options) => Options)): this | Promise<this>;
    get isCustomServerHost(): boolean;
    updateCrypto(): Promise<this>;
    updateFiat(): Promise<this>;
    updateLists(): Promise<this>;
    joinPrices(data: Tickers): {};
    browserTicker(): Promise<this>;
    browserLists(): Promise<this>;
    runBrowser(): Promise<false | this>;
    runServer(): Promise<false | this>;
    run(): Promise<false | this>;
    stop(): this;
    restart(): Promise<false | this>;
}
export default PricesWorker;
