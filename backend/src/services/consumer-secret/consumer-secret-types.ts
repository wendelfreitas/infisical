type ConsumerSecretType = "web-login" | "credit-card" | "secure-note";

export type TCreateConsumerSecretDTO = {
  type: ConsumerSecretType;
  name?: string;
  orgId: string;
  userId: string;
  key: string;
  iv: string;
  tag: string;
  fields: string;
};

export type TGetConsumerSecretsByOrgIdDTO = {
  orgId: string;
  userId: string;
};
