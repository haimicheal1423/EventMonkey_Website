import fetch from 'node-fetch';

import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER, Event } from '../models/Event.js';
import { Image } from '../models/Image.js';
import { Genre } from '../models/Genre.js';

/**
 * An interface to access event details from some data source (HTTP, databases,
 * files, etc.)
 *
 * @abstract
 */
export class EventSource {

    /**
     * Throws an error when constructing a new {@link EventSource} since it is
     * an abstract class.
     *
     * @throws {Error} cannot instantiate abstract class
     */
    constructor() {
        if (this.constructor === EventSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number|string} eventId the event id
     *
     * @returns {Promise<Event>} the event
     * @abstract
     */
    findByEventId(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     * @abstract
     */
    findByGenre(names, limit) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     * @abstract
     */
    findByKeyword(searchText, limit) {
        throw new Error('Unimplemented abstract function');
    }

    findExcludingGenre(names) {
        throw new Error('Unimplemented abstract function');
    }
}

/**
 * An implementation of {@link EventSource} which sources {@link Event} details
 * through the TicketMaster api using the HTTP protocol.
 */
export class TicketMasterSource extends EventSource {

    /**
     * Fetches a response from a URL. Query parameters can be added to the base
     * URL by populating key-value pairs in the `values` object. For
     * example,
     *
     * ```
     *     apiRequest_('http://api.request.com', {
     *         apikey: 'someApiKey',
     *         key1: val1,
     *         key2: val2
     *     })
     * ```
     *
     * would result in fetching from the URL:
     *
     * ```
     *     'http://api.request.com?apikey=someApiKey&key1=val1&key2=val2'
     * ```
     *
     * @param {string} baseUrl the URL to a specific api resource
     * @param {Object} values optional query parameters to attach to the base
     *     URL; default value is an empty JSON object
     *
     * @returns {Promise<Response>}
     * @private
     */
    async apiRequest_(baseUrl, values = {}) {
        const entries = Object.entries(values);

        if (entries.length === 0) {
            // default empty values object can just fetch using the base url
            return fetch(baseUrl);
        }

        // convert the key-value entries into a param string in the form
        // key1=val1&key2=val2...&keyN=valN
        const params = entries
            .map(([key, val]) => `${key}=${val}`)
            .join('&');

        // join the url with query parameters in the form
        // baseUrl?key1=val1&key2=val2...&keyN=valN
        const response = await fetch(`${baseUrl}?${params}`);
        return await response.json();
    }

    /**
     * Fetch an array of {@link Event}s by sending a request to the TicketMaster
     * api with optional parameter values.
     *
     * @param values values to append as a query string when creating the api
     *     request
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>}
     * @private
     */
    async ticketMasterEventRequest_(values = {}, limit) {
        // make an api request using the events url and api key, then spread out
        // the optional query parameters
        const json = await this.apiRequest_(
            'https://app.ticketmaster.com/discovery/v2/events',
            { apikey: process.env.TICKETMASTER_API_KEY, ...values }
        );

        if (!json['_embedded']) {
            // response does not contain _embedded data
            return [];
        }

        const events = json['_embedded']['events'];

        if (!events) {
            // _embedded data does not contain events
            return [];
        }

        // trim the events list to the limit
        events.length = Math.min(events.length, limit);
        return events.map(eventObj => this.constructEvent_(eventObj));
    }

    /**
     * Constructs a new {@link Event} using details extracted from the
     * TicketMaster api response object.
     *
     * @param eventObj the TicketMaster event response as a json object
     *
     * @returns {Event} an EventMonkey event object
     * @private
     */
    constructEvent_(eventObj) {
        const constructLocation = eventObj => {
            if (!eventObj['_embedded'] || !eventObj['_embedded']['venues']) {
                return 'No location available';
            }

            const extractVenueLocation = venue => {
                const name = venue['name'];
                const city = venue['city']['name'];

                if (venue['state']) {
                    const stateCode = venue['state']['stateCode'];
                    return `${name} ─ ${city}, ${stateCode}`;
                } else {
                    const countryCode = venue['country']['countryCode'];
                    return `${name} ─ ${city}, ${countryCode}`;
                }
            };

            // only get the first venue address
            return eventObj['_embedded']['venues']
                    .map(extractVenueLocation)[0];
        };

        const constructPriceRange = (priceRanges = []) => {
            /*
             * a map to keep track of possible price ranges with the same
             * currency type. Duplicate currency types must be reduced to one
             * object and update the current mapped value
             */
            const rangeMap = new Map();

            for (const nextPriceRange of priceRanges) {
                const { currency, min: nextMin, max: nextMax }
                    = nextPriceRange;

                if (rangeMap.has(currency)) {
                    const obj = rangeMap.get(currency);

                    // update the price range for the mapped currency type
                    obj.min = Math.min(obj.min, nextMin);
                    obj.max = Math.max(obj.max, nextMax);
                } else {
                    // no mapping for currency type yet
                    rangeMap.set(currency, {
                        currency: currency,
                        min: nextMin,
                        max: nextMax
                    });
                }
            }

            // the 'currency' keys can be dropped and only keep the values array
            // of price ranges, each with a unique currency type
            return Array.from(rangeMap.values());
        };

        const constructDate = (dates = {}) => {
            const date = {
                startDateTime: undefined,
                endDateTime: undefined
            };

            if (dates['start']) {
                const dateStart = dates['start'];

                if (dateStart['dateTime']) {
                    date.startDateTime = new Date(dateStart['dateTime']);
                } else if (dateStart['localDate']) {
                    date.startDateTime = new Date(dateStart['localDate']);
                }
            }

            if (dates['end']) {
                const dateEnd = dates['end'];

                if (dateEnd['dateTime']) {
                    date.endDateTime = new Date(dateEnd['dateTime']);
                } else if (dateEnd['localDate']) {
                    date.endDateTime = new Date(dateEnd['localDate']);
                }
            }

            return date;
        };

        // sometimes TicketMaster event properties are undefined, so try and
        // find the best information to fill in
        const description = eventObj['description']
            || eventObj['info']
            || eventObj['pleaseNote']
            || 'No description available';

        const location = constructLocation(eventObj);
        const date = constructDate(eventObj['dates']);
        const priceRange = constructPriceRange(eventObj['priceRanges']);

        const images = eventObj['images'].map(image => {
            const { ratio, width, height, url } = image;
            return Image.create(ratio, width, height, url);
        });

        // a set to ensure genre names are unique
        const genreSet = new Set();

        if (eventObj['classifications']) {
            // events with multiple classifications have a lot of overlapping
            // genres and repeated genres inside of classifications themselves
            eventObj['classifications'].forEach(classObj => {
                if (classObj['segment'] && classObj['segment']['name']) {
                    genreSet.add(classObj['segment']['name']);
                }
                if (classObj['genre'] && classObj['genre']['name']) {
                    genreSet.add(classObj['genre']['name']);
                }
                if (classObj['subGenre'] && classObj['subGenre']['name']) {
                    genreSet.add(classObj['subGenre']['name']);
                }
            });
        }

        const genres = Array.from(genreSet).map(name => {
            return Genre.create(name);
        });

        const event = new Event(
            // all events fetched from this source belong to TicketMaster
            SOURCE_TICKET_MASTER,
            eventObj['name'],
            description,
            eventObj['url'],
            location,
            date,
            priceRange,
            images,
            genres
        );

        event.id = eventObj['id'];
        return event;
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {string} eventId the TicketMaster event id
     *
     * @returns {Promise<Event>} the event
     */
    async findByEventId(eventId) {
        const events = await this.ticketMasterEventRequest_({
            id: eventId,
            size: 1
        }, 1);

        if (!events || events.length < 1) {
            return undefined;
        }

        return events[0];
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByGenre(names, limit) {
        return this.ticketMasterEventRequest_({
            classificationName: names,
            size: limit
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByKeyword(searchText, limit) {
        return this.ticketMasterEventRequest_({
            keyword: searchText,
            size: limit
        }, limit);
    }
    async findExcludingGenre(names, limit) {
        const excludedNames = names.map(name => `-${name}`).join(',')
        return this.ticketMasterEventRequest_({
            classificationName: excludedNames,
            size: limit
        }, limit);
    }

}

/**
 * An implementation of {@link EventSource} which sources {@link Event} details
 * from a sql database.
 */
export class EventMonkeySource extends EventSource {

    /**
     * @private
     * @const
     * @type {DataSource}
     */
    dataSource_;

    /**
     * @param {DataSource} datasource
     */
    constructor(datasource) {
        super();
        this.dataSource_ = datasource;
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    async findByEventId(eventId) {
        const eventDetails = await this.dataSource_.getEventDetails(eventId);

        if (!eventDetails) {
            return undefined;
        }

        const event = new Event(
            // all event details stored in the database belong to EventMonkey
            SOURCE_EVENT_MONKEY,
            eventDetails.name,
            eventDetails.description,
            eventDetails.url,
            eventDetails.location,
            eventDetails.dates,
            eventDetails.priceRanges
        );

        // guaranteed to match the parameter eventId
        event.id = eventId;

        const loadGenres = async () => {
            const genres = await this.dataSource_.getEventGenres(eventId);

            // now add the genres to the event
            genres.forEach(genre => event.addGenre(genre));
        };

        const loadImages = async () => {
            const images = await this.dataSource_.getEventImages(eventId);

            // now add the images to the event
            images.forEach(image => event.addImage(image));
        };

        // load genres and images asynchronously
        await Promise.all([loadGenres(), loadImages()])

        return event;
    }
    async findExcludingGenre(names, limit) {
        const eventIds = await this.dataSource_.getEventIdExcludingGenres(names);

        // limit the event ids now before querying for event details
        eventIds.length = Math.min(eventIds.length, limit);

        // construct all events by event id asynchronously
        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByGenre(names, limit) {
        const eventIds = await this.dataSource_.getEventIdsWithGenres(names);

        // limit the event ids now before querying for event details
        eventIds.length = Math.min(eventIds.length, limit);

        // construct all events by event id asynchronously
        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByKeyword(searchText, limit) {
        // destruct function to reduce line length
        const { getEventIdsWithKeyword } = this.dataSource_;
        const eventIds = await getEventIdsWithKeyword(searchText);

        // limit the event ids now before querying for event details
        eventIds.length = Math.min(eventIds.length, limit);

        // construct all events by event id asynchronously
        const events = await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );

        return events.filter(event => event !== undefined);
    }
}

/**
 * An implementation of {@link EventSource} which aggregates {@link Event}s from
 * multiple sources.
 */
export class CompositeSource extends EventSource {

    /**
     * @private
     * @const
     * @type {EventSource[]}
     */
    sources_;

    /**
     * Constructs a new {@link CompositeSource} object.
     *
     * @param {...EventSource} sources event sources to aggregate results from
     */
    constructor(...sources) {
        super();
        this.sources_ = sources || [];
    }

    /**
     * Collect and combine all results from multiple {@link EventSource}s.
     *
     * @param {function(EventSource): Promise<any>} sourceMapper a function
     *     which maps a source to an array of values to accumulate
     *
     * @param {number} [limit] the maximum size of the resulting array
     *
     * @returns {Promise<any[]>} a promise for a list of results
     * @private
     */
    async accumulate_(sourceMapper, limit) {
        /** @type {any[]} */
        const values = (await Promise.all(
            this.sources_.map(source => {
                return sourceMapper(source);
            })
        )).flat(1); // flattens any[][] to any[]

        if (limit) {
            // trim the values list to the limit
            values.length = Math.min(values.length, limit);
        }

        // values is an array of arrays, so flatten it to a single array
        return values;
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number|string} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    async findByEventId(eventId) {
        const events = await this.accumulate_(source => {
            return source.findByEventId(eventId);
        });

        const array = events.filter(event => event !== undefined);

        if (array.length === 0) {
            return undefined;
        }

        if (array.length > 1) {
            // is this even possible?
            console.warn(`Multiple events found using id(${eventId})`
                       + `: names(${array.map(event => event.name)})`);
        }

        return array[0];
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByGenre(names, limit) {
        return this.accumulate_(source => {
            return source.findByGenre(names, limit);
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     *
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByKeyword(searchText, limit) {
        return this.accumulate_(source => {
            return source.findByKeyword(searchText, limit);
        }, limit);
    }

    findExcludingGenre(names, limit) {
        return this.accumulate_(source => {
            return source.findExcludingGenre(names, limit);
        }, limit);
    }
}
