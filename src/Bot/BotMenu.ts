import { AdminMenu } from "./AdminMenu/AdminMenu";
import { ChatMenu } from "./ChatMenu/ChatMenu";
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { UserMenu } from "./UserMenu/UserMenu";
import { SqliteStorage } from "../Storage/SqliteStorage";
import { Logger } from "./utils/Logger";
import { ConfigManager } from "../ConfigManager";
import { ChatStatuses, UserData } from "../structs";

enum RootPaths {
    Chat = 'chat',
    Admin = 'admin',
    User = 'user',
}

class BotMenu {
    private client: Telegraf;
    private dataStorage: SqliteStorage;

    private adminMenu: AdminMenu;
    private chatMenu: ChatMenu;
    private userMenu: UserMenu;
    constructor(client: Telegraf, dataStorage: SqliteStorage) {
        this.client = client;
        this.dataStorage = dataStorage;

        this.adminMenu = new AdminMenu(client, dataStorage);
        this.chatMenu = new ChatMenu(client, dataStorage);
        this.userMenu = new UserMenu(client, dataStorage);

        client.on(message(), this.newMessage.bind(this));
        client.on('callback_query', this.newCallback.bind(this));
        client.telegram.getMe().then(me => {
            ConfigManager.myID = me.id.toString();
        });

        for (let x of ConfigManager.admins) {
            client.telegram.sendMessage(x, 'started').catch(ex => {
            });
        }
    }

    async newCallback(event: Context) {

        const update = event.update;
        try {
            if (update && ('callback_query' in update)) {
                if ('data' in update.callback_query) {
                    let data = update.callback_query.data;

                    Logger.info('Callback menu', 'Callback', { sender: update.callback_query.from.id.toString(), callback: data });
                    if (data.startsWith(RootPaths.Admin)) {
                        if (ConfigManager.admins.includes(update.callback_query.from.id.toString())) {
                            await this.adminMenu.CallbackMenu(event, data.replace(`${RootPaths.Admin}|`, ''));
                        }
                        return;
                    } else if (data.startsWith(RootPaths.User)) {
                        await this.userMenu.CallbackMenu(event, data);
                    } else if (data.startsWith(RootPaths.Chat)) {
                        await this.chatMenu.CallbackMenu(event, data);
                    }
                }
            }
        } catch (ex) {
            Logger.error('Callback menu', 'newCallback', ex);
        }
    }

    async newMessage(event: Context) {
        console.log('new message update');
        const update = event.update;
        try {
            if (update && ('message' in update)) {
                let message = update.message;
                if ('text' in message) {
                    Logger.info('Callback menu', 'Message', { id: update.message.chat.id, text: message.text });
                }


                if (update.message.from.id == update.message.chat.id) {//User writen message
                    if (ConfigManager.admins.includes(update.message.from.id.toString())) {
                        await ConfigManager.rateLimiter.getToken();
                        await this.adminMenu.MainMenu(event);
                    } else {
                        await ConfigManager.rateLimiter.getToken();
                        await this.userMenu.MainMenu(event);
                    }
                } else if (ConfigManager.Active) {//Message from chat
                    if (ConfigManager.activeChat == update.message.chat.id.toString()) {//if such chat is saved in db
                        await ConfigManager.rateLimiter.getToken();
                        return await this.chatMenu.MainMenu(event);
                    } else {//If it is a new chat for this bot - save it
                        if ('title' in update.message.chat) {
                            await this.dataStorage.addGroup(update.message.chat.id.toString(), update.message.chat.title);
                        } else {
                            await this.dataStorage.addGroup(update.message.chat.id.toString(), 'null');
                        }
                    }
                }
            }
        } catch (ex) {
            Logger.error('Bot menu', 'newMessage error', ex);
        }
    }

    private async adminLog(location: string, message: string, date: Date, additionalData: any) {
        try {
            for (let x of ConfigManager.admins) {
                try {
                    await this.client.telegram.sendMessage(x, `location:${location}\nMessage:${message}\nError:${JSON.stringify(additionalData)}\ndate:${date}`);
                } catch (ex) {

                }
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    public get LogToAdmin(): (location: string, message: string, date: Date, additionalData: any) => void {
        return this.adminLog.bind(this);
    }
}

export { BotMenu, RootPaths };