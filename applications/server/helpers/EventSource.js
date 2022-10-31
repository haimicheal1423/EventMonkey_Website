import fetch from 'node-fetch';

import Event from '../models/Event.js';
import Image from '../models/Image.js';
import Genre from '../models/Genre.js';
import Classification from '../models/Classification.js';

export class EventSource {
    constructor() {
        if (this.constructor === EventSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    findByEventId(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    findByClassification(classification) {
        throw new Error('Unimplemented abstract function');
    }

    findBySegment(segment) {
        throw new Error('Unimplemented abstract function');
    }

    findByKeyword(searchText) {
        throw new Error('Unimplemented abstract function');
    }
}

export class TicketMasterSource extends EventSource {
    static eventURL_ = 'https://app.ticketmaster.com/discovery/v2/events';
    static apiKey_ = 'GizI5muMuL6p9HaGh2FkmyHz9Hv3WMfW';

    apiRequest_(baseUrl, values = {}) {
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
        return fetch(`${baseUrl}?${params}`);
    }

    #extractEventList(events) {
        return events.map(eventObj => {
            const id = eventObj['id'];
            const name = eventObj['name'];
            const description = eventObj['description'] || eventObj['info'] || eventObj['pleaseNote'];
            const date = new Date(eventObj['dates']['start']['dateTime']);

            const priceRange = Object.values((eventObj['priceRanges'] || [])
                .map(price => ({
                    currency: price.currency,
                    min: price.min,
                    max: price.max
                }))
                .reduce((obj, price) => {
                    if (obj[price.currency]) {
                        let { min, max } = obj[price.currency];
                        obj[price.currency].min = Math.min(min, price.min);
                        obj[price.currency].max = Math.max(max, price.max);
                    } else {
                        obj[price.currency] = price;
                    }
                    return obj;
                }, {}));

            const images = eventObj['images']
                .map(image => new Image(
                    undefined,
                    image['ratio'],
                    image['width'],
                    image['height'],
                    image['url']
                ));

            const classifications = eventObj['classifications']
                .map(classification => {
                    const segment = new Genre(undefined, classification['segment']['name'], classification['segment']['id']);
                    const genre = new Genre(undefined, classification['genre']['name'], classification['genre']['id']);
                    const subgenre = new Genre(undefined, classification['subGenre']['name'], classification['subGenre']['id']);
                    return new Classification(undefined, segment, genre, subgenre);
                });

            return new Event(id, name, description, date, priceRange, images, classifications);
        });
    }

    async findByEventId(eventId) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            eventId: eventId
        })
            .then(response => response.json())
            .then(response => this.#extractEventList(response['_embedded']['events']));
    }

    async findByClassification(classification) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            classificationId: classification.id
        })
            .then(response => response.json())
            .then(response => this.#extractEventList(response['_embedded']['events']));
    }

    async findBySegment(segment) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            segmentId: segment.id
        })
            .then(response => response.json())
            .then(response => this.#extractEventList(response['_embedded']['events']));
    }

    async findByKeyword(searchText) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            keyword: searchText
        })
            .then(response => response.json())
            .then(response => this.#extractEventList(response['_embedded']['events']));
    }
}

export class EventMonkeySource extends EventSource {
    async createEvent(organizer, event) {
        // insert event details to database
        // if successful
        //   set event id
        //   add event to organizer event list
        // return event?
    }

    async findByOrganizerId(organizerId) {
        return [];
    }

    async findByEventId(eventId) {
        return [];
    }

    async findByClassification(classification) {
        return [];
    }

    async findBySegment(segment) {
        return [];
    }

    async findByKeyword(searchText) {
        return [];
    }
}

export class CompositeSource extends EventSource {
    #sources;

    constructor(...sources) {
        super();
        this.#sources = sources || [];
    }

    async findByEventId(eventId) {
        return this.#sources
            .map(source => source.findByEventId(eventId))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findByClassification(classification) {
        return this.#sources
            .map(source => source.findByClassification(classification))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findBySegment(segment) {
        return this.#sources
            .map(source => source.findBySegment(segment))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findByKeyword(searchText) {
        return this.#sources
            .map(source => source.findByKeyword(searchText))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }
}