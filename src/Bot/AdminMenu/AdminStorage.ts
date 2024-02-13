import { BillingTypes } from "../../structs";

enum AdminMenuStage {
    Nothing,
    Menu,
    EditHelpLink,
    EditBills,
    EditBillSelectType,
    EditBillTypeBill
}

class InputBillData {
    currency: string;
    billType?: BillingTypes;
    data?: string | string[];
    append?: boolean;
}

type TemporaryDataTypes = InputBillData | string;

class AdminStorage {
    stage: AdminMenuStage = AdminMenuStage.Nothing;
    awaitingInput: boolean = false;
    data: TemporaryDataTypes;
}

export { AdminStorage, AdminMenuStage };