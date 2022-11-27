import { EventMonkeySource, TicketMasterSource, CompositeSource } from './EventSource.js';
import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER, Event } from "../models/Event.js";
import { TYPE_ATTENDEE, TYPE_ORGANIZER } from "../models/User.js";
import { DataSource } from './Database.js';
import { Genre } from "../models/Genre.js";
import { userManager } from "../routes/user.js";

/**
 * A manager for any request relating to searching, adding, or removing
 * {@link Event}s.
 */
export class EventManager {

    /**
     * @private
     * @const
     * @type {DataSource}
     */
    dataSource_;

    /**
     * @private
     * @const
     * @type {TicketMasterSource}
     */
    ticketMaster_;

    /**
     * @private
     * @const
     * @type {EventMonkeySource}
     */
    eventMonkey_;

    /**
     * @private
     * @const
     * @type {CompositeSource}
     */
    composite_;

    /**
     * @param {DataSource} dataSource
     */
    constructor(dataSource) {
        this.dataSource_ = dataSource;

        this.ticketMaster_ = new TicketMasterSource();
        this.eventMonkey_ = new EventMonkeySource(this.dataSource_);

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
     *
     * @param {{
     *         source: string,
     *         limit: number,
     *         genres: string|string[],
     *         keyword: string
     *     }} literal event search parameters
     * @param [literal.source] the {@link EventSource} type, which
     *     can be {@link SOURCE_TICKET_MASTER} or {@link SOURCE_EVENT_MONKEY}
     *     By default, the composite event source will be used.
     * @param [literal.limit = 20] the maximum size of the resulting array
     * @param [literal.genres] the genre name (or an array of names)
     * @param [literal.keyword] a search string
     *
     * @returns {Promise<Event[]>} the event list of any matching events
     */
    async search({ source, limit = 20, genres, keyword }) {
        let eventSource;
        switch (source?.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                eventSource = this.eventMonkey_;
                break;
            case SOURCE_TICKET_MASTER:
                eventSource = this.ticketMaster_;
                break;
            default:
                eventSource = this.composite_;
                break;
        }

        const workList = [];

        if (genres) {
            const names = genres.split(",");
            workList.push(eventSource.findByGenre(names, limit));
        }

        if (keyword) {
            workList.push(eventSource.findByKeyword(keyword, limit));
        }

        // flatten the resolved array of event lists into one array, then filter
        // out any undefined (event not found) results
        const eventList = (await Promise.all(workList))
                            .flat(1)
                            .filter(event => event !== undefined);

        // trim the events list to the limit
        eventList.length = Math.min(eventList.length, limit);

        return eventList;
    }

    /**
     * Gets an array of all events stored in the EventMonkey database.
     *
     * @returns {Promise<Event[]>}
     */
    async getAllEvents() {
        const eventIds = await this.dataSource_.getAllEventIds();

        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.eventMonkey_.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }

    /**
     * Finds all recommended events for a given user id.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} [limit] the event list limit (default max 20 events)
     *
     * @returns {Promise<Event[]>} the recommended events
     */
    async getRecommendedEvents(userId, limit = 20) {
        const failMessage = await userManager.checkUserType(userId,
                                                            TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const interests = await this.dataSource_.getInterestList(userId);
        const fromFriends = await this.dataSource_.getFriendInterests(userId);

        if (fromFriends && fromFriends.length) {
            interests.concat(fromFriends);
        }

        const genreNames = interests.map(genre => genre.name);
        return await this.composite_.findByGenre(genreNames, limit);
    }

    /**
     * Finds a single event by either the EventMonkey id or the TicketMaster id.
     * The event source is composite by default.
     *
     * @param {{[source]: string, eventId: number|string}} options
     *     the search options
     * @param [options.source] the event source, either
     *     {@link SOURCE_EVENT_MONKEY} or {@link SOURCE_TICKET_MASTER}
     * @param options.eventId the event id
     *
     * @returns {Promise<Event>} the event
     */
    async findEventById({ source, eventId }) {
        switch (source?.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                return await this.eventMonkey_.findByEventId(eventId);

            case SOURCE_TICKET_MASTER:
                return await this.ticketMaster_.findByEventId(eventId);

            default:
                return await this.composite_.findByEventId(eventId);
        }
    }

    /**
     * Finds a list of events associated with a user. If the user is an
     * {@link Organizer}, the events are all created and owned by that user. If
     * the user is an {@link Attendee}, the event list is that user's favorite
     * list.
     *
     * @param {number} userId the user id
     *
     * @returns {Promise<Event[]>} the user's event list
     */
    async findEventsByUserId(userId) {
        // an Event[][] list once the promise resolves
        const list = await Promise.all([
            this.eventMonkeyEventList_(userId),
            this.ticketMasterEventList_(userId),
        ]);

        // flatten to Event[]
        return list.flat(1);
    }

    /**
     * Get an array of {@link Event}s where each {@link Event.source} type
     * matches the `'eventMonkey'` data source.
     *
     * @param {number} userId
     *
     * @returns {Promise<Event[]>}
     * @private
     */
    async eventMonkeyEventList_(userId) {
        // get the user's EventMonkey event ids
        const eventIds = await this.dataSource_.getEventMonkeyList(userId);

        // find and construct all EventMonkey event objects
        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.eventMonkey_.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }

    /**
     * Get an array of {@link Event}s from the TicketMaster data source, where
     * the user has the event id in their event list.
     *
     * @param {number} userId
     *
     * @returns {Promise<Event[]>}
     * @private
     */
    async ticketMasterEventList_(userId) {
        // get the user's TicketMaster event ids
        const eventIds = await this.dataSource_.getTicketMasterList(userId);

        // find and construct all TicketMaster event objects
        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.ticketMaster_.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }

    /**
     * Adds an event to the user's event list. The event list source type is
     * determined by the {@link Event.source}. This only affects the database
     * and will not change the user or event objects.
     *
     * @param {number} userId the EventMonkey user id
     * @param {Event} event the event
     *
     * @returns {Promise<boolean|*>}
     *
     * @throws {Error} if the event source is not `'eventMonkey'` or
     *     `'ticketMaster'`
     */
    async addEventToList(userId, event) {
        const {
            addToEventMonkeyList,
            addToTicketMasterList
        } = this.dataSource_;

        switch (event.source.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                return addToEventMonkeyList(userId, event.id);
            case SOURCE_TICKET_MASTER:
                return addToTicketMasterList(userId, event.id);
            default:
                throw new Error(`Unknown event source: ${event.source}`);
        }
    }

    /**
     * Removes an event from the user's event list. The event list source type
     * is determined by the {@link Event.source}. This only affects the database
     * and will not change the user or event objects.
     *
     * @param {number} userId the EventMonkey user id
     * @param {Event} event the event
     *
     * @returns {Promise<boolean|*>}
     *
     * @throws {Error} if the event source is not `'eventMonkey'` or
     *     `'ticketMaster'`
     */
    async removeEventFromList(userId, event) {
        const {
            removeFromEventMonkeyList,
            removeFromTicketMasterList
        } = this.dataSource_;

        switch (event.source.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                return removeFromEventMonkeyList(userId, event.id);
            case SOURCE_TICKET_MASTER:
                return removeFromTicketMasterList(userId, event.id);
            default:
                throw new Error(`Unknown event source: ${event.source}`);
        }
    }

    /**
     * Create an event by inserting it into the database. The event id will get
     * set if the insert operation was successful, and the event will be
     * assigned to the organizer.
     *
     * @param {number} userId
     * @param {string} name
     * @param {string} description
     * @param {string} location
     * @param {{ startDateTime: Date, [endDateTime]: Date }} dates
     * @param {{ currency: string, min: number, max: number }[]} priceRanges
     * @param {Genre[]} genres
     * @param {Image[]} images
     *
     * @returns {Promise<{ eventId: number } | { message: string }>} a promise
     *     for the generated event id, or a failure message
     */
    async createEvent(userId, name, description, location, dates, priceRanges,
                      genres, images) {
        const failMessage = await userManager.checkUserType(userId,
                                                            TYPE_ORGANIZER);

        if (failMessage) {
            // user is not organizer type
            return { message: failMessage.message };
        }

        // TODO: consider user JOI npm package for schema validation:
        //       https://joi.dev/api/?v=17.7.0

        Event.verifyName(name);
        Event.verifyDescription(description);
        Event.verifyLocation(location);
        Event.verifyDates(dates);
        Event.verifyPriceRanges(priceRanges);
        Event.verifyGenres(genres);
        Event.verifyImages(images);

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

        const eventId = await this.dataSource_.addEventDetails(event);

        if (!eventId) {
            // there is no record of the event in the database, so do not add
            // any other associations using this event
            return { message: 'Failed to add event details' };
        }

        // cast BigInt into regular number
        event.id = Number(eventId);

        // asynchronously associate all event genres and images, as well as
        // associating the event with the user
        const [genreNameToId, imageUrlToId] = await Promise.all([
            this.dataSource_.addGenresToEvent(event.id, event.genres),
            this.dataSource_.addImagesToEvent(event.id, event.images),
            this.addEventToList(userId, event)
        ]);

        // set the event genre ids with the database record ids
        event.genres.forEach(genre => {
            genre.id = genreNameToId.get(genre.name);
        });

        // set the event image ids with the database record ids
        event.images.forEach(image => {
            image.id = imageUrlToId.get(image.url);
        });

        return { eventId: event.id };
    }

    /**
     * Deletes a user owned event from the database.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully deleted
     */
    async deleteEvent(userId, eventId) {
        const failMessage = await userManager.checkUserType(userId,
                                                            TYPE_ORGANIZER);

        if (failMessage) {
            // user is not organizer type
            return { message: failMessage.message };
        }

        // only EventMonkey source events can be deleted, so only search in the
        // EventMonkey source list
        const eventIds = await this.dataSource_.getEventMonkeyList(userId);

        // test if the requested event id is found in the user's event id list
        if (!eventIds.some(otherId => eventId === otherId)) {
            return {
                message: `User(${userId}) does not own Event(${eventId})`
            };
        }

        await this.dataSource_.removeEventDetails(eventId);

        return { message: 'success' };
    }
}
