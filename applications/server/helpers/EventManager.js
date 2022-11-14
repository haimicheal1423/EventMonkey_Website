import { EventMonkeySource, TicketMasterSource, CompositeSource } from './EventSource.js';
import { SOURCE_EVENT_MONKEY, Event } from "../models/Event.js";

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

        this.composite_ = new CompositeSource(
            this.eventMonkey_,
            this.ticketMaster_
        );
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
     * <b>Note:</b> the {@link userId} will force a search using the
     * EventMonkey source.
     *
     * @param {{
     *         source: string,
     *         limit: number,
     *         eventId: number,
     *         genres: string|string[],
     *         userId: number,
     *         keyword: string
     *     }} literal event search parameters
     * @param [literal.source = 'composite'] the {@link EventSource} type, which
     *     can be <i>'ticketMaster'</i>, <i>'EventMonkey'</i>,
     *     or <i>'composite'</i> (by default)
     * @param [literal.limit = 20] the maximum size of the resulting array
     * @param [literal.eventId] the event id, which can be a number for
     *     EventMonkey sources or a string for TicketMaster sources
     * @param [literal.genres] the genre name (or an array of names)
     * @param [literal.userId] the EventMonkey {@link User} id
     * @param [literal.keyword] a search string
     *
     * @returns {Promise<Event[]>} the event list of any matching events
     */
    async search({ source = 'composite', limit = 20, eventId, genres, userId,
                   keyword }) {
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
                throw new Error(`No event source defined for: ${source}`);
        }

        const promises = [];

        if (eventId) {
            promises.push(eventSource.findByEventId(eventId));
        }

        if (genres) {
            let names;
            if (Array.isArray(genres)) {
                names = genres;
            } else {
                names = [genres];
            }
            promises.push(eventSource.findByGenre(names, limit));
        }

        if (userId) {
            promises.push(this.eventMonkey_.findByUserId(userId));
        }

        if (keyword) {
            promises.push(eventSource.findByKeyword(keyword, limit));
        }

        // flatten the resolved array of event lists into one array
        const eventList = (await Promise.all(promises)).flat(1);

        // trim the events list to the limit
        eventList.length = Math.min(eventList.length, limit);

        return eventList;
    }

    /**
     * Creates an {@link Event} object and stores it in the database.
     *
     * @param {number} organizerId
     * @param {string} name
     * @param {string} description
     * @param {string} location
     * @param {{ startDateTime: Date, [endDateTime: Date] }} dates
     * @param {{ currency: string, min: number, max: number }[]} priceRanges
     * @param {Image[]} images
     * @param {Genre[]} genres
     * @return {Promise<number|undefined>} a promise for the generated event id
     */
    async createEvent(organizerId, name, description, location, dates,
                      priceRanges, genres, images) {

        // TODO: this data needs to be verified to be in the correct format.
        //       Verify if the user id is an Organizer user type who owns this
        //       event

        const event = new Event(
            // all created events belong to EventMonkey source
            SOURCE_EVENT_MONKEY,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        await this.eventMonkey_.createEvent(organizerId, event);

        return Number(event.id);
    }
}
