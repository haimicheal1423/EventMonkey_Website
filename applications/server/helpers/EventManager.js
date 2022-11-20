import { EventMonkeySource, TicketMasterSource, CompositeSource } from './EventSource.js';
import { EventMonkeyDataSource } from './Database.js';
import { TYPE_ATTENDEE, TYPE_ORGANIZER } from "../models/User.js";
import { SOURCE_EVENT_MONKEY, Event } from "../models/Event.js";
import { Genre } from "../models/Genre.js";

/**
 * A manager for any request relating to searching, adding, or removing
 * {@link Event}s.
 */
export class EventManager {

    /** @type {EventMonkeyDataSource} */
    datasource_;

    /** @type {TicketMasterSource} */
    ticketMaster_;

    /** @type {EventMonkeySource} */
    eventMonkey_;

    /** @type {CompositeSource} */
    composite_;

    constructor() {
        this.ticketMaster_ = new TicketMasterSource();

        // TODO: add this as a constructor parameter so it can be used for
        //       accessing user details in the database elsewhere
        this.datasource_ = new EventMonkeyDataSource();
        this.eventMonkey_ = new EventMonkeySource(this.datasource_);

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
     *         eventId: number,
     *         genres: string|string[],
     *         keyword: string
     *     }} literal event search parameters
     * @param [literal.source = 'composite'] the {@link EventSource} type, which
     *     can be <i>'ticketMaster'</i>, <i>'EventMonkey'</i>,
     *     or <i>'composite'</i> (by default)
     * @param [literal.limit = 20] the maximum size of the resulting array
     * @param [literal.eventId] the event id, which can be a number for
     *     EventMonkey sources or a string for TicketMaster sources
     * @param [literal.genres] the genre name (or an array of names)
     * @param [literal.keyword] a search string
     *
     * @returns {Promise<Event[]>} the event list of any matching events
     */
    async search({ source = 'composite', limit = 20, eventId, genres,
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

        if (keyword) {
            promises.push(eventSource.findByKeyword(keyword, limit));
        }

        // flatten the resolved array of event lists into one array, then filter
        // out any undefined (event not found) results
        const eventList = (await Promise.all(promises))
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
        const eventIds = await this.datasource_.getAllEventIds();

        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.eventMonkey_.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
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
        const eventIds = await this.datasource_.getEventMonkeyList(userId);

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
        const eventIds = await this.datasource_.getTicketMasterList(userId);

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
     * @private
     */
    async addEventToList_(userId, event) {
        const {
            addToEventMonkeyList,
            addToTicketMasterList
        } = this.datasource_;

        switch (event.source) {
            case 'eventMonkey':
                return addToEventMonkeyList(userId, event.id);
            case 'ticketMaster':
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
     * @private
     */
    async removeEventFromList_(userId, event) {
        const {
            removeFromEventMonkeyList,
            removeFromTicketMasterList
        } = this.datasource_;

        switch (event.source) {
            case 'eventMonkey':
                return removeFromEventMonkeyList(userId, event.id);
            case 'ticketMaster':
                return removeFromTicketMasterList(userId, event.id);
            default:
                throw new Error(`Unknown event source: ${event.source}`);
        }
    }

    /**
     * Checks if a user is of the given type. If the user does not exist or if
     * the type does not match, then a failure message will be returned.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} userType the type of user
     *
     * @returns {Promise<{message: string}|undefined>} a message if the user
     *     does not exist or if the type does not match, or undefined if success
     * @private
     */
    async checkUserType_(userId, userType) {
        const userDetails = await this.datasource_.getUserDetails(userId);

        if (!userDetails) {
            return { message: `User(${userId}) does not exist` };
        }

        if (userDetails.type !== userType) {
            return { message: `User(${userId}) is not type ${userType}` };
        }

        return undefined;
    }

    /**
     * Adds an event to the attendees favorites list. The user id must point to
     * a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number|string} eventId the EventMonkey or TicketMaster event id
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully added to favorites
     */
    async addToFavorites(userId, eventId) {
        const failMessage = await this.checkUserType_(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const event = await this.composite_.findByEventId(eventId);

        if (!event) {
            return { message: `Event(${eventId}) does not exist` };
        }

        await this.addEventToList_(userId, event);

        return { message: 'success' };
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number|string} eventId the EventMonkey or TicketMaster event id
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully removed from favorites
     */
    async removeFromFavorites(userId, eventId) {
        const failMessage = await this.checkUserType_(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const event = await this.composite_.findByEventId(eventId);

        if (!event) {
            return { message: `Event(${eventId}) does not exist` };
        }

        await this.removeEventFromList_(userId, event);

        return { message: 'success' };
    }

    /**
     * Gets the genre list that the user has added as their interests
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{message: string} | Genre[]>} a failure message if the
     *     user is not an {@link TYPE_ATTENDEE} user type, or the array of
     *     genres in the interests list
     */
    async getInterests(userId) {
        const failMessage = await this.checkUserType_(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        return await this.datasource_.getInterestList(userId);
    }

    /**
     * Adds an event to the attendees favorites list. The user id must point to
     * a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} genreId the genre id to add to interests
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the genre was added to interests
     */
    async addToInterests(userId, genreId) {
        const failMessage = await this.checkUserType_(userId, TYPE_ATTENDEE);

         if (failMessage) {
             // user is not attendee type
            return { message: failMessage.message };
        }

        await this.datasource_.addToInterests(userId, genreId);

        return { message: 'success' };
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} genreId the genre id to remove from interests
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the genre was successfully removed from interests
     */
    async removeFromInterests(userId, genreId) {
        const failMessage = await this.checkUserType_(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        await this.datasource_.removeFromInterests(userId, genreId);

        return { message: 'success' };
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
     * @param {Image[]} images
     * @param {Genre[]} genres
     *
     * @returns {Promise<{ eventId: number } | { message: string }>} a promise
     *     for the generated event id, or a failure message
     */
    async createEvent(userId, name, description, location, dates, priceRanges,
                      genres, images) {
        const failMessage = await this.checkUserType_(userId, TYPE_ORGANIZER);

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

        const eventId = await this.datasource_.addEventDetails(event);

        if (!eventId) {
            // there is no record of the event in the database, so do not add
            // any other associations using this event
            return { message: 'Failed to add event details' };
        }

        // set the event id with the generated database value
        event.id = eventId;

        // asynchronously associate all event genres and images, as well as
        // associating the event with the user
        const [genreNameToId, imageUrlToId] = await Promise.all([
            this.datasource_.addGenresToEvent(event.id, event.genres),
            this.datasource_.addImagesToEvent(event.id, event.images),
            this.addEventToList_(userId, event)
        ]);

        // set the event genre ids with the database record ids
        event.genres.forEach(genre => {
            genre.id = genreNameToId.get(genre.name);
        });

        // set the event image ids with the database record ids
        event.images.forEach(image => {
            image.id = imageUrlToId.get(image.url);
        });

        return { eventId: Number(event.id) };
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
        const failMessage = await this.checkUserType_(userId, TYPE_ORGANIZER);

        if (failMessage) {
            // user is not organizer type
            return { message: failMessage.message };
        }

        // only EventMonkey source events can be deleted, so only search in the
        // EventMonkey source list
        const eventIds = await this.datasource_.getEventMonkeyList(userId);

        // test if the requested event id is found in the user's event id list
        if (!eventIds.some(otherId => eventId === otherId)) {
            return {
                message: `User(${userId}) does not own Event(${eventId})`
            };
        }

        await this.datasource_.removeEventDetails(eventId);

        return { message: 'success' };
    }
}
