import { TSharedSecretPermission } from "../secret-sharing/secret-sharing-types";

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
} & TSharedSecretPermission;

export type TUpdateConsumerSecretDTO = Omit<TCreateConsumerSecretDTO, "userId"> & { id: string };

export type TGetConsumerSecretsByOrgIdDTO = {
  orgId: string;
  userId: string;
} & TSharedSecretPermission;

export type TDeleteConsumerSecretByIdDTO = {
  id: string;
} & TSharedSecretPermission;
