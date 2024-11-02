import { ConsumerSecretType } from "@app/const";

export type TCreateConsumerSecretDTO = {
  type: ConsumerSecretType;
  name?: string;
};

export type ConsumerSecret = {
  id: string;
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
