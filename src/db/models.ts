import type { OptionalId } from "mongodb";
import type { UserData } from "auth0";
import type { AccountBase, Item, ItemPublicTokenExchangeResponse, Transaction } from "plaid";
import type { Receipt } from "@azure/ai-form-recognizer";

export type TransactionModel = OptionalId<Transaction>;
export type ReceiptModel = OptionalId<Receipt["fields"]>;
export type PlaidItemModel = OptionalId<Partial<Pick<Item, "institution_id">>> &
  Partial<ItemPublicTokenExchangeResponse> &
  Partial<Pick<UserData, "user_id">> & 
  Partial<{status: "good" | "bad"}>
export type UserModel = OptionalId<UserData>;
export type PlaidApiEventModel = OptionalId<{
  item_id?: string;
  user_id?: string;
  plaid_method: string;
  arguments: string[];
  request_id: string;
  error_type: string;
  error_code: string;
}>
export type AccountModel = OptionalId<AccountBase>