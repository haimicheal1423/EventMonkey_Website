import { TicketMasterSource, EventMonkeySource, CompositeSource } from './EventSource.js';

export class EventManager {
    #ticketMaster;
    #eventMonkey;
    #composite;

    constructor() {
        this.#ticketMaster = new TicketMasterSource();
        this.#eventMonkey = new EventMonkeySource();
        this.#composite = new CompositeSource(this.#ticketMaster, this.#eventMonkey);
    }

    async search({ source = 'composite', eventId, classification, segment, organizerId, keyword }) {
        let eventSource;
        switch (source) {
            case 'ticketMaster':
                eventSource = this.#ticketMaster;
                break;
            case 'eventMonkey':
                eventSource = this.#eventMonkey;
                break;
            case 'composite':
                eventSource = this.#composite;
                break;
        }

        const eventList = [];

        if (eventId) {
            eventList.push(...(await eventSource.findByEventId(eventId)));
        }

        if (classification) {
            eventList.push(...(await eventSource.findByClassification(classification)));
        }

        if (segment) {
            eventList.push(...(await eventSource.findBySegment(segment)));
        }

        if (organizerId) {
            eventList.push(...(await this.#eventMonkey.findByOrganizerId(organizerId)));
        }

        if (keyword) {
            eventList.push(...(await eventSource.findByKeyword(keyword)));
        }

        return eventList;
    }
}
