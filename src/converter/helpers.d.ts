export declare function symbolMap(symbol: string, map: {
    /**
     * @example
     *
     * {
     *  'USDT': 'USD' //Replace USDT with USD
     * }
     */
    [currentSymbol: string]: string;
}, recurisve?: boolean): any;
export declare function getAverage(pairs: {
    [symbol: string]: number;
}[]): {};
export declare function formatNumber(n: number | string, decimals?: number): number;
export declare function isEmpty(obj: any): boolean;
export declare function isValidUrl(string: string): boolean;
export declare const isBrowser: Document;
