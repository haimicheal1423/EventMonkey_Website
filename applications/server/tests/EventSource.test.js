import { describe, expect, test, jest } from '@jest/globals';
import { EventMonkeyDataSource } from '../helpers/Database.js';
import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER, Event } from '../models/Event.js';
import { Genre } from '../models/Genre.js';
import { Image } from '../models/Image.js';
import { CompositeSource, EventMonkeySource, EventSource, TicketMasterSource } from '../helpers/EventSource.js';

import { default as ticketmaster_event_mock } from './ticketmaster_json_mocks/ticketmaster_event_mock.json';
import { default as ticketmaster_expected_json } from './ticketmaster_json_mocks/ticketmaster_expected_json.json';

describe('EventMonkey source', () => {
    describe('find by event id', () => {
        test('using a valid event id', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const eventId = 777;

            const eventDetails = {
                name: 'mock-name',
                description: 'mock-description',
                url: 'mock-url',
                location: 'mock-location',
                dates: 'mock-dates',
                priceRanges: 'mock-price-ranges'
            };

            const eventGenres = [Genre.create('mock-genre')];
            const eventImages = [Image.create('1_1', 1, 1, 'mock-image')];

            const expectedEvent = new Event(
                SOURCE_EVENT_MONKEY,
                eventDetails.name,
                eventDetails.description,
                eventDetails.url,
                eventDetails.location,
                eventDetails.dates,
                eventDetails.priceRanges,
                eventImages,
                eventGenres
            );

            expectedEvent.id = eventId;

            jest.spyOn(dataSource, 'getEventDetails')
                .mockImplementationOnce(async () => eventDetails);

            jest.spyOn(dataSource, 'getEventGenres')
                .mockImplementationOnce(async () => eventGenres);

            jest.spyOn(dataSource, 'getEventImages')
                .mockImplementationOnce(async () => eventImages);

            const result = await eventSource.findByEventId(eventId);

            expect(dataSource.getEventDetails).toHaveBeenCalledWith(eventId);
            expect(dataSource.getEventGenres).toHaveBeenCalledWith(eventId);
            expect(dataSource.getEventImages).toHaveBeenCalledWith(eventId);

            expect(result).toStrictEqual(expectedEvent);
        });

        test('using an event id which does not exist', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const eventId = 777;

            const eventDetails = undefined;

            jest.spyOn(dataSource, 'getEventDetails')
                .mockImplementationOnce(async () => eventDetails);

            jest.spyOn(dataSource, 'getEventGenres');
            jest.spyOn(dataSource, 'getEventImages');

            const result = await eventSource.findByEventId(eventId);

            expect(dataSource.getEventDetails).toHaveBeenCalledWith(eventId);
            expect(dataSource.getEventGenres).toHaveBeenCalledTimes(0);
            expect(dataSource.getEventImages).toHaveBeenCalledTimes(0);

            expect(result).toBeUndefined();
        });
    });

    describe('find by genre name', () => {
        test('using an array of genre names with results', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const genres = ['mock-genre'];
            const limit = 5;

            const eventIds = [1, 2, 3];
            const expectedEventList = [
                'mock-event-1',
                'mock-event-2',
                'mock-event-3'
            ];

            jest.spyOn(dataSource, 'getEventIdsWithGenres')
                .mockImplementationOnce(async () => eventIds);

            const findByEventId = jest.spyOn(eventSource, 'findByEventId')
                .mockImplementation(async (eventId) => {
                    return `mock-event-${eventId}`;
                });

            const result = await eventSource.findByGenre(genres, limit);

            expect(dataSource.getEventIdsWithGenres)
                .toHaveBeenCalledWith(genres);

            eventIds.forEach((eventId, index) => {
                expect(findByEventId)
                    .toHaveBeenNthCalledWith(1 + index, eventId);
            });

            findByEventId.mockClear();

            expect(result).toStrictEqual(expectedEventList);
        });

        test('using an array of genre names with no results', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const genres = ['mock-genre'];
            const limit = 5;

            const eventIds = [];
            const expectedEventList = [];

            jest.spyOn(dataSource, 'getEventIdsWithGenres')
                .mockImplementationOnce(async () => eventIds);

            jest.spyOn(eventSource, 'findByEventId');

            const result = await eventSource.findByGenre(genres, limit);

            expect(dataSource.getEventIdsWithGenres)
                .toHaveBeenCalledWith(genres);

            expect(eventSource.findByEventId)
                .toHaveBeenCalledTimes(0);

            expect(result).toStrictEqual(expectedEventList);
        });
    });

    describe('find by keyword', () => {
        test('using a keyword with results', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const keyword = 'mock-keyword';
            const limit = 5;

            const eventIds = [1, 2, 3];
            const expectedEventList = [
                'mock-event-1',
                'mock-event-2',
                'mock-event-3'
            ];

            jest.spyOn(dataSource, 'getEventIdsWithKeyword')
                .mockImplementationOnce(async () => eventIds);

            const findByEventId = jest.spyOn(eventSource, 'findByEventId')
                .mockImplementation(async (eventId) => {
                    return `mock-event-${eventId}`;
                });

            const result = await eventSource.findByKeyword(keyword, limit);

            expect(dataSource.getEventIdsWithKeyword)
                .toHaveBeenCalledWith(keyword);

            eventIds.forEach((eventId, index) => {
                expect(findByEventId)
                    .toHaveBeenNthCalledWith(1 + index, eventId);
            });

            findByEventId.mockClear();

            expect(result).toStrictEqual(expectedEventList);
        });

        test('using a keyword with no results', async () => {
            const dataSource = new EventMonkeyDataSource();
            const eventSource = new EventMonkeySource(dataSource);

            const keyword = 'mock-keyword';
            const limit = 5;

            const eventIds = [];
            const expectedEventList = [];

            jest.spyOn(dataSource, 'getEventIdsWithKeyword')
                .mockImplementationOnce(async () => eventIds);

            jest.spyOn(eventSource, 'findByEventId');

            const result = await eventSource.findByKeyword(keyword, limit);

            expect(dataSource.getEventIdsWithKeyword)
                .toHaveBeenCalledWith(keyword);

            expect(eventSource.findByEventId)
                .toHaveBeenCalledTimes(0);

            expect(result).toStrictEqual(expectedEventList);
        });
    });
});

describe('TicketMaster source', () => {
    describe('find by event id', () => {
        test('using a valid event id', async () => {
            const eventSource = new TicketMasterSource();

            const eventId = 'vvG1HZ94RNRA15';

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ticketmaster_event_mock);

            const result = await eventSource.findByEventId(eventId);

            expect(result)
                .toEqual(Event.fromJson(ticketmaster_expected_json));
        });

        test('using an event id which does not exist', async () => {
            const eventSource = new TicketMasterSource();

            const eventId = 'vvG1HZ94RNRA15';

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ({}));

            const result = await eventSource.findByEventId(eventId);

            expect(result).toBeUndefined();
        });
    });

    describe('find by genre name', () => {
        test('using an array of genre names with results', async () => {
            const eventSource = new TicketMasterSource();

            const names = ['mock-genre'];
            const limit = 5;

            const expectedEventList = [
                Event.fromJson(ticketmaster_expected_json)
            ];

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ticketmaster_event_mock);

            const result = await eventSource.findByGenre(names, limit);
            expect(result).toEqual(expectedEventList);
        });

        test('using an array of genre names with no results', async () => {
            const eventSource = new TicketMasterSource();

            const names = ['mock-genre'];
            const limit = 5;

            const expectedEventList = [];

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ({}));

            const result = await eventSource.findByGenre(names, limit);
            expect(result).toEqual(expectedEventList);
        });
    });

    describe('find by keyword', () => {
        test('using a keyword with results', async () => {
            const eventSource = new TicketMasterSource();

            const keyword = 'mock-keyword';
            const limit = 5;

            const expectedEventList = [
                Event.fromJson(ticketmaster_expected_json)
            ];

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ticketmaster_event_mock);

            const result = await eventSource.findByKeyword(keyword, limit);
            expect(result).toEqual(expectedEventList);
        });

        test('using a keyword with no results', async () => {
            const eventSource = new TicketMasterSource();

            const keyword = 'mock-keyword';
            const limit = 5;

            const expectedEventList = [];

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => ({}));

            const result = await eventSource.findByKeyword(keyword, limit);
            expect(result).toEqual(expectedEventList);
        });
    });

    describe('ticket master event api request', () => {
        test('response does not contain _embedded json property', async () => {
            const eventSource = new TicketMasterSource();

            const json = {};
            const limit = 5;

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => json);

            const result = await eventSource.ticketMasterEventRequest_({}, limit);

            expect(result).toEqual([]);
        });

        test('response does not contain events json property', async () => {
            const eventSource = new TicketMasterSource();

            const json = { _embedded: {} };
            const limit = 5;

            jest.spyOn(eventSource, 'apiRequest_')
                .mockImplementationOnce(async () => json);

            const result = await eventSource.ticketMasterEventRequest_({}, limit);

            expect(result).toEqual([]);
        });
    });

    describe('constructing event objects', () => {
        test('event object does not contain _embedded json property', () => {
            const eventSource = new TicketMasterSource();

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: []
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: 'No location available',
                dates: {},
                priceRanges: [],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event venue contains state code', () => {
            const eventSource = new TicketMasterSource();

            const venueName = 'mock-venue-name';
            const venueCity = 'mock-city-name';
            const venueStateCode = 'mock-state-code';

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                _embedded: {
                    venues: [{
                        name: venueName,
                        city: { name: venueCity },
                        state: { stateCode: venueStateCode }
                    }]
                }
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: `${venueName} ─ ${venueCity}, ${venueStateCode}`,
                dates: {},
                priceRanges: [],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event venue contains country code', () => {
            const eventSource = new TicketMasterSource();

            const venueName = 'mock-venue-name';
            const venueCity = 'mock-city-name';
            const venueCountryCode = 'mock-country-code';

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                _embedded: {
                    venues: [{
                        name: venueName,
                        city: { name: venueCity },
                        country: { countryCode: venueCountryCode }
                    }]
                }
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: `${venueName} ─ ${venueCity}, ${venueCountryCode}`,
                dates: {},
                priceRanges: [],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event has multiple currencies', () => {
            const eventSource = new TicketMasterSource();

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                priceRanges: [
                    {
                        currency: 'USD',
                        min: 0,
                        max: 1
                    },
                    {
                        currency: 'ABC',
                        min: 0,
                        max: 1
                    }
                ]
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: 'No location available',
                dates: {},
                priceRanges: [
                    {
                        currency: 'USD',
                        min: 0,
                        max: 1
                    },
                    {
                        currency: 'ABC',
                        min: 0,
                        max: 1
                    }
                ],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event has multiple price ranges with the same currency', () => {
            const eventSource = new TicketMasterSource();

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                priceRanges: [
                    {
                        currency: 'USD',
                        min: 0,
                        max: 1
                    },
                    {
                        currency: 'USD',
                        min: 1,
                        max: 2
                    }
                ]
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: 'No location available',
                dates: {},
                priceRanges: [
                    {
                        currency: 'USD',
                        min: 0,
                        max: 2
                    }
                ],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event has dateTime start and end dates', () => {
            const eventSource = new TicketMasterSource();

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                dates: {
                    start: { dateTime: new Date(Date.now()) },
                    end: { dateTime: new Date(Date.now()) }
                }
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: 'No location available',
                dates: {
                    startDateTime: eventObj['dates']['start']['dateTime'],
                    endDateTime: eventObj['dates']['end']['dateTime']
                },
                priceRanges: [],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });

        test('event has local start and end dates instead', () => {
            const eventSource = new TicketMasterSource();

            const eventObj = {
                id: 'mock-id',
                name: 'mock-name',
                images: [],
                dates: {
                    start: { localDate: new Date(Date.now()) },
                    end: { localDate: new Date(Date.now()) }
                }
            };

            const expectedEvent = Event.fromJson({
                id: 'mock-id',
                source: SOURCE_TICKET_MASTER,
                name: 'mock-name',
                description: 'No description available',
                location: 'No location available',
                dates: {
                    startDateTime: eventObj['dates']['start']['localDate'],
                    endDateTime: eventObj['dates']['end']['localDate']
                },
                priceRanges: [],
                images: [],
                genres: []
            });

            const result = eventSource.constructEvent_(eventObj);
            expect(result).toEqual(expectedEvent);
        });
    });
});

describe('Composite source', () => {
    test('find by event id', async () => {
        const dataSource = new EventMonkeyDataSource();
        const eventMonkeySource = new EventMonkeySource(dataSource);
        const ticketMasterSource = new TicketMasterSource();

        const eventSource = new CompositeSource(
            eventMonkeySource,
            ticketMasterSource
        );

        const eventId = 'vvG1HZ94RNRA15';

        const tmEvent = 'mock-ticketmaster-event';

        jest.spyOn(eventMonkeySource, 'findByEventId')
            .mockImplementationOnce(async () => undefined);

        jest.spyOn(ticketMasterSource, 'findByEventId')
            .mockImplementationOnce(async () => tmEvent);

        const result = await eventSource.findByEventId(eventId);

        expect(result).toBe(tmEvent);
    });

    test('find by event id with no results', async () => {
        const dataSource = new EventMonkeyDataSource();
        const eventMonkeySource = new EventMonkeySource(dataSource);
        const ticketMasterSource = new TicketMasterSource();

        const eventSource = new CompositeSource(
            eventMonkeySource,
            ticketMasterSource
        );

        const eventId = 'vvG1HZ94RNRA15';

        jest.spyOn(eventMonkeySource, 'findByEventId')
            .mockImplementationOnce(async () => undefined);

        jest.spyOn(ticketMasterSource, 'findByEventId')
            .mockImplementationOnce(async () => undefined);

        const result = await eventSource.findByEventId(eventId);

        expect(result).toBeUndefined();
    });

    test('find by event id with multiple results', async () => {
        const dataSource = new EventMonkeyDataSource();
        const eventMonkeySource = new EventMonkeySource(dataSource);
        const ticketMasterSource = new TicketMasterSource();

        const eventSource = new CompositeSource(
            eventMonkeySource,
            ticketMasterSource
        );

        const eventId = 'vvG1HZ94RNRA15';

        const emEvent = 'mock-ticketmaster-event';
        const tmEvent = 'mock-ticketmaster-event';

        jest.spyOn(eventMonkeySource, 'findByEventId')
            .mockImplementationOnce(async () => emEvent);

        jest.spyOn(ticketMasterSource, 'findByEventId')
            .mockImplementationOnce(async () => tmEvent);

        const result = await eventSource.findByEventId(eventId);
        expect(result).toBe(tmEvent);
    });

    test('find by genre name', async () => {
        const dataSource = new EventMonkeyDataSource();
        const eventMonkeySource = new EventMonkeySource(dataSource);
        const ticketMasterSource = new TicketMasterSource();

        const eventSource = new CompositeSource(
            eventMonkeySource,
            ticketMasterSource
        );

        const genres = ['mock-genre'];
        const limit = 5;

        const emEvent = 'mock-ticketmaster-event';
        const tmEvent = 'mock-ticketmaster-event';

        jest.spyOn(eventMonkeySource, 'findByGenre')
            .mockImplementationOnce(async () => emEvent);

        jest.spyOn(ticketMasterSource, 'findByGenre')
            .mockImplementationOnce(async () => tmEvent);

        const result = await eventSource.findByGenre(genres, limit);

        expect(result).toStrictEqual([emEvent, tmEvent]);
    });

    test('find by keyword', async () => {
        const dataSource = new EventMonkeyDataSource();
        const eventMonkeySource = new EventMonkeySource(dataSource);
        const ticketMasterSource = new TicketMasterSource();

        const eventSource = new CompositeSource(
            eventMonkeySource,
            ticketMasterSource
        );

        const keyword = 'mock-keyword';
        const limit = 5;

        const emEvent = 'mock-ticketmaster-event';
        const tmEvent = 'mock-ticketmaster-event';

        jest.spyOn(eventMonkeySource, 'findByKeyword')
            .mockImplementationOnce(async () => emEvent);

        jest.spyOn(ticketMasterSource, 'findByKeyword')
            .mockImplementationOnce(async () => tmEvent);

        const result = await eventSource.findByKeyword(keyword, limit);

        expect(result).toStrictEqual([emEvent, tmEvent]);
    });
});

describe('abstract EventSource class', () => {
    test('all constructor and function calls should throw', async () => {
        Object.getOwnPropertyNames(EventSource.prototype).forEach(name => {
            const call = jest.spyOn(EventSource.prototype, name);

            try {
                EventSource.prototype[name]();
            } catch (e) {
                // ignored
            }
            expect(call).toThrow();
        });
    });
});
