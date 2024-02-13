import { Context, Markup, Telegraf } from "telegraf";
import { SqliteStorage } from "../../Storage/SqliteStorage";
import { ConfigManager } from "../../ConfigManager";
import { BillingTypes, ChatData, ChatStatuses, ConfigNames } from "../../structs";
import { AdminMenuStage, AdminStorage } from "./AdminStorage";

enum AdminCommands {
    help = '/help',
    chats = '/chats',
    billings = '/billings',
    toggle = '/toggle',

    BillOnRequest = 'Bill on request',
    BillStatic = 'Static bill',
    BillPoolNew = 'Pool of bills',
    BillPoolAdd = 'Add bills to pool',
}

enum AdminCallbacks {
    chatsCallback = 'admin_chat_toggle',
    setBilling = 'set_billing',
    setHelpLink = 'set_help_link'
}

class AdminMenu {
    private client: Telegraf;
    private dataStorage: SqliteStorage;

    //private adminInputAwaited: (event: Context) => any;
    //private tmp: string;
    private admStorage: AdminStorage;

    constructor(client: Telegraf, dataStorage: SqliteStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        this.admStorage = new AdminStorage();
    }

    async CallbackMenu(event: Context, data: string) {
        if (data.startsWith(AdminCallbacks.chatsCallback)) {
            await this.callbackChatToggle(event, data);
        } else if (data.startsWith(AdminCallbacks.setBilling)) {
            await this.callbackBilling(event, data);
        } else if (data.startsWith(AdminCallbacks.setHelpLink)) {
            await this.callbackHelpLink(event, data);
        }
    }

    async MainMenu(event: Context) {
        const update = event.update;
        if (update && ('message' in update)) {
            if ('text' in update.message) {
                if (update.message.text == AdminCommands.help) {
                    await this.CallHelp(event);
                }
                else if (update.message.text == AdminCommands.chats) {
                    await this.CallChats(event);
                }
                else if (update.message.text == AdminCommands.toggle) {
                    await this.callToggle(event);
                } else if (update.message.text == AdminCommands.billings) {
                    await this.CallBillings(event);
                } else if (this.admStorage.awaitingInput) {
                    this.admStorage.awaitingInput = false;
                    await this.gotInput(event, update.message.text);
                }
            }
        }
    }

    async gotInput(event: Context, message: string) {
        if (this.admStorage.stage == AdminMenuStage.EditBillSelectType) {
            await this.inputBillingType(event, message);
        } else if (this.admStorage.stage == AdminMenuStage.EditBillTypeBill) {
            await this.inputBilling(event, message);
        } else if (this.admStorage.stage == AdminMenuStage.EditHelpLink) {
            await this.inputHelpLink(event, message);
        }
    }

    async inputBillingType(event: Context, message: string) {
        if (!this.admStorage.data || typeof this.admStorage.data != 'object' || !('currency' in this.admStorage.data)) {
            return;
        }

        if (message == AdminCommands.BillOnRequest) {
            this.admStorage.stage = AdminMenuStage.Nothing;
            ConfigManager.billings.newBill(this.admStorage.data.currency, BillingTypes.ask);
            this.admStorage.data = null;
            return await event.reply('Done', Markup.removeKeyboard());
        } else if (message == AdminCommands.BillStatic) {
            this.admStorage.stage = AdminMenuStage.EditBillTypeBill;
            this.admStorage.awaitingInput = true;
            this.admStorage.data.billType = BillingTypes.static;
            return await event.reply('Type new bill', Markup.removeKeyboard());
        } else if (message == AdminCommands.BillPoolAdd || message == AdminCommands.BillPoolNew) {
            this.admStorage.stage = AdminMenuStage.EditBillTypeBill;
            this.admStorage.data.billType = BillingTypes.pool;
            this.admStorage.awaitingInput = true;
            if (message == AdminCommands.BillPoolAdd) {
                this.admStorage.data.append = true;
            }
            return await event.reply('Type new bills(each message - new bill, type `stop` to stop)', Markup.removeKeyboard());
        } else {
            this.admStorage.stage = AdminMenuStage.Nothing;
            return await event.reply('Editing bill was canceled', Markup.removeKeyboard());
        }
    }


    async inputBilling(event: Context, message: string) {
        if (!this.admStorage.data || typeof this.admStorage.data != 'object' || !('currency' in this.admStorage.data)) {
            return;
        }

        if (this.admStorage.data.billType === BillingTypes.static) {
            ConfigManager.billings.newBill(this.admStorage.data.currency, this.admStorage.data.billType, message);
            this.admStorage.stage = AdminMenuStage.Nothing;
            this.admStorage.data = null;
            return await event.reply('DONE');
        } else if (this.admStorage.data.billType === BillingTypes.pool && message == 'stop') {
            if (!Array.isArray(this.admStorage.data.data)) {
                this.admStorage.data.data = [];
            }

            if (this.admStorage.data.append) {
                ConfigManager.billings.pullToPool(this.admStorage.data.currency, this.admStorage.data.data);
            } else {
                ConfigManager.billings.newBill(this.admStorage.data.currency, this.admStorage.data.billType, this.admStorage.data.data);
            }
            this.admStorage.stage = AdminMenuStage.Nothing;
            this.admStorage.data = null;
            return await event.reply('DONE');
        } else if (this.admStorage.data.billType === BillingTypes.pool) {
            if (!Array.isArray(this.admStorage.data.data)) {
                this.admStorage.data.data = [];
            }
            this.admStorage.data.data.push(message);
            this.admStorage.awaitingInput = true;
        }
        return;

    }

    async inputHelpLink(event: Context, message: string) {
        await this.dataStorage.saveConfig(`${ConfigNames.HelpLink}`, message);
        ConfigManager.helpLink = message;
        this.admStorage.stage = AdminMenuStage.Nothing;
        this.admStorage.data = null;
        await event.reply('DONE');
        return;
    }

    async callbackHelpLink(event: Context, data: string) {
        this.admStorage.awaitingInput = true;
        this.admStorage.stage = AdminMenuStage.EditHelpLink;
        await event.answerCbQuery();
        await event.reply(`Type a new help link:`);
    }

    async callbackBilling(event: Context, data: string) {
        let currency = data.split('|')[1];
        this.admStorage.data = { currency: currency };
        this.admStorage.stage = AdminMenuStage.EditBillSelectType;
        this.admStorage.awaitingInput = true;
        await event.answerCbQuery();
        if (ConfigManager.billings.billings[currency] && ConfigManager.billings.billings[currency].type === BillingTypes.pool) {
            await event.reply(`Select billing type for ${currency}:`, Markup.keyboard([AdminCommands.BillStatic, AdminCommands.BillPoolNew, AdminCommands.BillPoolAdd, AdminCommands.BillOnRequest]));
        } else {
            await event.reply(`Select billing type for ${currency}:`, Markup.keyboard([AdminCommands.BillStatic, AdminCommands.BillPoolNew, AdminCommands.BillOnRequest]));
        }
    }

    async callbackChatToggle(event: Context, data: string) {
        const update = event.update;
        if (update && ('callback_query' in update)) {
            let chat = data.split('|')[1];
            if (!chat) {
                return;
            }

            let chatData = ConfigManager.chats[chat];
            if (!chatData) {
                return;
            }

            if (chatData.status == ChatStatuses.Inactive) {
                if (ConfigManager.activeChat) {
                    await this.dataStorage.updateGroupStatus(ConfigManager.activeChat, ChatStatuses.Inactive);
                }
                await this.dataStorage.updateGroupStatus(chatData.ID, ChatStatuses.Active);
                ConfigManager.activeChat = chatData.ID;

            } else if (chatData.status == ChatStatuses.Active) {
                await this.dataStorage.updateGroupStatus(chatData.ID, ChatStatuses.Inactive);
                ConfigManager.activeChat = null;
            }

            if (update.callback_query.message) {
                let { message, keyboard } = this.utilsCreateChatsMessage();
                return await this.client.telegram.editMessageText(update.callback_query.message.chat.id, update.callback_query.message.message_id, null, message, {
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                });
            }


        }
    }

    async CallBillings(event: Context) {
        let { message, keyboard } = this.utilsCreateBillingMessage();
        return await event.reply(message, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }

    async CallHelp(event: Context) {
        await event.reply(ConfigManager.strings.BotAdminHelp);
    }

    async CallChats(event: Context) {
        let { message, keyboard } = this.utilsCreateChatsMessage();
        return await event.reply(message, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
    async callToggle(event: Context) {
        ConfigManager.Active = !ConfigManager.Active;
        await this.dataStorage.saveConfig(ConfigNames.BotActive, ConfigManager.Active.toString());
        if (ConfigManager.Active) {
            return await event.reply("Now bot is active");
        } else {
            return await event.reply('Now bot is disabled');
        }
    }

    utilsCreateBillingMessage(): { message: string, keyboard: any[] } {
        let message = 'Billings:\n';
        let keyboard = [], rows: any[];
        let counter = 0;
        for (let x of Object.values(ConfigManager.strings.CurrenciesToShort)) {
            if (counter % 4 === 0) {
                rows = [];
                keyboard.push(rows);
            }
            rows.push({ text: `Set ${x}`, callback_data: `admin|${AdminCallbacks.setBilling}|${x}` });
            counter++;
        }
        message += ConfigManager.billings.getStatus();
        return { message: message, keyboard: keyboard };
    }

    utilsCreateChatsMessage(): { message: string, keyboard: any[] } {
        let responce = `Help link:${ConfigManager.helpLink}\nAvaliable chats:\n`;
        let inlineKeyboard = [[{ text: 'Set help link', callback_data: `admin|${AdminCallbacks.setHelpLink}` }]];
        for (let x of Object.keys(ConfigManager.chats)) {
            let chat: ChatData = ConfigManager.chats[x];
            responce += `${x}|${chat.Title}|${chat.status == ChatStatuses.Active ? 'Active' : 'Inactive'}\n`;
            let action = (chat.status == ChatStatuses.Active ? 'Disable' : 'Enable');
            inlineKeyboard.push([{ text: `${action} ${x}`, callback_data: `admin|${AdminCallbacks.chatsCallback}|${x}` }]);
        }

        return { message: responce, keyboard: inlineKeyboard };
    }
}

export { AdminMenu };