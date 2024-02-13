import { Strings } from "../strings";
import { BillingTypes, ChatData } from "./structs";
import NodeCache from 'node-cache';
import CryptoConvert from './converter/index';
import { RateLimiter } from "./Bot/utils/RateLimiter";
import { BillingWorker } from "./Bot/utils/BillingWorker";
import { Connector } from "./Bot/utils/_MenusConnector";

class ConfigManager {
    static Active: boolean = true;
    static bill: string;

    static admins: string[] = [];
    static chats: ChatData[] = [];
    static activeChat: string;

    static UsersCache: NodeCache;
    static RequestsCache: NodeCache;

    static ChacheUserSaveTimeout: number = 5 * 60;

    static strings: Strings;
    static converter: CryptoConvert;

    static billings: BillingWorker;

    static helpLink: string = '';
    static rateLimiter: RateLimiter;

    static myID: string;
    static connector = new Connector();
}

export { ConfigManager };