import request from '/@/utils/request';
import type { AgentApiResponse, AgentCategory, AgentCategoryPayload } from '/@/types/agent';

const AGENT_CATEGORY_PREFIX = '/agent-console/console/agent-categories';

export const getAgentCategoryTree = () => {
	return request({
		url: `${AGENT_CATEGORY_PREFIX}/tree`,
		method: 'get',
	}) as Promise<AgentApiResponse<AgentCategory[]>>;
};

export const createAgentCategory = (data: AgentCategoryPayload) => {
	return request({
		url: AGENT_CATEGORY_PREFIX,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<string>>;
};

export const updateAgentCategory = (categoryId: string, data: AgentCategoryPayload) => {
	return request({
		url: `${AGENT_CATEGORY_PREFIX}/${categoryId}`,
		method: 'put',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const deleteAgentCategory = (categoryId: string) => {
	return request({
		url: `${AGENT_CATEGORY_PREFIX}/${categoryId}`,
		method: 'delete',
	}) as Promise<AgentApiResponse<boolean>>;
};
