import { z } from "zod";

import { ConsumerSecretsSchema, ConsumerSecretType } from "@app/db/schemas";
import { EventType } from "@app/ee/services/audit-log/audit-log-types";
import { secretsLimit, writeLimit } from "@app/server/config/rateLimiter";
import { getTelemetryDistinctId } from "@app/server/lib/telemetry";
import { getUserAgentType } from "@app/server/plugins/audit-log";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";
import { PostHogEventTypes } from "@app/services/telemetry/telemetry-types";

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
          id: z.string().trim(),
          orgId: z.string().trim()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { type, name, key, iv, tag, fields } = req.body;
      const { id, orgId } = req.permission;

      const { consumerSecret } = server.services;

      const secret = await consumerSecret.createConsumerSecret({
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

      const promises = [
        server.services.auditLog.createAuditLog({
          ...req.auditLogInfo,
          orgId: secret.orgId,
          event: {
            type: EventType.CREATE_CONSUMER_SECRET,
            metadata: {
              id: secret.id,
              type: secret.type,
              name: secret.name || "",
              orgId: secret.orgId,
              userId: secret.userId
            }
          }
        }),

        server.services.telemetry.sendPostHogEvents({
          event: PostHogEventTypes.ConsumerSecretCreated,
          distinctId: getTelemetryDistinctId(req),
          properties: {
            numberOfSecrets: 1,
            orgId,
            userId: req.permission.id,
            channel: getUserAgentType(req.headers["user-agent"]),
            ...req.auditLogInfo
          }
        })
      ];

      await Promise.all(promises);

      return {
        id: secret.id,
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

      const promises = [
        server.services.auditLog.createAuditLog({
          ...req.auditLogInfo,
          orgId,
          event: {
            type: EventType.GET_CONSUMER_SECRETS,
            metadata: {
              numberOfSecrets: consumerSecrets.length,
              orgId,
              userId: req.permission.id
            }
          }
        }),

        server.services.telemetry.sendPostHogEvents({
          event: PostHogEventTypes.ConsumerSecretPulled,
          distinctId: getTelemetryDistinctId(req),
          properties: {
            numberOfSecrets: consumerSecrets.length,
            orgId,
            userId: req.permission.id,
            channel: getUserAgentType(req.headers["user-agent"]),
            ...req.auditLogInfo
          }
        })
      ];

      await Promise.all(promises);

      return consumerSecrets;
    }
  });

  server.route({
    method: "PUT",
    url: "/:consumerSecretId",
    config: {
      rateLimit: writeLimit
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
      const consumerSecret = req.body;

      const updatedConsumerSecret = await req.server.services.consumerSecret.updateConsumerSecret({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        id: consumerSecretId,
        ...consumerSecret
      });

      const promises = [
        server.services.auditLog.createAuditLog({
          ...req.auditLogInfo,
          orgId: req.permission.orgId,
          event: {
            type: EventType.UPDATE_CONSUMER_SECRET,
            metadata: {
              id: updatedConsumerSecret.id,
              orgId: updatedConsumerSecret.orgId,
              type: updatedConsumerSecret.type,
              name: updatedConsumerSecret.name || "",
              userId: req.permission.id
            }
          }
        }),

        server.services.telemetry.sendPostHogEvents({
          event: PostHogEventTypes.ConsumerSecretUpdated,
          distinctId: getTelemetryDistinctId(req),
          properties: {
            numberOfSecrets: 1,
            orgId: req.permission.orgId,
            userId: req.permission.id,
            channel: getUserAgentType(req.headers["user-agent"]),
            ...req.auditLogInfo
          }
        })
      ];

      await Promise.all(promises);

      return { id: updatedConsumerSecret.id, orgId: updatedConsumerSecret.orgId, type: updatedConsumerSecret.type };
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

      const promises = [
        server.services.auditLog.createAuditLog({
          ...req.auditLogInfo,
          orgId: req.permission.orgId,
          event: {
            type: EventType.UPDATE_CONSUMER_SECRET,
            metadata: {
              id: deletedConsumerSecret.id,
              orgId: deletedConsumerSecret.orgId,
              type: deletedConsumerSecret.type,
              name: deletedConsumerSecret.name || "",
              userId: req.permission.id
            }
          }
        }),

        server.services.telemetry.sendPostHogEvents({
          event: PostHogEventTypes.ConsumerSecretDeleted,
          distinctId: getTelemetryDistinctId(req),
          properties: {
            numberOfSecrets: 1,
            orgId: req.permission.orgId,
            userId: req.permission.id,
            channel: getUserAgentType(req.headers["user-agent"]),
            ...req.auditLogInfo
          }
        })
      ];

      await Promise.all(promises);

      return { id: deletedConsumerSecret.id, orgId: deletedConsumerSecret.orgId, type: deletedConsumerSecret.type };
    }
  });
};
