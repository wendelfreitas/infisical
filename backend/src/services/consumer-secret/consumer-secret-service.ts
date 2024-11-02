import { TConsumerSecretDALFactory } from "./consumer-secret-dal";
import { TCreateConsumerSecretDTO, TGetConsumerSecretsByOrgIdDTO } from "./consumer-secret-types";

type TConsumerSecretServiceFactoryDep = {
  consumerSecretDAL: TConsumerSecretDALFactory;
};

export type TConsumerSecretServiceFactory = ReturnType<typeof consumerSecretServiceFactory>;

export const consumerSecretServiceFactory = ({ consumerSecretDAL }: TConsumerSecretServiceFactoryDep) => {
  const createConsumerSecret = async ({
    type,
    name,
    key,
    iv,
    tag,
    fields,
    orgId,
    userId
  }: TCreateConsumerSecretDTO) => {
    const consumerSecret = await consumerSecretDAL.create({
      type,
      name,
      key,
      iv,
      tag,
      orgId,
      userId,
      fields
    });

    return consumerSecret;
  };

  const getConsumerSecretsByOrgId = async ({ userId, orgId }: TGetConsumerSecretsByOrgIdDTO) => {
    const secrets = await consumerSecretDAL.getConsumerSecretsByOrgId(userId, orgId);

    return secrets;
  };

  return { createConsumerSecret, getConsumerSecretsByOrgId };
};
