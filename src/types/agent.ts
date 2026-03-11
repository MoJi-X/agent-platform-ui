export type JsonObject = Record<string, unknown>;

export type AgentFrameworkType = 'LANGCHAIN' | 'DIFY' | 'OPENAI_COMPAT' | 'CUSTOM';
export type AgentStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE' | 'DISABLED';
export type AgentVisibilityScope = 'PRIVATE' | 'DEPT' | 'PUBLIC';
export type AgentHealthStatus = 'UNKNOWN' | 'HEALTHY' | 'UNHEALTHY';
export type AgentAuthType = 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC' | 'OAUTH2_CLIENT_CREDENTIALS' | 'CUSTOM_HEADER';
export type AgentEndpointProtocol = 'HTTP' | 'SSE' | 'WS';
export type AgentSubjectType = 'USER' | 'ROLE' | 'DEPT';
export type AgentGrantSource = 'MANUAL' | 'ROLE_DEFAULT' | 'DEPT_DEFAULT';
export type AgentReleaseActionType = 'PUBLISH' | 'OFFLINE';
export type AgentRegistrationSource = 'CONSOLE' | 'OPEN_API' | 'IMPORT';
export type AgentMetaStatus = 'ACTIVE' | 'INACTIVE';
export type AgentSchemaSpecVersion = 'draft-2020-12';

export interface AgentApiResponse<T> {
	code: number;
	msg: string | null;
	data: T | null;
}

export interface AgentPageResult<T> {
	records: T[];
	total: number;
	size: number;
	current: number;
	pages: number;
}

export interface AgentOptionItem<T extends string | number = string> {
	value: T;
	labelKey: string;
	tagType?: '' | 'success' | 'warning' | 'danger' | 'info';
}

export interface AgentPermissionOptionItem {
	key: AgentPermissionKey;
	value: number;
	labelKey: string;
}

export interface AgentPageQuery {
	current?: number;
	size?: number;
	keyword?: string;
	status?: AgentStatus;
	frameworkType?: AgentFrameworkType;
	categoryId?: string;
	tagId?: string;
	ownerDeptId?: string;
	onlyMine?: boolean;
	onlyAuthorized?: boolean;
}

export interface AgentTagPageQuery {
	current?: number;
	size?: number;
	keyword?: string;
	status?: AgentMetaStatus;
}

export interface AgentCategory {
	categoryId: string;
	parentId?: string | null;
	categoryCode: string;
	categoryName: string;
	status: AgentMetaStatus;
	sortOrder?: number | null;
	children?: AgentCategory[];
}

export interface AgentTag {
	tagId: string;
	tagCode: string;
	tagName: string;
	tagColor?: string | null;
	status: AgentMetaStatus;
}

export interface AgentRelease {
	releaseId: string;
	agentId: string;
	endpointId?: string | null;
	releaseNo: number;
	actionType: AgentReleaseActionType;
	releaseNote?: string | null;
	operatorUserId: string;
	createdAt: string;
}

export interface AgentEndpoint {
	endpointId: string;
	endpointName: string;
	frameworkType: AgentFrameworkType;
	protocol: AgentEndpointProtocol;
	streamMode: boolean;
	baseUrl: string;
	invokePath: string;
	healthcheckUrl?: string | null;
	timeoutMs: number;
	authType: AgentAuthType;
	authConfig?: JsonObject;
	authCredentialId?: string | null;
	secretPayloadMask?: JsonObject | null;
	headersJson?: JsonObject;
	mappingJson?: JsonObject;
	healthStatus: AgentHealthStatus;
	lastHealthCheckAt?: string | null;
	lastHealthCheckMessage?: string | null;
	enabled: boolean;
	isDefault: boolean;
}

export interface AgentItem {
	agentId: string;
	agentCode: string;
	agentName: string;
	frameworkType: AgentFrameworkType;
	status: AgentStatus;
	visibilityScope: AgentVisibilityScope;
	ownerUserId: string;
	ownerDeptId: string;
	categoryId?: string | null;
	categoryName?: string | null;
	tagNames: string[];
	healthStatus?: AgentHealthStatus | null;
	publishedAt?: string | null;
	updatedAt: string;
	myPermMask: number;
}

export interface AgentDetail extends AgentItem {
	description?: string | null;
	frameworkConfig?: JsonObject;
	schemaSpecVersion?: AgentSchemaSpecVersion | null;
	inputSchema?: JsonObject;
	outputSchema?: JsonObject;
	metadataJson?: JsonObject;
	defaultEndpointId?: string | null;
	currentReleaseId?: string | null;
	offlineAt?: string | null;
	category?: AgentCategory | null;
	tags: AgentTag[];
	currentRelease?: AgentRelease | null;
	endpoints: AgentEndpoint[];
}

export interface AgentCredentialPayload {
	credentialMode: 'INLINE';
	credentialCode?: string;
	credentialName?: string;
	secretPayload: JsonObject;
}

export interface AgentEndpointAuthPayload {
	authType?: AgentAuthType;
	authConfig?: JsonObject;
	authCredentialId?: string;
	credential?: AgentCredentialPayload;
}

export interface AgentEndpointPayload {
	endpointId?: string;
	endpointName?: string;
	protocol: AgentEndpointProtocol;
	streamMode: boolean;
	baseUrl: string;
	invokePath: string;
	healthcheckUrl?: string;
	timeoutMs: number;
	auth?: AgentEndpointAuthPayload;
	headersJson?: JsonObject;
	mappingJson?: JsonObject;
	enabled?: boolean;
	isDefault?: boolean;
}

export interface AgentRegisterPayload {
	agentCode: string;
	agentName: string;
	description?: string;
	frameworkType: AgentFrameworkType;
	frameworkConfig?: JsonObject;
	schemaSpecVersion?: AgentSchemaSpecVersion;
	inputSchema?: JsonObject;
	outputSchema?: JsonObject;
	metadataJson?: JsonObject;
	visibilityScope: AgentVisibilityScope;
	categoryId?: string;
	tagIds?: string[];
	ownerDeptId?: string;
	endpoint: AgentEndpointPayload;
}

export interface AgentUpdatePayload {
	agentName?: string;
	description?: string;
	frameworkType?: AgentFrameworkType;
	frameworkConfig?: JsonObject;
	schemaSpecVersion?: AgentSchemaSpecVersion;
	inputSchema?: JsonObject;
	outputSchema?: JsonObject;
	metadataJson?: JsonObject;
	visibilityScope?: AgentVisibilityScope;
	categoryId?: string;
	tagIds?: string[];
	defaultEndpointId?: string;
	endpoint?: AgentEndpointPayload;
}

export interface AgentRegistrationResult {
	agentId: string;
	agentCode: string;
	status: AgentStatus;
	registrationSource: AgentRegistrationSource;
}

export interface AgentPublishPayload {
	endpointId: string;
	releaseNote?: string;
}

export interface AgentOfflinePayload {
	releaseNote?: string;
}

export interface AgentAclItem {
	aclId: string;
	agentId: string;
	subjectType: AgentSubjectType;
	subjectId: string;
	subjectName?: string;
	permissionMask: number;
	grantSource: AgentGrantSource;
	expiresAt?: string | null;
	remarks?: string | null;
	grantedBy?: string | null;
	createdAt: string;
}

export interface AgentAclGrantPayload {
	subjectType: AgentSubjectType;
	subjectId: string;
	permissionMask: number;
	grantSource?: AgentGrantSource;
	expiresAt?: string;
	remarks?: string;
}

export interface AgentAclRevokeParams {
	subjectType: AgentSubjectType;
	subjectId: string;
}

export interface AgentCategoryPayload {
	parentId?: string;
	categoryCode: string;
	categoryName: string;
	sortOrder?: number;
	status?: AgentMetaStatus;
}

export interface AgentTagPayload {
	tagCode: string;
	tagName: string;
	tagColor?: string;
	status?: AgentMetaStatus;
}

export const AGENT_DEFAULT_SCHEMA_SPEC_VERSION: AgentSchemaSpecVersion = 'draft-2020-12';

export const AGENT_VALIDATION = {
	idPattern: /^[1-9]\d{0,18}$/,
	codePattern: /^[a-z][a-z0-9_-]{1,63}$/,
	colorPattern: /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/,
	pathPattern: /^\/.{0,255}$/,
	maxNameLength: 64,
	maxDescriptionLength: 500,
	maxReleaseNoteLength: 200,
	maxRemarksLength: 200,
	maxKeywordLength: 64,
	maxTagCount: 50,
	minPage: 1,
	maxPageSize: 100,
	minTimeoutMs: 1000,
	maxTimeoutMs: 120000,
	minPermissionMask: 1,
	maxPermissionMask: 255,
	maxSortOrder: 9999,
} as const;

export const AGENT_PERMISSION_CODES = {
	VIEW: 'ai_agent_view',
	ADD: 'ai_agent_add',
	EDIT: 'ai_agent_edit',
	PUBLISH: 'ai_agent_publish',
	OFFLINE: 'ai_agent_offline',
	DELETE: 'ai_agent_del',
	GRANT: 'ai_agent_grant',
	CATEGORY: 'ai_agent_category',
	TAG: 'ai_agent_tag',
} as const;

export const AGENT_PERMISSION_BITS = {
	VIEW: 1,
	EDIT: 2,
	PUBLISH: 4,
	DELETE: 8,
	GRANT: 16,
	INVOKE: 32,
	DATA_VIEW: 64,
	DATA_EDIT: 128,
} as const;

export type AgentPermissionKey = keyof typeof AGENT_PERMISSION_BITS;

export const AGENT_PERMISSION_LABEL_KEYS: Record<AgentPermissionKey, string> = {
	VIEW: 'agent.enums.permission.view',
	EDIT: 'agent.enums.permission.edit',
	PUBLISH: 'agent.enums.permission.publish',
	DELETE: 'agent.enums.permission.delete',
	GRANT: 'agent.enums.permission.grant',
	INVOKE: 'agent.enums.permission.invoke',
	DATA_VIEW: 'agent.enums.permission.dataView',
	DATA_EDIT: 'agent.enums.permission.dataEdit',
};

export const AGENT_STATUS_OPTIONS: AgentOptionItem<AgentStatus>[] = [
	{ value: 'DRAFT', labelKey: 'agent.enums.status.draft', tagType: 'info' },
	{ value: 'PUBLISHED', labelKey: 'agent.enums.status.published', tagType: 'success' },
	{ value: 'OFFLINE', labelKey: 'agent.enums.status.offline', tagType: 'warning' },
	{ value: 'DISABLED', labelKey: 'agent.enums.status.disabled', tagType: 'danger' },
];

export const VISIBILITY_SCOPE_OPTIONS: AgentOptionItem<AgentVisibilityScope>[] = [
	{ value: 'PRIVATE', labelKey: 'agent.enums.visibilityScope.private', tagType: 'info' },
	{ value: 'DEPT', labelKey: 'agent.enums.visibilityScope.dept', tagType: 'warning' },
	{ value: 'PUBLIC', labelKey: 'agent.enums.visibilityScope.public', tagType: 'success' },
];

export const FRAMEWORK_TYPE_OPTIONS: AgentOptionItem<AgentFrameworkType>[] = [
	{ value: 'LANGCHAIN', labelKey: 'agent.enums.frameworkType.langchain' },
	{ value: 'DIFY', labelKey: 'agent.enums.frameworkType.dify' },
	{ value: 'OPENAI_COMPAT', labelKey: 'agent.enums.frameworkType.openaiCompat' },
	{ value: 'CUSTOM', labelKey: 'agent.enums.frameworkType.custom' },
];

export const AUTH_TYPE_OPTIONS: AgentOptionItem<AgentAuthType>[] = [
	{ value: 'NONE', labelKey: 'agent.enums.authType.none' },
	{ value: 'API_KEY', labelKey: 'agent.enums.authType.apiKey' },
	{ value: 'BEARER_TOKEN', labelKey: 'agent.enums.authType.bearerToken' },
	{ value: 'BASIC', labelKey: 'agent.enums.authType.basic' },
	{ value: 'OAUTH2_CLIENT_CREDENTIALS', labelKey: 'agent.enums.authType.oauth2ClientCredentials' },
	{ value: 'CUSTOM_HEADER', labelKey: 'agent.enums.authType.customHeader' },
];

export const HEALTH_STATUS_OPTIONS: AgentOptionItem<AgentHealthStatus>[] = [
	{ value: 'UNKNOWN', labelKey: 'agent.enums.healthStatus.unknown', tagType: 'info' },
	{ value: 'HEALTHY', labelKey: 'agent.enums.healthStatus.healthy', tagType: 'success' },
	{ value: 'UNHEALTHY', labelKey: 'agent.enums.healthStatus.unhealthy', tagType: 'danger' },
];

export const ACL_SUBJECT_TYPE_OPTIONS: AgentOptionItem<AgentSubjectType>[] = [
	{ value: 'USER', labelKey: 'agent.enums.subjectType.user' },
	{ value: 'ROLE', labelKey: 'agent.enums.subjectType.role' },
	{ value: 'DEPT', labelKey: 'agent.enums.subjectType.dept' },
];

export const ENDPOINT_PROTOCOL_OPTIONS: AgentOptionItem<AgentEndpointProtocol>[] = [
	{ value: 'HTTP', labelKey: 'agent.enums.protocol.http' },
	{ value: 'SSE', labelKey: 'agent.enums.protocol.sse' },
	{ value: 'WS', labelKey: 'agent.enums.protocol.ws' },
];

export const AGENT_META_STATUS_OPTIONS: AgentOptionItem<AgentMetaStatus>[] = [
	{ value: 'ACTIVE', labelKey: 'agentMeta.enums.status.active', tagType: 'success' },
	{ value: 'INACTIVE', labelKey: 'agentMeta.enums.status.inactive', tagType: 'info' },
];

export const ACL_GRANT_SOURCE_OPTIONS: AgentOptionItem<AgentGrantSource>[] = [
	{ value: 'MANUAL', labelKey: 'agent.enums.grantSource.manual' },
	{ value: 'ROLE_DEFAULT', labelKey: 'agent.enums.grantSource.roleDefault' },
	{ value: 'DEPT_DEFAULT', labelKey: 'agent.enums.grantSource.deptDefault' },
];

export const RELEASE_ACTION_OPTIONS: AgentOptionItem<AgentReleaseActionType>[] = [
	{ value: 'PUBLISH', labelKey: 'agent.enums.releaseAction.publish', tagType: 'success' },
	{ value: 'OFFLINE', labelKey: 'agent.enums.releaseAction.offline', tagType: 'warning' },
];

const AGENT_PERMISSION_KEY_ORDER: AgentPermissionKey[] = ['VIEW', 'EDIT', 'PUBLISH', 'DELETE', 'GRANT', 'INVOKE', 'DATA_VIEW', 'DATA_EDIT'];

export const AGENT_PERMISSION_OPTIONS: AgentPermissionOptionItem[] = AGENT_PERMISSION_KEY_ORDER.map((key) => ({
	key,
	value: AGENT_PERMISSION_BITS[key],
	labelKey: AGENT_PERMISSION_LABEL_KEYS[key],
}));

const normalizePermissionMask = (mask?: number | string | null) => {
	const normalizedMask = Number(mask ?? 0);
	if (Number.isNaN(normalizedMask) || normalizedMask < 0) {
		return 0;
	}
	return Math.trunc(normalizedMask);
};

export const permMaskToKeys = (mask?: number | string | null) => {
	const normalizedMask = normalizePermissionMask(mask);
	return AGENT_PERMISSION_KEY_ORDER.filter((key) => (normalizedMask & AGENT_PERMISSION_BITS[key]) === AGENT_PERMISSION_BITS[key]);
};

export const permKeysToMask = (keys: AgentPermissionKey[] = []) => {
	return Array.from(new Set(keys)).reduce((mask, key) => mask | AGENT_PERMISSION_BITS[key], 0);
};

export const hasPerm = (mask: number | string | null | undefined, key: AgentPermissionKey) => {
	const normalizedMask = normalizePermissionMask(mask);
	return (normalizedMask & AGENT_PERMISSION_BITS[key]) === AGENT_PERMISSION_BITS[key];
};
