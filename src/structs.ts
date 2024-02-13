import { ConfigManager } from "./ConfigManager";

let currenciesButtons: string[][];
const getCurrenciesButtons = (currencies: string[] = [], columnsCount = 3) => {
    if (currenciesButtons) {
        return currenciesButtons;
    }
    currenciesButtons = [];
    let currentArr = [];
    for (let i = 0; i < currencies.length; i++) {
        if (i % columnsCount === 0) {
            currentArr = [];
            currenciesButtons.push(currentArr);
        }
        currentArr.push(currencies[i]);
    }

    currenciesButtons.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
    return currenciesButtons;
}

let confirmButtons: string[][];
const getConfirmButtons = (Confirm: string = null, Cancel: string = null, vertical: boolean = true) => {
    if (confirmButtons) {
        return confirmButtons;
    }
    if (vertical) {
        confirmButtons = [[Confirm], [Cancel]];
    } else {
        confirmButtons = [[Confirm, Cancel]];
    }

    confirmButtons.push([ConfigManager.strings.ButtonRestart, ConfigManager.strings.ButtonHelp]);
    return confirmButtons;
}



enum ChatStatuses {
    Active,
    Inactive
}

class ChatData {
    ID: string;
    Title: string;
    status: ChatStatuses
}

enum BillingTypes {
    static,
    pool,
    ask
}

enum ConfigNames {
    Admins = 'admins',
    BotActive = 'botActive',
    Billing = 'billing',
    HelpLink = 'help_link'
}

enum UserInputStages {
    AwaitingStart,
    SelectFromCurrency,
    SelectToCurrency,
    SelectSum,
    SelectBill,
    Confirm,
    SendCheque,
    Done,
    AwaitingExchangeBill
}

enum CacheTypes {
    UserData
}

class UserData {
    type: CacheTypes.UserData = CacheTypes.UserData;
    Id: string;
    InputStage: UserInputStages = UserInputStages.AwaitingStart;
    fromCurrency?: string;
    toCurrency?: string;
    sumToExchange?: number;
    sumToReceive?: number;
    exchangeBill?: string;
    bill?: string;
    course?: number;
    nick?:string;
}
//$1 - валюта обмена(из какой)
//$2 - валюта зачисления(в какую)
//$3 - Сумма обмена(в валюте обмена)
//$4 - Сумма зачисления(получаемая валюта)
//$5 - обменный курс
//$6 - счет пользователя
//$7 - предоставленый счет
//$8 - ник пользователя
const fillString = (str: string, userData: UserData) => {
    return str.replace(/\$1/g, userData.fromCurrency || '')
        .replace(/\$2/g, userData.toCurrency || '')
        .replace(/\$3/g, userData.sumToExchange?.toString() || '')
        .replace(/\$4/g, userData.sumToReceive?.toString() || '')
        .replace(/\$5/g, userData.course?.toString() || '')
        .replace(/\$6/g, userData.bill)
        .replace(/\$7/g, userData.exchangeBill)
        .replace(/\$8/g, userData.nick || '');
}

export { ChatData, ChatStatuses, ConfigNames, UserData, UserInputStages, CacheTypes, getCurrenciesButtons, getConfirmButtons, fillString, BillingTypes };