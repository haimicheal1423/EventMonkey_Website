import { jest, beforeEach, describe, it, expect, test } from "@jest/globals";
import bcrypt from 'bcryptjs';

import { EventMonkeyDataSource } from '../helpers/Database.js';
import { UserManager } from '../helpers/UserManager.js';
import { Attendee, Organizer, TYPE_ATTENDEE, TYPE_ORGANIZER } from '../models/User.js';
import {
    Event,
    SOURCE_EVENT_MONKEY,
    SOURCE_TICKET_MASTER
} from '../models/Event.js';
import { Image } from '../models/Image.js';
import { Genre } from "../models/Genre.js";

const bcryptHash = jest.spyOn(bcrypt, 'hash')
                        .mockImplementation(async() => 'mock-password-hash');

const bcryptCompare = jest.spyOn(bcrypt, 'compare')
                        .mockImplementation((plainText, hashed, cb) => {
                            return cb(null, true);
                        });

beforeEach(() => {
    bcryptHash.mockClear();
    bcryptCompare.mockClear();
});

describe('checking user types', () => {
    it('checks a valid user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        // checkUserType returns undefined when user types are valid
        expect(result).toBeUndefined();
    });

    it('checks a user with an invalid type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'valid-type';
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        const userId = 999;
        const userType = 'invalid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) is not type ${userType}`);
    });

    it('checks a user which does not exist', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        // mock a function call with undefined user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const userType = 'valid-type';
        const result = await manager.checkUserType(userId, userType);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('getting valid users', () => {
    it('gets an existing attendee user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = expectedImageId;

        const expectedImage = Image.createWithId(
                expectedImageId,
                'aspect-ratio',
                Number('w'), // 'w' char byte value
                Number('h'), // 'h' char byte value
                'image-url'
            );

        const userId = 999;
        const expectedUser = new Attendee(
                userId,
                email,
                password,
                username,
                expectedImage
            );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => {
                return expectedImage;
            });

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing organizer user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = expectedImageId;

        const expectedImage = Image.createWithId(
            expectedImageId,
            'aspect-ratio',
            Number('w'), // 'w' char byte value
            Number('h'), // 'h' char byte value
            'image-url'
        );

        const userId = 999;
        const expectedUser = new Organizer(
                userId,
                email,
                password,
                username,
                expectedImage
            );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => {
                return expectedImage;
            });

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing attendee user with no profile picture', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = undefined;

        const userId = 999;
        const expectedUser = new Attendee(
            userId,
            email,
            password,
            username
        );

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(profileImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('gets an existing organizer user with no profile picture', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = undefined;

        const userId = 999;
        const expectedUser = new Organizer(
            userId,
            email,
            password,
            username
        );

        // mock a function call with defined organizer user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(profileImageId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });
});

describe('getting problematic users', () => {
    it('gets a user that does not exist', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        // mock a function call with undefined user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });

    it('gets a user with an unknown type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const expectedImageId = 123;
        const type = 'UNKNOWN';

        // mock a function call with defined attendee user details
        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                const username = 'username';
                const email = 'email';
                const password = 'secret';
                const profileImageId = expectedImageId;
                return { type, email, password, username, profileImageId };
            });

        // mock an image
        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const userId = 999;
        const result = await manager.getUser(userId);

        expect(dataSource.getUserDetails).toHaveBeenCalledWith(userId);
        expect(dataSource.getImage).toHaveBeenCalledWith(expectedImageId);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Unknown user type (${type})`);
    });
});

describe('registering valid users', () => {
    it('registers an attendee user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        const userId = 999;
        const expectedUser = new Attendee(
            userId,
            email,
            'mock-password-hash',
            username
        );

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => BigInt(userId));

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });

    it('registers an organizer user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        const userId = 999;
        const expectedUser = new Organizer(
            userId,
            email,
            'mock-password-hash',
            username
        );

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => BigInt(userId));

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual(expectedUser);
    });
});

describe('registering problematic users', () => {
    it('registers an attendee user using a non-unique username', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        // mock a function call with a non-unique username
        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => false);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => Promise.resolve());

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);

        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toBeCalledTimes(0);
        expect(dataSource.addUserDetails).toBeCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Username ${username} already in use`);
    });

    it('registers an attendee user using a non-unique email', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        // mock a function call with a non-unique email
        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => false);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => Promise.resolve());

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toBeCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Email ${email} already in use`);
    });

    it('registers an attendee user but fails to add details', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => 0n);

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);
        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalled();

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Failed to add user details`);
    });

    it('registers a user with an unknown user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const type = 'UNKNOWN';
        const username = 'username';
        const email = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'isUsernameUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'isEmailUnique')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addUserDetails')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.register(type, username, email, password);

        expect(bcryptHash).toHaveBeenCalledWith(password, 10);

        expect(dataSource.isUsernameUnique).toHaveBeenCalledWith(username);
        expect(dataSource.isEmailUnique).toHaveBeenCalledWith(email);
        expect(dataSource.addUserDetails).toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`Unknown user type (${type})`);
    });
});

describe('user login', () => {
    it('performs a successful user login', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        const details = await manager.login(email, password);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details).toStrictEqual(expectedLoginDetails);
    });

    it('logs in a user with an invalid email', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const nonExistingEmail = 'e@mail.com';
        const password = 'secret';

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => undefined);

        const details = await manager.login(nonExistingEmail, password);

        expect(dataSource.getLoginDetails)
            .toHaveBeenCalledWith(nonExistingEmail);
        expect(bcryptCompare).toHaveBeenCalledTimes(0);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });

    it('logs in a user with a valid email but an invalid password', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        jest.spyOn(bcrypt, 'compare')
            .mockImplementationOnce((plainText, hashed, cb) => {
                return cb(null, false);
            });

        const invalidPassword = 'invalid-password';
        const details = await manager.login(email, invalidPassword);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });

    it('encounters an exception when comparing passwords', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const email = 'e@mail.com';
        const password = 'secret';
        const username = 'username';
        const expectedLoginDetails = { userId, email, password, username };

        jest.spyOn(dataSource, 'getLoginDetails')
            .mockImplementationOnce(async() => expectedLoginDetails);

        jest.spyOn(bcrypt, 'compare')
            .mockImplementationOnce((plainText, hashed, cb) => {
                return cb(new Error('EVERYTHING IS BURNING DOWN'), true);
            });

        const details = await manager.login(email, password);

        expect(dataSource.getLoginDetails).toHaveBeenCalledWith(email);
        expect(bcryptCompare).toHaveBeenCalledTimes(1);

        expect(details.message).toBeDefined();
        expect(details.message).toBe('Invalid username or password.');
    });
});

describe('adding to favorites', () => {
    test('attendee adding an event with EventMonkey source', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'addToEventMonkeyList')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'addToTicketMasterList');

        const source = SOURCE_EVENT_MONKEY;
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.addToFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.addToEventMonkeyList)
            .toHaveBeenCalledWith(userId, event.id);

        expect(dataSource.addToTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBe('success');
    });

    test('attendee adding an event with TicketMaster source',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'addToEventMonkeyList');

            jest.spyOn(dataSource, 'addToTicketMasterList')
                .mockImplementationOnce(async() => true);

            const source = SOURCE_TICKET_MASTER;
            const name = 'Event Name';
            const description = 'Event Description';
            const location = 'Event Location';
            const dates = { startDateTime: new Date(Date.now()) };
            const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
            const images = [Image.create('1_1', 1, 1, '-url-')];
            const genres = [Genre.create('Cool Genre')];

            const event = new Event(
                source,
                name,
                description,
                location,
                dates,
                priceRanges,
                images,
                genres
            );

            event.id = 1234;

            const result = await manager.addToFavorites(userId, event);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.addToEventMonkeyList)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addToTicketMasterList)
                .toHaveBeenCalledWith(userId, event.id);

            expect(result.message).toBe('success');
        });

    test('attendee adding an event with an unknown source',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'addToEventMonkeyList');
            jest.spyOn(dataSource, 'addToTicketMasterList');

            const source = 'UNKNOWN';
            const name = 'Event Name';
            const description = 'Event Description';
            const location = 'Event Location';
            const dates = { startDateTime: new Date(Date.now()) };
            const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
            const images = [Image.create('1_1', 1, 1, '-url-')];
            const genres = [Genre.create('Cool Genre')];

            const event = new Event(
                source,
                name,
                description,
                location,
                dates,
                priceRanges,
                images,
                genres
            );

            event.id = 1234;

            const result = await manager.addToFavorites(userId, event);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.addToEventMonkeyList)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addToTicketMasterList)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBe(`Unknown event source: ${source}`);
        });

    test('adding an event with an Organizer user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'addToEventMonkeyList');
        jest.spyOn(dataSource, 'addToTicketMasterList');

        const source = 'UNKNOWN';
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.addToFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.addToEventMonkeyList)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.addToTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('adding an event with a non-existing attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'addToEventMonkeyList');
        jest.spyOn(dataSource, 'addToTicketMasterList');

        const source = 'UNKNOWN';
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.addToFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, type);

        expect(dataSource.addToEventMonkeyList)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.addToTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('removing from favorites', () => {
    test('attendee removing an event with EventMonkey source', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'removeFromEventMonkeyList')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'removeFromTicketMasterList');

        const source = SOURCE_EVENT_MONKEY;
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.removeFromFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.removeFromEventMonkeyList)
            .toHaveBeenCalledWith(userId, event.id);

        expect(dataSource.removeFromTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBe('success');
    });

    test('attendee removing an event with TicketMaster source',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'removeFromEventMonkeyList');

            jest.spyOn(dataSource, 'removeFromTicketMasterList')
                .mockImplementationOnce(async() => true);

            const source = SOURCE_TICKET_MASTER;
            const name = 'Event Name';
            const description = 'Event Description';
            const location = 'Event Location';
            const dates = { startDateTime: new Date(Date.now()) };
            const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
            const images = [Image.create('1_1', 1, 1, '-url-')];
            const genres = [Genre.create('Cool Genre')];

            const event = new Event(
                source,
                name,
                description,
                location,
                dates,
                priceRanges,
                images,
                genres
            );

            event.id = 1234;

            const result = await manager.removeFromFavorites(userId, event);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.removeFromEventMonkeyList)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.removeFromTicketMasterList)
                .toHaveBeenCalledWith(userId, event.id);

            expect(result.message).toBe('success');
        });

    test('attendee removing an event with an unknown source',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'removeFromEventMonkeyList');
            jest.spyOn(dataSource, 'removeFromTicketMasterList');

            const source = 'UNKNOWN';
            const name = 'Event Name';
            const description = 'Event Description';
            const location = 'Event Location';
            const dates = { startDateTime: new Date(Date.now()) };
            const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
            const images = [Image.create('1_1', 1, 1, '-url-')];
            const genres = [Genre.create('Cool Genre')];

            const event = new Event(
                source,
                name,
                description,
                location,
                dates,
                priceRanges,
                images,
                genres
            );

            event.id = 1234;

            const result = await manager.removeFromFavorites(userId, event);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.removeFromEventMonkeyList)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.removeFromTicketMasterList)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBe(`Unknown event source: ${source}`);
        });

    test('removing an event with an Organizer user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'removeFromEventMonkeyList');
        jest.spyOn(dataSource, 'removeFromTicketMasterList');

        const source = 'UNKNOWN';
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.removeFromFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.removeFromEventMonkeyList)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.removeFromTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('removing an event with a non-existing attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'removeFromEventMonkeyList');
        jest.spyOn(dataSource, 'removeFromTicketMasterList');

        const source = 'UNKNOWN';
        const name = 'Event Name';
        const description = 'Event Description';
        const location = 'Event Location';
        const dates = { startDateTime: new Date(Date.now()) };
        const priceRanges = [{ currency: 'USD', min: 10, max: 20 }];
        const images = [Image.create('1_1', 1, 1, '-url-')];
        const genres = [Genre.create('Cool Genre')];

        const event = new Event(
            source,
            name,
            description,
            location,
            dates,
            priceRanges,
            images,
            genres
        );

        event.id = 1234;

        const result = await manager.removeFromFavorites(userId, event);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, type);

        expect(dataSource.removeFromEventMonkeyList)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.removeFromTicketMasterList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('getting interests list', () => {
    test('getting the interests list for a valid attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'getInterestList')
            .mockImplementationOnce(async() => 'mock-interests-list');

        jest.spyOn(manager, 'checkUserType');

        const result = await manager.getInterests(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList)
            .toHaveBeenCalledWith(userId);

        expect(result.message).toBeUndefined();
        expect(result).toBe('mock-interests-list');
    });

    test('getting the interests list using an Organizer user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                type, username, email, password, profileImageId
            }));

        jest.spyOn(dataSource, 'getInterestList');

        const result = await manager.getInterests(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getInterestList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('getting the interests list for a non-existing attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'getInterestList');

        const result = await manager.getInterests(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledTimes(1);

        expect(dataSource.getInterestList)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });
});

describe('adding to interests list', () => {
    test('an attendee adding a genre that exists to their interests',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreId = 777;
            const genreName = 'Cool Genre';
            const expectedGenre = Genre.createWithId(genreId, genreName);

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId')
                .mockImplementationOnce(async() => expectedGenre);

            jest.spyOn(dataSource, 'addGenre');

            jest.spyOn(dataSource, 'addToInterests')
                .mockImplementationOnce(async() => Promise.resolve());

            const result = await manager.addToInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.addGenre)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addToInterests)
                .toHaveBeenCalledWith(userId, genreId);

            expect(result.message).toBeUndefined();
            expect(result).toStrictEqual(expectedGenre);
        });

    test('an attendee adding a genre that does not exist to their interests',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreId = 777;
            const genreName = 'Cool Genre';
            const expectedGenre = Genre.createWithId(genreId, genreName);

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'addGenre')
                .mockImplementationOnce(async() => expectedGenre);

            jest.spyOn(dataSource, 'addToInterests')
                .mockImplementationOnce(async() => Promise.resolve());

            const result = await manager.addToInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.addGenre)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.addToInterests)
                .toHaveBeenCalledWith(userId, genreId);

            expect(result.message).toBeUndefined();
            expect(result).toStrictEqual(expectedGenre);
        });

    test('failing to add a genre that does not exist',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'addGenre')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'addToInterests');

            const result = await manager.addToInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.addGenre)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.addToInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message).toBe('Could not add genre to interests');
        });

    test('using an Organizer user type',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ORGANIZER;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId');
            jest.spyOn(dataSource, 'addGenre');
            jest.spyOn(dataSource, 'addToInterests');

            const result = await manager.addToInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addGenre)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addToInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message)
                .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
        });

    test('using a non-existing user',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'getGenreId');
            jest.spyOn(dataSource, 'addGenre');
            jest.spyOn(dataSource, 'addToInterests');

            const result = await manager.addToInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addGenre)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.addToInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message).toBe(`User(${userId}) does not exist`);
        });
});

describe('removing from interests list', () => {
    test('an attendee removing a genre that exists',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreId = 777;
            const genreName = 'Cool Genre';
            const expectedGenre = Genre.createWithId(genreId, genreName);

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId')
                .mockImplementationOnce(async() => expectedGenre);

            jest.spyOn(dataSource, 'removeFromInterests')
                .mockImplementationOnce(async() => Promise.resolve());

            const result = await manager.removeFromInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.removeFromInterests)
                .toHaveBeenCalledWith(userId, genreId);

            expect(result.message).toBeDefined();
            expect(result.message).toBe('success');
        });

    test('an attendee removing a genre that does not exist',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ATTENDEE;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'removeFromInterests');

            const result = await manager.removeFromInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledWith(genreName);

            expect(dataSource.removeFromInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message).toBe('success');
        });

    test('using an Organizer user type',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const type = TYPE_ORGANIZER;
            const username = 'username';
            const email = 'email';
            const password = 'secret';
            const profileImageId = 123;

            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => {
                    return { type, username, email, password, profileImageId }
                });

            jest.spyOn(dataSource, 'getGenreId');
            jest.spyOn(dataSource, 'removeFromInterests');

            const result = await manager.removeFromInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.removeFromInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message)
                .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
        });

    test('using a non-existing user',
        async() => {
            const dataSource = new EventMonkeyDataSource();
            const manager = new UserManager(dataSource);

            const userId = 999;
            const genreName = 'Cool Genre';

            jest.spyOn(manager, 'checkUserType');

            jest.spyOn(dataSource, 'getUserDetails')
                .mockImplementationOnce(async() => undefined);

            jest.spyOn(dataSource, 'getGenreId');
            jest.spyOn(dataSource, 'removeFromInterests');

            const result = await manager.removeFromInterests(userId, genreName);

            expect(dataSource.getUserDetails)
                .toHaveBeenCalledWith(userId);

            expect(manager.checkUserType)
                .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

            expect(dataSource.getGenreId)
                .toHaveBeenCalledTimes(0);

            expect(dataSource.removeFromInterests)
                .toHaveBeenCalledTimes(0);

            expect(result.message).toBeDefined();
            expect(result.message).toBe(`User(${userId}) does not exist`);
        });
});

describe('getting friends list', () => {
    test('for a valid attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ATTENDEE;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        const mockFriend = {
            userId: 321,
            username: 'friend-name',
            profileImage: undefined
        };

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'getFriendList')
            .mockImplementationOnce(async() => [mockFriend.userId]);

        jest.spyOn(manager, 'getUser')
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                id: mockFriend.userId,
                username: mockFriend.username,
                profileImage: mockFriend.profileImage
            }));

        const result = await manager.getFriendsList(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getFriendList)
            .toHaveBeenCalledWith(userId);

        expect(manager.getUser)
            .toHaveBeenCalledWith(mockFriend.userId);

        expect(result.message).toBeUndefined();
        expect(result).toStrictEqual([mockFriend]);
    });

    test('using an Organizer user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const type = TYPE_ORGANIZER;
        const username = 'username';
        const email = 'email';
        const password = 'secret';
        const profileImageId = 123;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => {
                return { type, username, email, password, profileImageId }
            });

        jest.spyOn(dataSource, 'getFriendList');
        jest.spyOn(manager, 'getUser');

        const result = await manager.getFriendsList(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getFriendList)
            .toHaveBeenCalledTimes(0);

        expect(manager.getUser)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('for a non-existing attendee', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'getFriendList');
        jest.spyOn(manager, 'getUser');

        const result = await manager.getFriendsList(userId);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getFriendList)
            .toHaveBeenCalledTimes(0);

        expect(manager.getUser)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) does not exist`);
    });
});

describe('adding to friends list', () => {
    test('adding an existing attendee user by username', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const friendId = 111;
        const friendName = 'friend-name';

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            // this mock gets called first
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'user@mail.com',
                password: 'secret',
                profileImageId: 123,
            }))
            // this mock gets called second
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                username: friendName,
                email: 'friend@mail.com',
                password: 'secret',
                profileImageId: 456,
            }))
            // this mock gets called third
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                username: friendName,
                email: 'friend@mail.com',
                password: 'secret',
                profileImageId: 456,
            }));

        jest.spyOn(dataSource, 'getUserId')
            .mockImplementationOnce(async() => friendId);

        jest.spyOn(dataSource, 'addToFriends')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.addToFriends(userId, friendName);

        // three calls, twice for checkUserType using userId and friendId,
        // then the third time for getting friend details
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledTimes(3);

        // checkUserType on userId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getUserId)
            .toHaveBeenCalledWith(friendName);

        // checkUserType on friendId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(friendId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(friendId, TYPE_ATTENDEE);

        // get friend details
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(friendId);

        expect(dataSource.addToFriends)
            .toHaveBeenCalledWith(userId, friendId);

        expect(result.message).toBeUndefined();

        expect(result).toStrictEqual({
            userId: friendId,
            username: friendName,
            profileImage: undefined
        });
    });

    test('adding an existing Organizer user type by username', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const friendId = 111;
        const friendName = 'friend-name';

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            // this mock gets called first
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'user@mail.com',
                password: 'secret',
                profileImageId: 123,
            }))
            // this mock gets called second
            .mockImplementationOnce(async() => ({
                type: TYPE_ORGANIZER,
                username: friendName,
                email: 'friend@mail.com',
                password: 'secret',
                profileImageId: 456,
            }));

        jest.spyOn(dataSource, 'getUserId')
            .mockImplementationOnce(async() => friendId);

        jest.spyOn(dataSource, 'addToFriends')
            .mockImplementationOnce(async() => true);

        jest.spyOn(dataSource, 'getImage')
            .mockImplementationOnce(async() => undefined);

        const result = await manager.addToFriends(userId, friendName);

        // twice for checkUserType using userId and friendId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledTimes(2);

        // checkUserType on userId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getUserId)
            .toHaveBeenCalledWith(friendName);

        // checkUserType on friendId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(friendId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(friendId, TYPE_ATTENDEE);

        expect(dataSource.addToFriends)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${friendId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('using an Organizer user type', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const friendName = 'friend-name';

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                type: TYPE_ORGANIZER,
                username: 'username',
                email: 'user@mail.com',
                password: 'secret',
                profileImageId: 123,
            }));

        jest.spyOn(dataSource, 'getUserId');
        jest.spyOn(dataSource, 'addToFriends');
        jest.spyOn(dataSource, 'getImage');

        const result = await manager.addToFriends(userId, friendName);

        // should fail after checkUserType using userId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledTimes(1);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getUserId)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.addToFriends)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message)
            .toBe(`User(${userId}) is not type ${TYPE_ATTENDEE}`);
    });

    test('using a non-existing user', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const friendName = 'friend-name';

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'getUserId');
        jest.spyOn(dataSource, 'addToFriends');
        jest.spyOn(dataSource, 'getImage');

        const result = await manager.addToFriends(userId, friendName);

        // should fail after checkUserType using userId
        expect(dataSource.getUserDetails)
            .toHaveBeenCalledTimes(1);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getUserId)
            .toHaveBeenCalledTimes(0);

        expect(dataSource.addToFriends)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User(${userId}) does not exist`);
    });

    test('using a non-existing friend', async() => {
        const dataSource = new EventMonkeyDataSource();
        const manager = new UserManager(dataSource);

        const userId = 999;
        const friendName = 'friend-name';

        jest.spyOn(manager, 'checkUserType');

        jest.spyOn(dataSource, 'getUserDetails')
            .mockImplementationOnce(async() => ({
                type: TYPE_ATTENDEE,
                username: 'username',
                email: 'user@mail.com',
                password: 'secret',
                profileImageId: 123,
            }));

        jest.spyOn(dataSource, 'getUserId')
            .mockImplementationOnce(async() => undefined);

        jest.spyOn(dataSource, 'addToFriends');
        jest.spyOn(dataSource, 'getImage');

        const result = await manager.addToFriends(userId, friendName);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledTimes(1);

        expect(dataSource.getUserDetails)
            .toHaveBeenCalledWith(userId);

        expect(manager.checkUserType)
            .toHaveBeenCalledWith(userId, TYPE_ATTENDEE);

        expect(dataSource.getUserId)
            .toHaveBeenCalledWith(friendName);

        expect(dataSource.addToFriends)
            .toHaveBeenCalledTimes(0);

        expect(result.message).toBeDefined();
        expect(result.message).toBe(`User ${friendName} does not exist`);
    });
});
