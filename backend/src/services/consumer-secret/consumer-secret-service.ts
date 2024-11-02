import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { ForbiddenRequestError } from "@app/lib/errors";

import { TConsumerSecretDALFactory } from "./consumer-secret-dal";
import {
  TCreateConsumerSecretDTO,
  TDeleteConsumerSecretByIdDTO,
  TGetConsumerSecretsByOrgIdDTO
} from "./consumer-secret-types";

type TConsumerSecretServiceFactoryDep = {
  consumerSecretDAL: TConsumerSecretDALFactory;
  permissionService: Pick<TPermissionServiceFactory, "getOrgPermission">;
};

export type TConsumerSecretServiceFactory = ReturnType<typeof consumerSecretServiceFactory>;

export const consumerSecretServiceFactory = ({
  consumerSecretDAL,
  permissionService
}: TConsumerSecretServiceFactoryDep) => {
  const createConsumerSecret = async ({
    type,
    name,
    key,
    iv,
    tag,
    fields,
    orgId,
    userId,
    actor,
    actorId,
    actorAuthMethod,
    actorOrgId
  }: TCreateConsumerSecretDTO) => {
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);

    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });

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

  const getConsumerSecretsByOrgId = async ({
    userId,
    orgId,
    actor,
    actorId,
    actorAuthMethod,
    actorOrgId
  }: TGetConsumerSecretsByOrgIdDTO) => {
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);

    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });

    const secrets = await consumerSecretDAL.getConsumerSecretsByOrgId(userId, orgId);

    return secrets;
  };

  const deleteConsumerSecretById = async ({
    id,
    orgId,
    actor,
    actorId,
    actorAuthMethod,
    actorOrgId
  }: TDeleteConsumerSecretByIdDTO) => {
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);

    if (!permission) throw new ForbiddenRequestError({ name: "User does not belong to the specified organization" });

    const excluded = await consumerSecretDAL.deleteById(id);

    return excluded;
  };

  return { createConsumerSecret, getConsumerSecretsByOrgId, deleteConsumerSecretById };
};
