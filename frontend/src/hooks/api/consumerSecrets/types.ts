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

export type ConsumerSecretSecretWebLogin = Omit<ConsumerSecret, "fields"> & {
  type: "web-login";
  username: string;
  password: string;
};

export type ConsumerSecretSecretSecureNote = Omit<ConsumerSecret, "fields"> & {
  type: "secure-note";
  content: string;
};

export type ConsumerSecretSecretCreditCard = Omit<ConsumerSecret, "fields"> & {
  type: "credit-card";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};
