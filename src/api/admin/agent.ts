import request from '/@/utils/request';
import type {
	AgentAclGrantPayload,
	AgentAclItem,
	AgentAclRevokeParams,
	AgentApiResponse,
	AgentDetail,
	AgentItem,
	AgentOfflinePayload,
	AgentPageQuery,
	AgentPageResult,
	AgentPublishPayload,
	AgentRegisterPayload,
	AgentRegistrationResult,
	AgentRelease,
	AgentUpdatePayload,
} from '/@/types/agent';

const AGENT_CONSOLE_PREFIX = '/agent-console/console';
const AGENT_PAGE_API_PATHS = [`${AGENT_CONSOLE_PREFIX}/agents/page`, `${AGENT_CONSOLE_PREFIX}/agents`];

let agentPageApiPath = AGENT_PAGE_API_PATHS[0];

const requestAgentPage = (url: string, params?: AgentPageQuery) => {
	return request({
		url,
		method: 'get',
		params,
	}) as Promise<AgentApiResponse<AgentPageResult<AgentItem>>>;
};

const shouldFallbackAgentPageApi = (error: unknown) => {
	const requestError = error as { code?: number | string; status?: number | string; msg?: string; message?: string };
	const statusCode = Number(requestError?.status ?? requestError?.code);
	if ([404, 405].includes(statusCode)) {
		return true;
	}

	const errorMessage = `${requestError?.msg ?? requestError?.message ?? ''}`.toLowerCase();
	return errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('no mapping');
};

export const pageAgents = async (params?: AgentPageQuery) => {
	try {
		return await requestAgentPage(agentPageApiPath, params);
	} catch (error) {
		if (!shouldFallbackAgentPageApi(error) || agentPageApiPath === AGENT_PAGE_API_PATHS[1]) {
			throw error;
		}

		agentPageApiPath = AGENT_PAGE_API_PATHS[1];
		return requestAgentPage(agentPageApiPath, params);
	}
};

export const getAgentDetail = (agentId: string) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}`,
		method: 'get',
	}) as Promise<AgentApiResponse<AgentDetail>>;
};

export const createAgent = (data: AgentRegisterPayload) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents`,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<AgentRegistrationResult>>;
};

export const updateAgent = (agentId: string, data: AgentUpdatePayload) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}`,
		method: 'put',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const deleteAgent = (agentId: string) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}`,
		method: 'delete',
	}) as Promise<AgentApiResponse<boolean>>;
};

export const publishAgent = (agentId: string, data: AgentPublishPayload) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/publish`,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const offlineAgent = (agentId: string, data: AgentOfflinePayload = {}) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/offline`,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const listAgentReleases = (agentId: string) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/releases`,
		method: 'get',
	}) as Promise<AgentApiResponse<AgentRelease[]>>;
};

export const healthCheckEndpoint = (agentId: string, endpointId: string) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/endpoints/${endpointId}/health-check`,
		method: 'post',
	}) as Promise<AgentApiResponse<boolean>>;
};

export const listAgentAcl = (agentId: string) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/acl`,
		method: 'get',
	}) as Promise<AgentApiResponse<AgentAclItem[]>>;
};

export const grantAgentAcl = (agentId: string, data: AgentAclGrantPayload) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/acl`,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const revokeAgentAcl = (agentId: string, params: AgentAclRevokeParams) => {
	return request({
		url: `${AGENT_CONSOLE_PREFIX}/agents/${agentId}/acl`,
		method: 'delete',
		params,
	}) as Promise<AgentApiResponse<boolean>>;
};
