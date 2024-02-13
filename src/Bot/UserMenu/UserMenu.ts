import { Context, Markup, Telegraf } from "telegraf";
import { SqliteStorage } from "../../Storage/SqliteStorage";
import { BillingTypes, UserData, UserInputStages, fillString, getConfirmButtons, getCurrenciesButtons } from "../../structs";
import { ConfigManager } from "../../ConfigManager";
import { Logger } from "../utils/Logger";

const logLocation = 'user menu';
class UserMenu {
    private client: Telegraf;
    private dataStorage: SqliteStorage;

    constructor(client: Telegraf, dataStorage: SqliteStorage) {
        this.client = client;
        this.dataStorage = dataStorage;
        ConfigManager.connector.gotBillCallback = this.GotExchangeBill.bind(this);
        ConfigManager.UsersCache.on('expired', (key, value) => {
            //if ('type' in value && value.type === UsersCacheTypes.UserData) {
            this.userExpired(key);
            //}
        });
    }

    async CallbackMenu(event: Context, data: string) {

    }

    async MainMenu(event: Context) {
        const update = event.update;
        if (update && ('message' in update)) {
            let user: UserData = ConfigManager.UsersCache.get(update.message.from.id.toString());
            if (!user) {
                user = new UserData();
                user.Id = update.message.from.id.toString();
                user.nick = (event.message.from.first_name + ' ' + (event.message.from.last_name || ''));
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else {
                if ('text' in update.message && (update.message.text === '/start' || update.message.text === ConfigManager.strings.ButtonRestart)) {
                    user = new UserData();
                    user.Id = update.message.from.id.toString();
                    ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
                } else if ('text' in update.message && (update.message.text === ConfigManager.strings.ButtonHelp)) {
                    return await this.CallHelp(event, user);
                }
            }
            if (user.InputStage === UserInputStages.AwaitingStart) {
                await this.CallStart(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.SelectFromCurrency) {
                await this.CallCooseFromCurrency(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.SelectToCurrency) {
                await this.CallCooseToCurrency(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.SelectSum) {
                await this.CallTypeSum(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.SelectBill) {
                await this.CallSelectBill(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.Confirm) {
                await this.CallConfirm(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.SendCheque) {
                await this.CallSendCheque(event, user);
                ConfigManager.UsersCache.set(user.Id, user, ConfigManager.ChacheUserSaveTimeout);
            } else if (user.InputStage === UserInputStages.AwaitingExchangeBill) {
                await this.CallWhileWaitingBill(event, user);
            }
            if (user.InputStage == UserInputStages.Done) {
                ConfigManager.UsersCache.del(user.Id);
            }
        }
    }

    async CallWhileWaitingBill(event: Context, user: UserData) {
        await event.reply(ConfigManager.strings.QuestionAwaitBill, this.getMarkup(user.InputStage));
    }

    async CallStart(event: Context, user: UserData) {
        user.InputStage++;// = UserInputStages.SelectFromCurrency;
        await event.reply(ConfigManager.strings.QuestionGreeting, (this.getMarkup(user.InputStage)));
    }

    async CallCooseFromCurrency(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update) && ('text' in update.message)) {
            let message = update.message;
            let short = ConfigManager.strings.CurrenciesToShort[message.text];
            if (!short) {
                return await event.reply(ConfigManager.strings.ErrorFalseInput,);
            }
            user.InputStage++;// = UserInputStages.SelectToCurrency;
            user.fromCurrency = short;
            return await event.reply(ConfigManager.strings.QuestionSelectReceivedCurrency, this.getMarkup(user.InputStage));
        }

        return await event.reply(ConfigManager.strings.ErrorUnknown, this.getMarkup(user.InputStage));
    }
    async CallCooseToCurrency(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update) && ('text' in update.message)) {
            let message = update.message;
            let short = ConfigManager.strings.CurrenciesToShort[message.text];
            if (!short) {
                return await event.reply(ConfigManager.strings.ErrorFalseInput, this.getMarkup(user.InputStage));
            }
            if (short == user.fromCurrency) {
                return await event.reply(ConfigManager.strings.ErrorSameCurrency, this.getMarkup(user.InputStage));
            }


            user.InputStage++;// = UserInputStages.SelectSum;
            user.toCurrency = short;
            user.course = ConfigManager.converter[user.fromCurrency][user.toCurrency](1);
            let text = fillString(ConfigManager.strings.QuestionTypeSum, user);// .replace('$1', user.fromCurrency).replace('$2', user.course.toString());
            return await event.reply(text, this.getMarkup(user.InputStage));
        }

        return await event.reply(ConfigManager.strings.ErrorUnknown, this.getMarkup(user.InputStage));
    }

    async CallTypeSum(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update) && ('text' in update.message)) {
            let message = update.message;
            let sum: number;
            try {
                sum = parseFloat(message.text);
            } catch (ex) {
                return await event.reply(ConfigManager.strings.ErrorSumInput);
            }

            user.InputStage++;// = UserInputStages.SelectBill;
            user.sumToExchange = sum;
            let res = ConfigManager.converter[user.fromCurrency][user.toCurrency](user.sumToExchange);
            user.sumToReceive = res;
            let text = fillString(ConfigManager.strings.QuestionSelectBill, user);
            //let text = ConfigManager.strings.QuestionConfirm.replace('$1', user.fromCurrency).replace('$2', user.sumToReceive.toString());
            //return await event.reply(text, Markup.keyboard(getConfirmButtons()));
            return await event.reply(text, this.getMarkup(user.InputStage));
        }
    }

    async CallConfirm(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update) && ('text' in update.message)) {
            let message = update.message;
            if (message.text === ConfigManager.strings.ButtonTextConfirm) {
                user.InputStage = UserInputStages.SendCheque;
                return await event.reply(ConfigManager.strings.QuestionCheque, this.getMarkup(user.InputStage));
            } else if (message.text === ConfigManager.strings.ButtonTextCancel) {
                user.InputStage++;// = UserInputStages.AwaitingStart;
                user.fromCurrency = null;
                user.toCurrency = null;
                user.sumToExchange = null;
                user.sumToReceive = null;
                return await event.reply(ConfigManager.strings.QuestionCancelChoose, this.getMarkup(user.InputStage));
            } else {
                return await event.reply(ConfigManager.strings.ErrorFalseInput);
            }
        }
    }

    async GotExchangeBill(user: UserData, status: boolean) {
        try {
            if (user.InputStage === UserInputStages.AwaitingExchangeBill) {
                if (status) {
                    user.InputStage = UserInputStages.Confirm;
                    let text = fillString(ConfigManager.strings.QuestionConfirmChoose, user);
                    return await this.client.telegram.sendMessage(user.Id, text, this.getMarkup(user.InputStage));
                } else {

                    ConfigManager.UsersCache.del(user.Id);
                    return await this.client.telegram.sendMessage(user.Id, ConfigManager.strings.QuestionDeclined, this.getMarkup(user.InputStage));
                }
            }
        } catch (ex) {
            console.log(ex);
            //Logger.lo
        }
    }

    async CallSelectBill(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update) && ('text' in update.message)) {
            let message = update.message;
            //message.text;//validate
            user.bill = message.text;
            user.InputStage++;
            if (!user.exchangeBill) {
                let bill = ConfigManager.billings.requestBill(user.toCurrency);
                if (bill) {
                    user.exchangeBill = bill;
                } else {
                    user.InputStage = UserInputStages.AwaitingExchangeBill;
                    ConfigManager.connector.requestBill(user);
                    return await event.reply(ConfigManager.strings.QuestionAwaitBill, this.getMarkup(user.InputStage));
                }
            }
            //user.InputStage++;

            let text = fillString(ConfigManager.strings.QuestionConfirmChoose, user);
            return await event.reply(text, this.getMarkup(user.InputStage));
            //return await event.reply(ConfigManager.strings.)
        }
    }

    async CallSendCheque(event: Context, user: UserData) {
        const update = event.update;
        if (update && ('message' in update)) {
            //document application/pdf application/pdf image/png image/webp
            //photo
            if (('photo' in update.message) || ('document' in update.message
                && (update.message.document.mime_type == 'image/webp' ||
                    update.message.document.mime_type == 'image/png' ||
                    update.message.document.mime_type == 'application/pdf'))) {
                if (ConfigManager.activeChat) {
                    let message = await event.forwardMessage(ConfigManager.activeChat);
                    let del = ConfigManager.billings.removeBillFromPool(user.toCurrency, user.exchangeBill);
                    let text = fillString(ConfigManager.strings.ChatResultMessage, user);
                    if (del) {
                        text += '\nUsed bill deleted';
                    }

                    try {
                        await this.client.telegram.sendMessage(ConfigManager.activeChat, text, { reply_to_message_id: message.message_id });
                        await event.reply(ConfigManager.strings.QuestionFinishDone);
                        user.InputStage++;
                    } catch (ex) {
                        Logger.error('CallSendCheque', 'Error sending to chat', ex);
                    }
                }

            }

        }
    }

    async CallHelp(event: Context, user: UserData) {
        return await event.reply(ConfigManager.strings.QuestionHelp, { reply_markup: { inline_keyboard: [[{ text: ConfigManager.strings.ButtonHelpDirect, url: ConfigManager.helpLink }]] } });//([[]]))
    }

    async userExpired(chatId: string) {
        try {
            await this.client.telegram.sendMessage(chatId, ConfigManager.strings.ErrorTimeout, this.getMarkup(UserInputStages.AwaitingStart));
        } catch (ex) {
            Logger.error(logLocation, 'Send expire failed', ex);
        }
    }

    getMarkup(stage: UserInputStages) {
        if (stage === UserInputStages.AwaitingStart) {
            return Markup.keyboard([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === UserInputStages.Confirm) {
            let btns = getConfirmButtons();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return Markup.keyboard(btns).resize(true);
        }
        if (stage === UserInputStages.Done) {
            return Markup.keyboard([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === UserInputStages.SelectBill) {
            return Markup.keyboard([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === UserInputStages.SelectFromCurrency) {
            let btns = getCurrenciesButtons();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return Markup.keyboard(btns);
        }
        if (stage === UserInputStages.SelectSum) {
            return Markup.keyboard([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === UserInputStages.SelectToCurrency) {
            let btns = getCurrenciesButtons();
            //btns.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
            return Markup.keyboard(btns);
        }
        if (stage === UserInputStages.SendCheque) {
            return Markup.keyboard([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]).resize(true);
        }
        if (stage === UserInputStages.AwaitingExchangeBill) {
            return Markup.removeKeyboard();
        }
    }
}

export { UserMenu };