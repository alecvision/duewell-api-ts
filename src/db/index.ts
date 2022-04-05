import { MongoClient, WithoutId } from "mongodb";
import type { Receipt } from "@azure/ai-form-recognizer";
import type { Filter, Collection } from "mongodb";
import type {
  UserModel,
  ReceiptModel,
  PlaidItemModel,
  TransactionModel,
  PlaidApiEventModel,
  AccountModel,
} from "./models";

export type PlaidItemFilter = Filter<PlaidItemModel>;
export type UserFilter = Filter<UserModel>;
export type ReceiptFilter = Filter<ReceiptModel>;
export type TransactionFilter = Filter<TransactionModel>;
export type PlaidApiEventFilter = Filter<PlaidApiEventModel>;
export type AccountFilter = Filter<AccountModel>;

type PlaidItem = WithoutId<PlaidItemModel>;
type PlaidApiEvent = WithoutId<PlaidApiEventModel>;
//TODO: Finish db handler
// type Account = WithoutId<AccountModel>

let receipts: Collection<ReceiptModel>;
let transactions: Collection<TransactionModel>;
let plaidItems: Collection<PlaidItemModel>;
let plaidApiEvents: Collection<PlaidApiEventModel>;
let accounts: Collection<AccountModel>;

export const dbConnect = async () => {
  const mongoClient = new MongoClient(process.env.MONGO_DB_CONNSTRING);
  await mongoClient.connect();
  const db = mongoClient.db("duewell");
  
  receipts = db.collection("receipts");
  plaidItems = db.collection("plaidItems");
  transactions = db.collection("transactions");
  plaidApiEvents = db.collection("plaidApiEvents");
  accounts = db.collection("accounts");
  
  console.log(`Connected to database: ${db.databaseName}`);
  console.log(`Using database collections: [receipts, plaidItems, transactions, plaidApiEvents, accounts]`);
};

export const db = {
  receipts: {
    read: async (filter: ReceiptFilter) => await receipts.findOne(filter),
    create: async (
      receipt: Receipt,
      //TODO:      image: Express.Multer.File,
      force?: boolean
    ) => {
      if (!force) {
        const duplicate = await receipts.findOne({ ...receipt.fields });
        if (duplicate) throw duplicate;
      }
      receipts.insertOne({
        ...receipt.fields,
      });
      //TODO: Implement cloud backup for image files and include reference in database document
    },
    update: () => {
      return;
    },
    delete: () => {
      return;
    },
  },
  transactions: {
    read: async (filter: TransactionFilter) => {
      const result = await transactions.find(filter)?.limit(5).toArray();
      return result;
    },
    create: () => {
      return;
    },
    update: () => {
      return;
    },
    delete: () => {
      return;
    },
  },
  plaidItems: {
    read: async (filter: PlaidItemFilter) => await plaidItems.findOne(filter),
    create: async (item: PlaidItem) => await plaidItems.insertOne(item),
    update: async (filter: PlaidItemFilter, item: PlaidItem) =>
      await plaidItems.findOneAndUpdate(filter, item),
    delete: async (item: PlaidItem) => await plaidItems.findOneAndDelete(item),
  },
  plaidApiEvents: {
    read: async () => ({}),
    create: async (event: PlaidApiEvent) =>
      await plaidApiEvents.insertOne(event),
    update: async () => ({}),
    delete: async () => ({}),
  },
  accounts: {
    read: async (account: AccountFilter) => await accounts.findOne(account),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
};
