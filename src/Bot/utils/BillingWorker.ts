import { ConfigManager } from "../../ConfigManager";
import { BillingTypes, UserData } from "../../structs";
import { Logger } from "./Logger";

const logLocation = 'Bill worker';
class BillRequest {
    type: BillingTypes.ask = BillingTypes.ask;
}

class BillStatic {
    type: BillingTypes.static = BillingTypes.static;
    data: string;
}

class BillPool {
    type: BillingTypes.pool = BillingTypes.pool;
    currentIndex: number = 0;
    data: string[];

    validateIndex() {
        if (this.data.length == 0) {
            return false;
        }
        this.currentIndex = this.currentIndex % this.data.length;
        return true;
    }
}

type IBill = BillPool | BillRequest | BillStatic;

class BillingWorker {
    billings: { [currency: string]: IBill } = {};

    requestBill(currency: string) {
        let bill = this.billings[currency];
        if (!bill) {
            return false;
        } else if (bill.type === BillingTypes.static) {
            return bill.data;
        } else if (bill.type === BillingTypes.pool) {
            if (!bill.validateIndex()) {
                Logger.error(logLocation, 'Bills ended', {});
                bill = new BillRequest();
                this.billings[currency] = bill;
            } else {
                let billStr = bill.data[bill.currentIndex];
                bill.currentIndex++;
                return billStr;
            }
        }

        if (bill.type === BillingTypes.ask) {
            return false;
        }
    }

    removeBillFromPool(currency: string, bill: string) {
        let tmp = this.billings[currency];
        if (tmp && tmp.type === BillingTypes.pool) {
            let length = tmp.data.length;
            tmp.data = tmp.data.filter(e => e != bill);

            if (tmp.data.length === 0) {
                Logger.error('Billing worker', 'Bills pool exhausted, new bill type - request', { currency: currency })
                this.billings[currency] = new BillRequest();
                if (length > 0) {
                    return true;
                } else {
                    return false;
                }
            }

            if (this.saveMe) {
                this.saveMe(this);
            }
            if (length != tmp.data.length) {
                return true;
            }
            return false;
        } else {
            return false;
        }
    }

    newBill(currency: string, type: BillingTypes, data?: string | string[]) {
        if (!Object.values(ConfigManager.strings.CurrenciesToShort).includes(currency)) {
            return;
        }

        if (type == BillingTypes.ask) {
            this.billings[currency] = new BillRequest();
        } else if (type == BillingTypes.static) {
            let tmp = new BillStatic();
            tmp.data = data as string;
            this.billings[currency] = tmp;
        } else if (type == BillingTypes.pool) {
            let tmp = new BillPool();
            tmp.data = data as string[];
            this.billings[currency] = tmp;
        }
        if (this.saveMe) {
            this.saveMe(this);
        }
    }

    pullToPool(currency: string, data: string[]) {
        let tmp = this.billings[currency];
        if (tmp && tmp.type == BillingTypes.pool) {
            tmp.data = tmp.data.concat(data);
        }
        if (this.saveMe) {
            this.saveMe(this);
        }
    }

    importData(currency: string, value: string) {
        let data = value.split('|');
        if (data) {
            let type = data[0];
            if (type) {
                if (type == BillingTypes.ask.toString()) {
                    this.billings[currency] = new BillRequest();
                } else if (type == BillingTypes.static.toString()) {
                    if (data[1]) {
                        let tmp = new BillStatic();
                        tmp.data = data[1];
                        this.billings[currency] = tmp;
                    }
                } else if (type == BillingTypes.pool.toString()) {
                    if (data[1]) {
                        let tmp = new BillPool();
                        tmp.data = [];
                        for (let i = 1; i < data.length; i++) {
                            if (data[i]) {
                                tmp.data.push(data[i]);
                            }
                        }
                        this.billings[currency] = tmp;
                    }
                }
            }
        }
    }

    exportData() {
        return Object.keys(this.billings).map(currency => {
            let tmp = this.billings[currency], str = '';
            if (tmp.type == BillingTypes.pool) {
                str = tmp.data.join('|');
            } else if (tmp.type == BillingTypes.static) {
                str = tmp.data;
            }
            return [currency, this.billings[currency].type + '|' + str];
        })
    }

    getStatus() {
        return Object.keys(this.billings).map(currency => {
            let tmp = this.billings[currency], str = '';
            let type;
            if (tmp.type == BillingTypes.pool) {
                str = tmp.data.join('\n\t');
                type = "Pool";
            } else if (tmp.type == BillingTypes.static) {
                str = tmp.data;
                type = "Static";
            } else {
                type = "Query each";
            }

            return `${currency}(${type}):${str}`;
        }).join('\n');
    }


    saveMe: (me: BillingWorker) => any;
}

export { BillingWorker };