import request from '/@/utils/request';
import type { AgentApiResponse, AgentCategory, AgentCategoryPayload } from '/@/types/agent';

export const getAgentCategoryTree = () => {
	return request({
		url: '/console/agent-categories/tree',
		method: 'get',
	}) as Promise<AgentApiResponse<AgentCategory[]>>;
};

export const createAgentCategory = (data: AgentCategoryPayload) => {
	return request({
		url: '/console/agent-categories',
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<string>>;
};

export const updateAgentCategory = (categoryId: string, data: AgentCategoryPayload) => {
	return request({
		url: `/console/agent-categories/${categoryId}`,
		method: 'put',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const deleteAgentCategory = (categoryId: string) => {
	return request({
		url: `/console/agent-categories/${categoryId}`,
		method: 'delete',
	}) as Promise<AgentApiResponse<boolean>>;
};
