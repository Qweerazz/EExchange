import { Context, Telegraf } from "telegraf";
import { SqliteStorage } from "../../Storage/SqliteStorage";
import { ConfigManager } from "../../ConfigManager";
import { UserData, fillString } from "../../structs";
import { Logger } from "../utils/Logger";

class ChatMenu {
    private client: Telegraf;
    private dataStorage: SqliteStorage;


    constructor(client: Telegraf, dataStorage: SqliteStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        ConfigManager.connector.requestBill = this.requestBill.bind(this);
        ConfigManager.RequestsCache.on('expired', (key, value) => {
            //if ('type' in value && value.type === UsersCacheTypes.UserData) {
            console.log('expired key', key);
            //}
        });
    }

    async requestBill(user: UserData) {
        try {
            let message = await this.client.telegram.sendMessage(ConfigManager.activeChat, fillString(`User $8 requested $1 bill\n Exchange data: 
        Course:1$1=$5$2
        Input sum:$3 $1
        Output sum:$4 $2
        Client billing:$6
        Reply to this message to specify billing(type ~\`cancel\`~ to canel user operation)`, user));


            ConfigManager.RequestsCache.set(message.message_id, user);
        } catch (ex) {
            Logger.error('ChatMenu', 'Send message to chat failed', ex);
        }
    }

    async CallbackMenu(event: Context, data: string) {

    }

    async MainMenu(event: Context) {
        if ('reply_to_message' in event.message && 'text' in event.message) {
            Logger.info('Chat menu', 'chat menu');
            if (event.message.reply_to_message.from.id.toString() == ConfigManager.myID) {
                let tmp: UserData = ConfigManager.RequestsCache.get(event.message.reply_to_message.message_id);
                if (tmp) {
                    tmp.exchangeBill = event.message.text;
                    ConfigManager.connector.gotBillCallback(tmp, event.message.text != 'cancel');
                    ConfigManager.RequestsCache.del(event.message.reply_to_message.message_id);
                }
            }
        }
    }

    async sendToChat() {

    }

    async BanUserCallback(event: Context, data: string) {

    }

    async ConfirmUserCallback(event: Context, data: string) {

    }
}

export { ChatMenu };