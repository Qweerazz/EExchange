class Strings {
    //$1 - валюта обмена(из какой)
    //$2 - валюта зачисления(в какую)
    //$3 - Сумма обмена(в валюте обмена)
    //$4 - Сумма зачисления(получаемая валюта)
    //$5 - обменный курс
    //$6 - счет пользователя
    //$7 - предоставленый счет
    //$8 - ник пользователя

    QuestionGreeting = `Здраствуйте, это бот обменник, выберете валюту которую вы хотите обменять`;
    QuestionSelectReceivedCurrency = `Выберете валюту получения`;
    QuestionTypeSum = `Курс составляет 1$1=$5$2\nВведите сумму обмена в валюте $1(вводить только цифры, не нужно указывать валюту)`;
    QuestionConfirm = `Вы получите $4 $1`;
    QuestionCancelChoose = `Обмен был отклонен, что бы начать сначала введите /start`;
    QuestionSelectBill = `Веедите ваш счет:`;
    QuestionAwaitBill = `Ожидайте получения счета`;
    QuestionConfirmChoose = `Будет произведен следующий обмен:
Вы выплачиваете $3 $1
На счет:$7
Вы получаете $4 $2
На счет $6
`;

    QuestionCheque = 'Отправьте пожалуйста чек в этот чат(Подходящие форматы - pdf или изображение)';
    QuestionFinishAwait = 'Ожидайте рассмотрения вашего платежа';
    QuestionFinishDone = 'Спасибо за использование нашего сервиса, для нового обмена нажмите /start';
    QuestionDeclined = 'Ваш обмен был отклонен';

    QuestionHelp = 'Перейдите в чат по кнопке ниже для получения помощи';
    ButtonRestart = 'Начать сначала';
    ButtonHelp = 'Помощь';
    ButtonHelpDirect = 'Помощь';
    ButtonTextPaid = 'Оплачено';
    ButtonTextConfirm = `Подтвердить`;
    ButtonTextCancel = `Отклонить`;

    ErrorNoBilling = `К сожалению мы сейчас не можем предаставить вам обмен с этой валютой, попробуйте позже`;
    ErrorInvalidCheque = `Отправлен чек неверный, попробуйте еще раз`;
    ErrorSameCurrency = `Валюта отправления и получения одинаковая, попробуйте еще раз`;
    ErrorFalseInput = `Для выбора жмите кнопки в меню, нет нужды писать что то сюда`;
    ErrorTimeout = `Время обмена истекло, если вы все еще хотите совершить обмен жмите /start`;
    ErrorSumInput = `Сумма была введена неверно, попытайтесь еще раз`;

    ErrorUnknown = `Что то пошло не так`;

    currencies = [
        `RUB`,
        `Bitcoin (BTC)`,
        `Tether (USDT)`,
        `Litecoin (LTC)`,
        `Ethereum (ETH)`,
        `Ripple (XRP)`,
        `Dogecoin (DOGE)`,
        `Solana (SOL)`,
        `Monero (XMR)`,
        `BowsCoin (BSC)`,
        `Travala (AVA)`,
        `Binance Coin (BNB)`,
        `USD Coin (USDC)`,
        `Cardano (ADA)`,
        `Terra (LUNA)`,
        `Avalanche (AVAX)`,
    ];
    CurrenciesToShort = {
        'RUB': 'RUB',
        'Bitcoin (BTC)': 'BTC',
        'Tether (USDT)': 'USDT',
        'Litecoin (LTC)': 'LTC',
        'Ethereum (ETH)': 'ETH',
        'Ripple (XRP)': 'XRP',
        'Dogecoin (DOGE)': 'DOGE',
        'Solana (SOL)': 'SOL',
        'Monero (XMR)': 'XMR',
        'BowsCoin (BSC)': 'BSC',
        'Travala (AVA)': 'AVA',
        'Binance Coin (BNB)': 'BNB',
        'USD Coin (USDC)': 'USDC',
        'Cardano (ADA)': 'ADA',
        'Terra (LUNA)': 'LUNA',
        'Avalanche (AVAX)': 'AVAX',
    };

    BotAdminHelp =
        `/chats показує активні канали бота
/toggle перемикач вкл/викл для бота
/billings показує введені рахунки бота
/help виводить це вікно`;

    ChatResultMessage =
        `Username:$8
Course:1$1=$5$2
Input sum:$3 $1
Output sum:$4 $2
Client billing:$6
Provided billing:$7`;
}

export { Strings }