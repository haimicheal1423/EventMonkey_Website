import { describe, expect, it, test, jest } from '@jest/globals';
import { EventMonkeyDataSource } from '../helpers/Database.js';
import { EventManager } from '../helpers/EventManager.js';
import { TYPE_ATTENDEE, TYPE_ORGANIZER } from '../models/User.js';
import { Genre } from '../models/Genre.js';
import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER } from '../models/Event.js';

describe('searching events', () => {
});

describe('checking user types', () => {
    it('checks a valid user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails').
            mockImplementationOnce(async () => ({
                type, username, email, password, profileImageId,
            }));

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        // checkUserType returns undefined when user types are valid
        expect(result).toBeUndefined();
    });

    it('checks a user with an invalid type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails').
            mockImplementationOnce(async () => ({
                type, username, email, password, profileImageId,
            }));

        const userId = 999;
        const userType = 'invalid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) is not type ${userType}`);
    });

    it('checks a user which does not exist', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        // mock a function call with undefined user details
        jest.spyOn(dataSource, 'getUserDetails').
            mockImplementationOnce(async () => undefined);

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('get all events', () => {
    it('gets all events stored in the database', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const eventIds = [0, 1, 2];
        const expectedEventList = [];

        for (const eventId of eventIds) {
            expectedEventList.push(`mock-event-${eventId}`);
        }

        jest.spyOn(dataSource, 'getAllEventIds')
            .mockImplementationOnce(async () => eventIds);

        const findByEventId = jest.spyOn(manager.eventMonkey_, 'findByEventId')
            .mockImplementation(async (eventId) => expectedEventList[eventId]);

        const result = await manager.getAllEvents();

        expect(dataSource.getAllEventIds).toHaveBeenCalled();

        expect(manager.eventMonkey_.findByEventId).toHaveBeenCalledTimes(3);
        expect(manager.eventMonkey_.findByEventId).toHaveBeenCalledWith(0);
        expect(manager.eventMonkey_.findByEventId).toHaveBeenCalledWith(1);
        expect(manager.eventMonkey_.findByEventId).toHaveBeenCalledWith(2);
        findByEventId.mockClear();

        expect(result).toHaveLength(3);
        expect(result).toStrictEqual(expectedEventList);
    });
});

describe('get recommended events', () => {
    test('using attendee and friend genre interests', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        const userInterests = [
            Genre.create('mock-user-interest-1'),
            Genre.create('mock-user-interest-2')
        ];

        const friendInterests = [
            Genre.create('mock-friend-interest-1'),
            Genre.create('mock-friend-interest-2')
        ];

        const genres = userInterests.concat(friendInterests);
        const genreNames = genres.map(genre => genre.name);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async () => userInterests);

        jest.spyOn(dataSource, 'getFriendInterests')
            .mockImplementationOnce(async () => friendInterests);

        jest.spyOn(manager.composite_, 'findByGenre')
            .mockImplementationOnce(async () => {
                return ['mock-event-1', 'mock-event-2', 'mock-event-3'];
            });

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList).toHaveBeenCalledWith(userId);
        expect(dataSource.getFriendInterests).toHaveBeenCalledWith(userId);

        expect(manager.composite_.findByGenre)
            .toHaveBeenCalledWith(genreNames, limit);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expectedEventList);
    });

    test('using only attendee interests', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        const userInterests = [
            Genre.create('mock-user-interest-1'),
            Genre.create('mock-user-interest-2')
        ];

        const genreNames = userInterests.map(genre => genre.name);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async () => userInterests);

        jest.spyOn(dataSource, 'getFriendInterests')
            .mockImplementationOnce(async () => []);

        jest.spyOn(manager.composite_, 'findByGenre')
            .mockImplementationOnce(async () => {
                return ['mock-event-1', 'mock-event-2', 'mock-event-3'];
            });

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList).toHaveBeenCalledWith(userId);
        expect(dataSource.getFriendInterests).toHaveBeenCalledWith(userId);

        expect(manager.composite_.findByGenre)
            .toHaveBeenCalledWith(genreNames, limit);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expectedEventList);
    });

    test('using only friend interests', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        const friendInterests = [
            Genre.create('mock-user-interest-1'),
            Genre.create('mock-user-interest-2')
        ];

        const genreNames = friendInterests.map(genre => genre.name);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async () => []);

        jest.spyOn(dataSource, 'getFriendInterests')
            .mockImplementationOnce(async () => friendInterests);

        jest.spyOn(manager.composite_, 'findByGenre')
            .mockImplementationOnce(async () => {
                return ['mock-event-1', 'mock-event-2', 'mock-event-3'];
            });

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList).toHaveBeenCalledWith(userId);
        expect(dataSource.getFriendInterests).toHaveBeenCalledWith(userId);

        expect(manager.composite_.findByGenre)
            .toHaveBeenCalledWith(genreNames, limit);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expectedEventList);
    });

    test('using undefined user interests', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        const friendInterests = [
            Genre.create('mock-user-interest-1'),
            Genre.create('mock-user-interest-2')
        ];

        const genreNames = friendInterests.map(genre => genre.name);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async () => undefined);

        jest.spyOn(dataSource, 'getFriendInterests')
            .mockImplementationOnce(async () => friendInterests);

        jest.spyOn(manager.composite_, 'findByGenre')
            .mockImplementationOnce(async () => {
                return ['mock-event-1', 'mock-event-2', 'mock-event-3'];
            });

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList).toHaveBeenCalledWith(userId);
        expect(dataSource.getFriendInterests).toHaveBeenCalledWith(userId);

        expect(manager.composite_.findByGenre)
            .toHaveBeenCalledWith(genreNames, limit);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expectedEventList);
    });

    test('using undefined friend interests', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        const userInterests = [
            Genre.create('mock-user-interest-1'),
            Genre.create('mock-user-interest-2')
        ];

        const genreNames = userInterests.map(genre => genre.name);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async () => userInterests);

        jest.spyOn(dataSource, 'getFriendInterests')
            .mockImplementationOnce(async () => undefined);

        jest.spyOn(manager.composite_, 'findByGenre')
            .mockImplementationOnce(async () => {
                return ['mock-event-1', 'mock-event-2', 'mock-event-3'];
            });

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList).toHaveBeenCalledWith(userId);
        expect(dataSource.getFriendInterests).toHaveBeenCalledWith(userId);

        expect(manager.composite_.findByGenre)
            .toHaveBeenCalledWith(genreNames, limit);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expectedEventList);
    });

    test('using an Organizer user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ORGANIZER,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        const result = await manager.getRecommendedEvents(userId, limit);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('using a non-existing user', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) does not exist`);
    });

    test('using an unknown user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const userId = 999;
        const limit = 3;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: 'UNKNOWN',
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        const result = await manager.getRecommendedEvents(userId, limit)

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });
});

describe('find by event id', () => {
    test('find by event monkey id', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        jest.spyOn(manager.eventMonkey_, 'findByEventId')
            .mockImplementationOnce(async () => 'mock-event');

        jest.spyOn(manager.ticketMaster_, 'findByEventId');

        jest.spyOn(manager.composite_, 'findByEventId');

        const source = SOURCE_EVENT_MONKEY;
        const eventId = 999;
        const result = await manager.findEventById({ source, eventId });

        expect(manager.eventMonkey_.findByEventId)
            .toHaveBeenCalledWith(eventId);

        expect(manager.ticketMaster_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(manager.composite_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(result).toBe('mock-event');
    });

    test('find by ticket master id', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        jest.spyOn(manager.eventMonkey_, 'findByEventId');

        jest.spyOn(manager.ticketMaster_, 'findByEventId')
            .mockImplementationOnce(async () => 'mock-event');

        jest.spyOn(manager.composite_, 'findByEventId');

        const source = SOURCE_TICKET_MASTER;
        const eventId = 'tm-999';
        const result = await manager.findEventById({ source, eventId });

        expect(manager.eventMonkey_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(manager.ticketMaster_.findByEventId)
            .toHaveBeenCalledWith(eventId);

        expect(manager.composite_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(result).toBe('mock-event');
    });

    test('find by event id through event monkey or ticket master', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        jest.spyOn(manager.eventMonkey_, 'findByEventId');

        jest.spyOn(manager.ticketMaster_, 'findByEventId');

        jest.spyOn(manager.composite_, 'findByEventId')
            .mockImplementationOnce(async () => 'mock-event');

        const source = undefined;
        const eventId = 'tm-999';
        const result = await manager.findEventById({ source, eventId });

        expect(manager.eventMonkey_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(manager.ticketMaster_.findByEventId)
            .toHaveBeenCalledTimes(0);

        expect(manager.composite_.findByEventId)
            .toHaveBeenCalledWith(eventId);

        expect(result).toBe('mock-event');
    });
});

describe('get created events', () => {
    test('using organizer user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const userId = 999;
        const eventIds = [1, 2, 3];
        const expectedEventList = [
            'mock-event-1',
            'mock-event-2',
            'mock-event-3'
        ];

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ORGANIZER,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getEventMonkeyList')
            .mockImplementationOnce(async () => eventIds);
        jest.spyOn(manager, 'eventMonkeyEventList_');
        const findByEventId = jest.spyOn(manager.eventMonkey_, 'findByEventId')
            .mockImplementation(async (eventId) => `mock-event-${eventId}`);

        jest.spyOn(dataSource, 'getTicketMasterList');
        jest.spyOn(manager, 'ticketMasterEventList_');
        jest.spyOn(manager.ticketMaster_, 'findByEventId');

        const result = await manager.getCreatedEvents(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ORGANIZER);

        expect(dataSource.getTicketMasterList).toHaveBeenCalledTimes(0);
        expect(manager.ticketMasterEventList_).toHaveBeenCalledTimes(0);
        expect(manager.ticketMaster_.findByEventId).toHaveBeenCalledTimes(0);

        expect(dataSource.getEventMonkeyList).toHaveBeenCalledWith(userId);
        expect(manager.eventMonkeyEventList_).toHaveBeenCalledWith(userId);
        expect(manager.eventMonkey_.findByEventId)
            .toHaveBeenCalledTimes(eventIds.length);

        eventIds.forEach((eventId, index) => {
            // nth call is 1-indexed
            expect(manager.eventMonkey_.findByEventId)
                .toHaveBeenNthCalledWith(1 + index, eventId);
        });
        findByEventId.mockClear();

        expect(result.message).toBeUndefined();
        expect(result).toEqual(expectedEventList);
    });

    test('using attendee user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        const userId = 999;
        const result = await manager.getCreatedEvents(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ORGANIZER);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ORGANIZER}`);
    });
});

describe('get favorite events', () => {
    test('using attendee user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        const userId = 999;
        const eventMonkeyEventIds = [1, 2, 3];
        const ticketMasterEventIds = ['tm-1', 'tm-2', 'tm-3'];

        const eventMonkeyEventList = [
            'mock-event-em-1',
            'mock-event-em-2',
            'mock-event-em-3'
        ];

        const ticketMasterEventList = [
            'mock-event-tm-1',
            'mock-event-tm-2',
            'mock-event-tm-3'
        ];

        const expectedEventList = eventMonkeyEventList
                                    .concat(ticketMasterEventList);

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        jest.spyOn(dataSource, 'getEventMonkeyList')
            .mockImplementationOnce(async () => eventMonkeyEventIds);

        jest.spyOn(manager, 'eventMonkeyEventList_');

        const emFindById = jest.spyOn(manager.eventMonkey_, 'findByEventId')
            .mockImplementation(async (eventId) => `mock-event-em-${eventId}`);

        jest.spyOn(dataSource, 'getTicketMasterList')
            .mockImplementationOnce(async () => ticketMasterEventIds);

        jest.spyOn(manager, 'ticketMasterEventList_');

        const tmFindById = jest.spyOn(manager.ticketMaster_, 'findByEventId')
             .mockImplementation(async (eventId) => `mock-event-${eventId}`);

        jest.spyOn(manager.ticketMaster_, 'findByEventId');

        const result = await manager.getFavorites(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getEventMonkeyList).toHaveBeenCalledWith(userId);
        expect(manager.eventMonkeyEventList_).toHaveBeenCalledWith(userId);
        expect(manager.eventMonkey_.findByEventId)
            .toHaveBeenCalledTimes(eventMonkeyEventIds.length);

        eventMonkeyEventIds.forEach((eventId, index) => {
            // nth call is 1-indexed
            expect(manager.eventMonkey_.findByEventId)
                .toHaveBeenNthCalledWith(1 + index, eventId);
        });
        emFindById.mockClear();

        expect(dataSource.getTicketMasterList).toHaveBeenCalledWith(userId);
        expect(manager.ticketMasterEventList_).toHaveBeenCalledWith(userId);
        expect(manager.ticketMaster_.findByEventId)
            .toHaveBeenCalledTimes(ticketMasterEventIds.length);

        ticketMasterEventIds.forEach((eventId, index) => {
            // nth call is 1-indexed
            expect(manager.ticketMaster_.findByEventId)
                .toHaveBeenNthCalledWith(1 + index, eventId);
        });
        tmFindById.mockClear();

        expect(result.message).toBeUndefined();
        expect(result).toEqual(expectedEventList);
    });

    test('using organizer user type', async () => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new EventManager(dataSource);

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                userId,
                type: TYPE_ORGANIZER,
                username: 'username',
                email: 'email',
                password: 'secret',
                profileImageId: undefined
            }));

        const userId = 999;
        const result = await manager.getFavorites(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });
});

describe('creating events', () => {
});

describe('deleting events', () => {
});
