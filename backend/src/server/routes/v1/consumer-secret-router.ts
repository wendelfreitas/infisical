import { z } from "zod";

import { ConsumerSecretsSchema, ConsumerSecretType } from "@app/db/schemas";
import { secretsLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerConsumerSecretRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: secretsLimit
    },
    schema: {
      body: z.object({
        type: z.nativeEnum(ConsumerSecretType),
        name: z.string().trim(),
        key: z.string().trim(),
        iv: z.string().trim(),
        tag: z.string().trim(),
        fields: z.string().trim()
      }),
      response: {
        201: z.object({
          orgId: z.string().trim()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { type, name, key, iv, tag, fields } = req.body;
      const { id, orgId } = req.permission;

      const { consumerSecret } = server.services;

      await consumerSecret.createConsumerSecret({
        type,
        name,
        key,
        iv,
        tag,
        fields,
        userId: id,
        orgId,
        actor: req.permission.type,
        actorId: req.permission.id,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: orgId
      });

      return {
        orgId
      };
    }
  });

  server.route({
    url: "/:orgId",
    method: "GET",
    config: {
      rateLimit: secretsLimit
    },
    schema: {
      params: z.object({
        orgId: z.string().trim().uuid()
      }),
      response: {
        200: ConsumerSecretsSchema.array()
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY, AuthMode.SERVICE_TOKEN, AuthMode.IDENTITY_ACCESS_TOKEN]),
    handler: async (req) => {
      const { orgId } = req.params;

      const consumerSecrets = await server.services.consumerSecret.getConsumerSecretsByOrgId({
        userId: req.permission.id,
        orgId,
        actor: req.permission.type,
        actorId: req.permission.id,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId
      });

      return consumerSecrets;
    }
  });

  server.route({
    method: "DELETE",
    url: "/:consumerSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        consumerSecretId: z.string()
      }),
      response: {
        200: z.object({
          id: z.string(),
          orgId: z.string(),
          type: z.string()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { consumerSecretId } = req.params;

      const deletedConsumerSecret = await req.server.services.consumerSecret.deleteConsumerSecretById({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        id: consumerSecretId
      });

      return { id: deletedConsumerSecret.id, orgId: deletedConsumerSecret.orgId, type: deletedConsumerSecret.type };
    }
  });
};
