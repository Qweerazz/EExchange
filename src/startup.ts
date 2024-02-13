import { Telegraf } from "telegraf";
import { ConfigManager } from "./ConfigManager";
import { Logger } from "./Bot/utils/Logger";
import { SqliteStorage } from "./Storage/SqliteStorage";
import { ChatStatuses, ConfigNames, getConfirmButtons, getCurrenciesButtons } from "./structs";
import { BotMenu } from "./Bot/BotMenu";
import * as cache from 'node-cache';
import { Strings } from "../strings";
import CryptoConvert from './converter/index';
import { RateLimiter } from "./Bot/utils/RateLimiter";
import { requests } from "./Bot/utils/Requests";
import { BillingWorker } from "./Bot/utils/BillingWorker";
import { HttpsProxyAgent } from "https-proxy-agent";

const logLocation = 'start';
const start = async (token: string, dbPath: string) => {
    ConfigManager.UsersCache = new cache.default({ checkperiod: ConfigManager.ChacheUserSaveTimeout, deleteOnExpire: true, useClones: false });
    ConfigManager.RequestsCache = new cache.default({ checkperiod: ConfigManager.ChacheUserSaveTimeout, deleteOnExpire: true, useClones: false });
    ConfigManager.strings = new Strings();
    getCurrenciesButtons(ConfigManager.strings.currencies);
    getConfirmButtons(ConfigManager.strings.ButtonTextConfirm, ConfigManager.strings.ButtonTextCancel);
    ConfigManager.converter = new CryptoConvert();
    await ConfigManager.converter.ready();
    await ConfigManager.converter.addCurrency('RUB', 'USD', async () => {
        let data = await requests.request({ host: 'www.cbr-xml-daily.ru', path: '/latest.js', method: 'GET' });
        try {
            let tmp = JSON.parse(data.data);
            let currency = tmp['rates']['USD'];
            return currency;
        } catch (ex) {
            Logger.error(logLocation, 'Get currencies failed(RUB)', ex);
        }

        return 0.01110038;
    });
    await ConfigManager.converter.addCurrency('BSC', 'USD', async () => {
        return 0.0164;
    });
    await ConfigManager.converter.addCurrency('AVA', 'USD', async () => {
        let data = await requests.request({ host: 'api.coinbase.com', path: '/v2/prices/ava-USD/buy', method: 'GET' });
        try {
            let tmp = JSON.parse(data.data);
            let currency = tmp['data']['amount'];
            return currency;
        } catch (ex) {
            Logger.error(logLocation, `Get currencies failed(AVA)`, ex);
        }
        return 0.6629165979969;
    });

    //await ConfigManager.converter.SOL

    let limiter = new RateLimiter();
    ConfigManager.rateLimiter = limiter;
    ConfigManager.billings = new BillingWorker();


    Logger.info(logLocation, 'Starting application');
    Logger.info(logLocation, 'Launching db');
    let db = new SqliteStorage(dbPath);
    await db.start();
    ConfigManager.billings.saveMe = db.saveBills.bind(db);
    Logger.info(logLocation, 'Importing data');

    let data = await db.getConfig();
    for (let x of data) {
        if (x.Key === ConfigNames.Admins) {
            ConfigManager.admins = x.Value.split('|');
            Logger.info('startup', 'Admins list initialized');
        } else if (x.Key === ConfigNames.BotActive) {
            ConfigManager.Active = (x.Value == 'true');
        } else if (x.Key.startsWith(ConfigNames.Billing)) {
            let currency = x.Key.split('|')[1];
            ConfigManager.billings.importData(currency, x.Value);
            //ConfigManager.billing[currency] = x.Value;
        } else if (x.Key === (ConfigNames.HelpLink)) {
            ConfigManager.helpLink = x.Value;
        }
    }

    let chats = await db.getChats();
    for (let x of chats) {
        ConfigManager.chats[x.ID] = x;
        if (x.status == ChatStatuses.Active) {
            ConfigManager.activeChat = x.ID;
        }
    }
    Logger.info(logLocation, 'Data imported');

    Logger.info(logLocation, 'Starting bot');
    const client = new Telegraf(token, { telegram: { agent: new HttpsProxyAgent('user135836:10o6ly@185.113.137.95:9065') } });
    client.launch({ dropPendingUpdates: true });
    let botmenu = new BotMenu(client, db);
    Logger.errorLogs.push(botmenu.LogToAdmin);
    Logger.info("Startup", 'Bot is completely active');
};

export { start };