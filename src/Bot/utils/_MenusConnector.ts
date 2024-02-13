import { UserData } from "../../structs";

class Connector {//Probably the worst thing I've ever coded -_-
    gotBillCallback: (user: UserData, status:boolean) => any;
    requestBill: (user: UserData) => any;
}

export { Connector };