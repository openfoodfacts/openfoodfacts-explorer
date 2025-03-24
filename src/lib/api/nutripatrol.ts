import createClient from 'openapi-fetch';
import type { paths } from './nutripatrol.d';
import { NUTRIPATROLSERVICE_URL } from "$lib/const";

type TicketsQuery = paths['/api/v1/tickets']['get']['parameters']['query'];
type TicketCreate = paths['/api/v1/tickets']['post']['requestBody']['content']['application/json'];
type FlagCreate = paths['/api/v1/flags']['post']['requestBody']['content']['application/json'];
type FlagsByTicketIdRequest = paths['/api/v1/flags/batch']['post']['requestBody']['content']['application/json'];

export type Tickets = paths['/api/v1/tickets']['post']['responses']['200']['content']['application/json'];
type TicketStatus = paths['/api/v1/tickets/{ticket_id}/status']['put']['parameters']['query']['status'];

const BASE_URL = NUTRIPATROLSERVICE_URL;


export class NutriPatrolApi {
    private readonly client: ReturnType<typeof createClient<paths>>;
    private readonly fetch: typeof window.fetch;

    constructor(fetch: typeof window.fetch) {
        this.client = createClient({ fetch, baseUrl: BASE_URL, credentials: 'include' });
        this.fetch = fetch;
    }

    getFlags() {
        return this.client.GET('/api/v1/flags');
    }

    createFlag(body: FlagCreate) {
        return this.client.POST('/api/v1/flags', { body });
    }

    getFlagById(flag_id: number) {
        return this.client.GET('/api/v1/flags/{flag_id}', {
            params: { path: { flag_id } }
        });
    }

    getTickets(query: TicketsQuery) {
        return this.client.GET('/api/v1/tickets', { params: { query } });
    }

    createTicket(body: TicketCreate) {
        return this.client.POST('/api/v1/tickets', { body });
    }

    getTicketById(ticket_id: number) {
        return this.client.GET('/api/v1/tickets/{ticket_id}', {
            params: { path: { ticket_id } }
        });
    }

    getFlagsByTicketBatch(body: FlagsByTicketIdRequest) {
        return this.client.POST('/api/v1/flags/batch', { body });
    }

    updateTicketStatus(ticket_id: number, status: TicketStatus) {
        return this.client.PUT('/api/v1/tickets/{ticket_id}/status', {
            params: { 
                path: { ticket_id },
                query: { status }
            }
        });
    }

    async getStatus() {
        const res = await this.client.GET('/api/v1/status');
        return res.data;
    }
}