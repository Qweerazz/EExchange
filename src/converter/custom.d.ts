declare class CustomWorkers {
    ticker: {
        [pair: string]: number;
    };
    list: string[];
    private workers;
    private workersPromises;
    constructor();
    ready(): Promise<any[]>;
    addCurrency(base: string, quote: string, getter: () => number | Promise<number>, interval?: number): Promise<void>;
    removeCurrency(base: string, quote?: string): void;
}
export default CustomWorkers;
