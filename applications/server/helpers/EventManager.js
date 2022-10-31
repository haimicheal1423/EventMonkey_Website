import {
    CompositeSource,
    EventMonkeySource,
    TicketMasterSource
} from './EventSource.js';

/**
 * A manager for any request relating to searching, adding, or removing
 * {@link Event}s.
 */
export class EventManager {
    ticketMaster_;
    eventMonkey_;
    composite_;

    constructor() {
        this.ticketMaster_ = new TicketMasterSource();
        this.eventMonkey_ = new EventMonkeySource();
        this.composite_
            = new CompositeSource(this.ticketMaster_, this.eventMonkey_);
    }

    /**
     * Searches an {@link EventSource} for a list of events matching the desired
     * search parameters. Any undefined property in the object literal parameter
     * will be ignored. The resulting event list is unordered.
     * <br>
     * The event source can be changed to collect events from either the
     * TicketMaster or EventMonkey data sources, or both. By default, the source
     * is composite to get events from both the TicketMaster api and the
     * EventMonkey database.
     * <br>
     * <b>Note:</b> the {@link organizerId} will force a search using the
     * EventMonkey source.
     *
     * @param {{
     *     source: string,
     *     eventId: string|number,
     *     classification: Classification,
     *     segment: Genre,
     *     organizerId: number,
     *     keyword: string
     * }} literal event search parameters
     * @param [literal.source = 'composite'] the {@link EventSource} type, which
     *     can be <i>'ticketMaster'</i>, <i>'EventMonkey'</i>,
     *     or <i>'composite'</i> (by default)
     * @param [literal.eventId] the event id, which can be a number for
     *     EventMonkey sources or a string for TicketMaster sources
     * @param [literal.classification] the classification
     * @param [literal.segment] the segment genre
     * @param [literal.organizerId] the id of the {@link Organizer} user type
     * @param [literal.keyword] a search string
     *
     * @return {Array<Event>} the event list of any matching events
     */
    async search({ source = 'composite', eventId, classification, segment,
                   organizerId, keyword }) {
        let eventSource;
        switch (source) {
            case 'ticketMaster':
                eventSource = this.ticketMaster_;
                break;
            case 'eventMonkey':
                eventSource = this.eventMonkey_;
                break;
            case 'composite':
                eventSource = this.composite_;
                break;
            default:
                throw new Error(`No event source defined for: '${source}'`);
        }

        const eventList = [];

        // helper function to reduce line length
        async function addEvents(promise) {
            eventList.push(...(await promise));
        }

        if (eventId) {
            await addEvents(eventSource.findByEventId(eventId));
        }

        if (classification) {
            await addEvents(eventSource.findByClassification(classification));
        }

        if (segment) {
            await addEvents(eventSource.findBySegment(segment));
        }

        if (organizerId) {
            await addEvents(this.eventMonkey_.findByOrganizerId(organizerId));
        }

        if (keyword) {
            await addEvents(eventSource.findByKeyword(keyword));
        }

        return eventList;
    }
}
