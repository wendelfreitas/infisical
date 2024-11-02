import crypto from "crypto";

import { MutationOptions, useMutation } from "@tanstack/react-query";

import { encryptSymmetric } from "@app/components/utilities/cryptography/crypto";
import { apiRequest } from "@app/config/request";

import { TCreateConsumerSecretDTO } from "./types";

export const useCreateConsumerSecret = ({
  options
}: {
  options?: Omit<MutationOptions<{ orgId: string }, {}, TCreateConsumerSecretDTO>, "mutationFn">;
} = {}) => {
  return useMutation<{ orgId: string }, {}, TCreateConsumerSecretDTO>({
    mutationFn: async ({ type, name, ...rest }) => {
      const dataToEncrypt = rest;

      const key = crypto.randomBytes(16).toString("hex");

      const {
        iv,
        tag,
        ciphertext: fields
      } = encryptSymmetric({
        key,
        plaintext: JSON.stringify(dataToEncrypt)
      });

      const body = {
        type,
        name,
        key,
        iv,
        tag,
        fields
      };

      const { data } = await apiRequest.post<{ orgId: string }>("/api/v1/consumer-secrets", body);
      return data;
    },

    ...options
  });
};
