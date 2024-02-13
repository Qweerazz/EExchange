import * as sqlite3 from "sqlite3";
import { ConfigManager } from "../ConfigManager";
import { ChatData, ChatStatuses, ConfigNames } from "../structs";
import { Logger } from "../Bot/utils/Logger";
import { BillingWorker } from "../Bot/utils/BillingWorker";

const all = (db: sqlite3.Database, query: string): Promise<any[]> => {
    return new Promise((res, rej) => {
        db.all(query, (err: Error, rows: any[]) => {
            if (err) {
                rej(err);
            } else {
                res(rows);
            }
        });
    });
};

const exec = (db: sqlite3.Database, query: string) => {
    return new Promise((res, rej) => {
        db.exec(query, (err: Error) => {
            if (err) {
                rej(err);
            } else {
                res(true);
            }
        });
    });
};

const logLocation = 'SqliteStorage';
class SqliteStorage {
    db: sqlite3.Database;
    dbPath: string;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }

    async start() {
        Logger.info(logLocation, 'Initializing db');
        this.db = new sqlite3.Database(this.dbPath);
        try {
            await all(this.db, 'SELECT * FROM Config');
            Logger.info(logLocation, 'DB is initialized');
        } catch (ex) {
            if (ex.message.includes('no such table')) {
                Logger.info(logLocation, 'DB is not initilized');
                await exec(this.db, `CREATE TABLE Config (
                    Key TEXT,
                    Value TEXT,
                    PRIMARY KEY(Key)
                )`);

                await exec(this.db, `CREATE TABLE Chats (
                    ID TEXT,
                    Title TEXT,
                    status INTEGER,
                    PRIMARY KEY(ID)
                 )`);

                await exec(this.db, `CREATE TABLE MessageLog (
                    SenderID TEXT,
                    MessageID TEXT,
                    Text TEXT,
                    Date TEXT,
                    PRIMARY KEY(SenderID, MessageID)
                )`);

                await exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${ConfigNames.Admins}', '6866743164')`);
                Logger.info(logLocation, 'DB initialized')
            }
        }
    }

    async addGroup(id: string, title: string) {
        await exec(this.db, `INSERT INTO Chats(ID, Title, status) VALUES('${id}', '${title}', '${ChatStatuses.Inactive}')`);
        let chat = new ChatData();
        chat.ID = id;
        chat.Title = title;
        chat.status = ChatStatuses.Inactive;
        ConfigManager.chats[id] = chat;
    }

    async updateGroupStatus(ID: string, status: ChatStatuses) {
        await exec(this.db, `UPDATE Chats SET status='${status}' WHERE ID='${ID}'`);
        ConfigManager.chats[ID].status = status;
    }


    async SaveMessagesLog() {

    }

    async removeConfig(key: string) {
        await exec(this.db, `DELETE FROM Config WHERE Key='${key}'`);
    }
    async saveConfig(key: string, value: string) {
        await exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${key}', '${value}')ON CONFLICT (Key) DO UPDATE SET Value='${value}'`);
    }
    async getConfig(key?: string) {
        if (key) {
            let tmp = await all(this.db, `SELECT * FROM Config WHERE Key='${key}'`);
            return tmp;
        } else {
            let tmp = await all(this.db, 'SELECT * FROM Config');
            return tmp;
        }
    }
    async getChats(): Promise<ChatData[]> {
        let tmp = await all(this.db, 'SELECT * FROM Chats');
        let chats: ChatData[] = [];
        for (let x of tmp) {
            let chat = new ChatData();
            chat.ID = x.ID;
            chat.status = x.status;
            chat.Title = x.Title;
            chats.push(chat);
        }
        return chats;
    }

    async saveBills(billing: BillingWorker) {
        let data = billing.exportData();
        let resolve = [];
        for (let x of data) {
            resolve.push(exec(this.db, `INSERT INTO Config(Key, Value) VALUES('${ConfigNames.Billing}|${x[0]}', '${x[1]}')ON CONFLICT (Key) DO UPDATE SET Value='${x[1]}'`));
        }
        let res = await Promise.allSettled(resolve);
        for(let x of res){
        }
    }

}

export { SqliteStorage };