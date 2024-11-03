import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { decryptSymmetric } from "@app/components/utilities/cryptography/crypto";
import { apiRequest } from "@app/config/request";
import { ConsumerSecretType } from "@app/const";

import { ConsumerSecret } from "./types";

type UseGetConsumerSecretsType = {
  type: ConsumerSecretType;
  orgId: string;
  options?: Omit<UseQueryOptions<ConsumerSecret[]>, "queryFn">;
};

export const useGetConsumerSecretsByOrgId = ({ type, orgId, options }: UseGetConsumerSecretsType) =>
  useQuery({
    enabled: Boolean(orgId) && Boolean(type),
    queryKey: ["consumer-secrets", orgId, type],
    queryFn: async () => {
      const { data } = await apiRequest.get<ConsumerSecret[]>(`/api/v1/consumer-secrets/${orgId}`);

      const secrets = data || [];

      return secrets
        .filter((secret) => secret.type === type)
        .map((secret) => {
          const fields = JSON.parse(
            decryptSymmetric({
              ciphertext: secret.fields,
              iv: secret.iv,
              key: secret.key,
              tag: secret.tag
            })
          );

          return {
            id: secret.id,
            name: secret.name,
            ...fields,
            createdAt: secret.createdAt,
            updatedAt: secret.updatedAt
          };
        });
    },
    ...options
  });
