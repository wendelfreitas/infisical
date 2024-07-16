package util

const (
	CONFIG_FILE_NAME                           = "infisical-config.json"
	CONFIG_FOLDER_NAME                         = ".infisical"
	INFISICAL_DEFAULT_API_URL                  = "https://app.infisical.com/api"
	INFISICAL_DEFAULT_URL                      = "https://app.infisical.com"
	INFISICAL_WORKSPACE_CONFIG_FILE_NAME       = ".infisical.json"
	INFISICAL_TOKEN_NAME                       = "INFISICAL_TOKEN"
	INFISICAL_UNIVERSAL_AUTH_ACCESS_TOKEN_NAME = "INFISICAL_UNIVERSAL_AUTH_ACCESS_TOKEN"

	// Universal Auth
	INFISICAL_UNIVERSAL_AUTH_CLIENT_ID_NAME     = "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"
	INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET_NAME = "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"

	// Kubernetes auth
	INFISICAL_KUBERNETES_SERVICE_ACCOUNT_TOKEN_NAME = "INFISICAL_KUBERNETES_SERVICE_ACCOUNT_TOKEN_PATH"

	// GCP Auth
	INFISICAL_GCP_IAM_SERVICE_ACCOUNT_KEY_FILE_PATH_NAME = "INFISICAL_GCP_IAM_SERVICE_ACCOUNT_KEY_FILE_PATH"

	// Generic env variable used for auth methods that require a machine identity ID
	INFISICAL_MACHINE_IDENTITY_ID_NAME = "INFISICAL_MACHINE_IDENTITY_ID"

	SECRET_TYPE_PERSONAL      = "personal"
	SECRET_TYPE_SHARED        = "shared"
	KEYRING_SERVICE_NAME      = "infisical"
	PERSONAL_SECRET_TYPE_NAME = "personal"
	SHARED_SECRET_TYPE_NAME   = "shared"

	SERVICE_TOKEN_IDENTIFIER        = "service-token"
	UNIVERSAL_AUTH_TOKEN_IDENTIFIER = "universal-auth-token"

	INFISICAL_BACKUP_SECRET = "infisical-backup-secrets"
)

var (
	CLI_VERSION = "devel"
)
