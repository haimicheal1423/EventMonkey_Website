import { describe, expect, test } from '@jest/globals';
import { Event } from '../models/Event.js';
import { EventList } from '../models/Event.js';
import { Genre } from '../models/Genre.js';
import { Image } from '../models/Image.js';
import { Attendee } from '../models/User.js';
import { Organizer } from '../models/User.js';
import { SOURCE_EVENT_MONKEY } from '../models/Event.js';
import { SOURCE_TICKET_MASTER } from '../models/Event.js';

/**
 * Tests the addImage, removeImage, addGenre and removeGenre of the Event class.
 */
describe('Testing Event Class Functions', () => {
    const eventClass = new Event;

    // addImage and removeImage function tests
    // ========================================================================
    // Test image object
    let imageObj = new Image(12345, '16:9', 1920, 1080, 'test_fake_img.png');

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeImage function given that there is no pre-existing
     * image object, or given image object is not present. The function should
     * still be able to pass and execute correctly as it removes the image
     * object based on id and does so, despite there being no object with that
     * id present. The eventClass.images will stay as an empty array, or one in
     * the same state before the calling of removeImage, such that: [].
     * Before Test: eventClass.images = []
     * After Test:  eventClass.images = []
     */
    test('Testing removeImage function: removing obj that isn\'t there', () => {
        // console.log('Before 1st: ', eventClass.images);
        // Removing imageObj from eventClass class
        eventClass.removeImage(imageObj);
        // Testing that eventClass.images is now empty; was previously populated
        // by addImage test before it
        expect(eventClass.images)
            .toStrictEqual([]);
        // console.log('After 1st: ', eventClass.images);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the addImage function by passing in a constant image object
     * imageObj. Runs the addImage function before the expect, and allowing
     * expect to equal the eventClass.images variable to equal imageObj in an
     * array such that: [imageObj].
     * Before Test: eventClass.images = []
     * After Test:  eventClass.images = [imageObj]
     */
    test('Testing addImage function: adding to images', () => {
        // console.log('Before 2nd: ', eventClass.images);
        // adding imageObj to eventClass class
        eventClass.addImage(imageObj);
        // Testing that class.images has an array with imageObj
        expect(eventClass.images)
            .toStrictEqual([imageObj]);
        // console.log('After 2nd: ', eventClass.images);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeImage function by passing in a constant image object
     * imageObj. Runs the removeImage function before the expect. It also
     * relies on the addImage function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.images
     * variable to be an empty array such that: [].
     * Before Test: eventClass.images = [imageObj]
     * After Test:  eventClass.images = []
     */
    test('Testing removeImage function: removing from images', () => {
        // console.log('Before 3rd: ', eventClass.images);
        // Removing imageObj from eventClass class
        eventClass.removeImage(imageObj);
        // Testing that eventClass.images is now empty; was previously populated
        // by addImage test before it
        expect(eventClass.images)
            .toStrictEqual([]);
        // console.log('After 3rd: ', eventClass.images);
    });

    // addGenre and removeGenre function tests
    // ========================================================================
    // Test genre object
    let genreObj = new Genre(1234567890, 'Miscellaneous Genre');

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeGenre function given that there is no pre-existing
     * genre object, or given genre object is not present. The function should
     * still be able to pass and execute correctly as it removes the genre
     * object based on id and does so, despite there being no object with that
     * id present. The eventClass.genres will stay as an empty array, or one in
     * the same state before the calling of removeGenre, such that: [].
     * Before Test: eventClass.genres = []
     * After Test:  eventClass.images = []
     */
    test('Testing removeGenre function: removing obj that isn\'t there', () => {
        // console.log('Before 1st: ', eventClass.genres);
        // Removing genreObj from eventClass class
        eventClass.removeGenre(genreObj);
        // Testing that eventClass.genres is now empty; was previously populated
        // by addGenre test before it
        expect(eventClass.genres)
            .toStrictEqual([]);
        // console.log('After 1st: ', eventClass.genres);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the addGenre function by passing in a constant genre object
     * genreObj. Runs the addGenre function before the expect, and allowing
     * expect to equal the eventClass.genres variable to equal genreObj in an
     * array such that: [genreObj].
     * Before Test: eventClass.genres = []
     * After Test:  eventClass.images = [genreObj]
     */
    test('Testing addGenre function: adding to genres', () => {
        // console.log('Before 2nd: ', eventClass.genres);
        // Adding genreObj to eventClass class
        eventClass.addGenre(genreObj);
        // Testing that class.genres has an array with genreObj
        expect(eventClass.genres)
            .toStrictEqual([genreObj]);
        // console.log('After 2nd: ', eventClass.genres);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeGenre function by passing in a constant genre object
     * genreObj. Runs the removeGenre function before the expect. It also
     * relies on the addGenre function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.genres
     * variable to be an empty array such that: [].
     * Before Test: eventClass.genres = [genreObj]
     * After Test:  eventClass.images = []
     */
    test('Testing removeGenre function: removing from genres', () => {
        // console.log('Before 3rd: ', eventClass.genres);
        // Removing genreObj from eventClass class
        eventClass.removeGenre(genreObj);
        // Testing that eventClass.genres is now empty; was previously populated
        // by addGenre test before it
        expect(eventClass.genres)
            .toStrictEqual([]);
        // console.log('After 3rd: ', eventClass.genres);
    });

});
// =========================================================================
// Note: error with addEvent, commented them out for now
// =========================================================================
/**
 * The attendee and organizer extends were tested separately to see if they both
 * were able to successfully extend the User class.
 */
/**
 * Tests the addEvent and removeEvent of the Attendee class.
 */
// userId, email, password, username, profileImage, eventList = [], interests = []
describe('Testing User Class Functions: Attendee', () => {
    const userAttendee = new Attendee;

    // Test objects
    let tempImage = new Image(12345, '16:9', 1920, 1080, 'test_fake_img.png');
    let tempGenre = new Genre(1234567890, 'Miscellaneous Genre');
    let testEvent = new Event(
        SOURCE_TICKET_MASTER, 62234, 'Test Event Name',
        'This test event\'s description', 'Event Location',
        {startDateTime: 'standIn', endDateTime: 'standIn'},
        [{currency: '$', min: 50, max: 100}]
    );

    /**
     * It is assumed that the Event object was correctly filled in.
     * The removeEvent function should be able to fully pass at removing an
     * event from the eventList without passing any errors, even if the event
     * object is not present in the event, such that the eventList stays the
     * same: []
     * Before Test: userAttendee.eventList = []
     * After Test: userAttendee.eventList = []
     */
    test('Testing removeEvent function: removing obj that isn\'t there', () => {
        // console.log('Before 1st: ', userAttendee.eventList);
        userAttendee.removeEvent(testEvent);
        expect(userAttendee.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, []),
            new EventList(SOURCE_TICKET_MASTER, [])]);
        // console.log('After 1st: ', userAttendee.eventList);
    });

    /**
     * It is assumed that the Event object was correctly filled in.
     * The addEventFunction should be able to add an Event object into the
     * userAttendee.eventList array. This should be able to pass without error,
     * such that: [testEvent].
     * Before Test: userAttendee.eventList = []
     * After Test: userAttendee.eventList = [testEvent]
     */
    test('Testing addEvent function: adding to eventList', () => {
        // console.log('Before 2nd: ', userAttendee.eventList);
        userAttendee.addEvent(testEvent);
        expect(userAttendee.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, []),
            new EventList(SOURCE_TICKET_MASTER, [62234])]);
        // console.log('After 2nd: ', userAttendee.eventList);
    });

    /**
     * It is assumed that the Event object was correctly filled in.
     * This tests that removeEvent can find and remove an Event object from the
     * userAttendee.eventList array. Before the test, the array already had
     * the testEvent object within it. Passing this should mean that the array
     * would then be empty, such that: [].
     * Before Test: userAttendee.eventList = [testEvent]
     * After Test: userAttendee.eventList = []
     */
    test('Testing removeEvent function: removing from eventList', () => {
        // console.log('Before 3rd: ', userAttendee.eventList);
        userAttendee.removeEvent(testEvent);
        expect(userAttendee.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, []),
            new EventList(SOURCE_TICKET_MASTER, [])]);
        // console.log('After 3rd: ', userAttendee.eventList);
    });

});

/**
 * Tests the addEvent and removeEvent of the Organizer class.
 */
describe('Testing User Class Functions: Organizer', () => {
    const userOrganizer = new Organizer;

    // Test objects
    let tempImage = new Image(12345, '16:9', 1920, 1080, 'test_fake_img.png');
    let tempGenre = new Genre(1234567890, 'Miscellaneous Genre');
    let testEvent = new Event(
        SOURCE_EVENT_MONKEY, 62234, 'Test Event Name',
        'This test event\'s description', 'Event Location',
        {startDateTime: 'standIn', endDateTime: 'standIn'},
        [{currency: '$', min: 50, max: 100}]
    );

    /**
     * It is assumed that the Event object was correctly filled in.
     * The removeEvent function should be able to fully pass at removing an
     * event from the eventList without passing any errors, even if the event
     * object is not present in the event, such that the eventList stays the
     * same: []
     * Before Test: userOrganizer.eventList = []
     * After Test: userOrganizer.eventList = []
     */
    test('Testing removeEvent function: removing obj that isn\'t there', () => {
        // console.log('Before 1st: ', userOrganizer.eventList);
        userOrganizer.removeEvent(testEvent);
        expect(userOrganizer.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, [])]);
        // console.log('After 1st: ', userOrganizer.eventList);
    });

    /**
     * It is assumed that the Event object was correctly filled in.
     * The addEventFunction should be able to add an Event object into the
     * userOrganizer.eventList array. This should be able to pass without error,
     * such that: [testEvent].
     * Before Test: userOrganizer.eventList = []
     * After Test: userOrganizer.eventList = [testEvent]
     */
    test('Testing addEvent function: adding to eventList', () => {
        // console.log('Before 2nd: ', userOrganizer.eventList);
        userOrganizer.addEvent(testEvent);
        expect(userOrganizer.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, [62234])]);
        // console.log('After 2nd: ', userOrganizer.eventList);
    });

    /**
     * It is assumed that the Event object was correctly filled in.
     * This tests that removeEvent can find and remove an Event object from the
     * userOrganizer.eventList array. Before the test, the array already had
     * the testEvent object within it. Passing this should mean that the array
     * would then be empty, such that: [].
     * Before Test: userOrganizer.eventList = [testEvent]
     * After Test: userOrganizer.eventList = []
     */
    test('Testing removeEvent function: removing from eventList', () => {
        // console.log('Before 3rd: ', userOrganizer.eventList);
        userOrganizer.removeEvent(testEvent);
        expect(userOrganizer.eventList)
            .toStrictEqual([new EventList(SOURCE_EVENT_MONKEY, [])]);
        // console.log('After 3rd: ', userOrganizer.eventList);
    });

});

//new EventList(SOURCE_EVENT_MONKEY, []),
//            new EventList(SOURCE_TICKET_MASTER, [])];
