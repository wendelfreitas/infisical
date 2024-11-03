import { ConsumerSecretType } from "@app/const";

export type TCreateConsumerSecretDTO = {
  type: ConsumerSecretType;
  name?: string;
};

export type ConsumerSecret = {
  id: string;
  type: ConsumerSecretType;
  key: string;
  iv: string;
  tag: string;
  name: string;
  fields: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsumerSecretWebLogin = Omit<ConsumerSecret, "fields"> & {
  type: "web-login";
  username: string;
  password: string;
};

export type ConsumerSecretSecureNote = Omit<ConsumerSecret, "fields"> & {
  type: "secure-note";
  content: string;
};

export type ConsumerSecretSecretCreditCard = Omit<ConsumerSecret, "fields"> & {
  type: "credit-card";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

export type ConsumerSecretDeleteResponse = {
  id: string;
  orgId: string;
  type: ConsumerSecretType;
};

export type TDeleteConsumerSecretRequest = {
  consumerSecretId: string;
};

export type TUpdateConsumerSecretDTO = TCreateConsumerSecretDTO & { id: string };
