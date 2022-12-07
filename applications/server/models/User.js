import {
    SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER, EventList } from "./Event.js";

/**
 * The {@link Attendee} user type who can search and add Events to their
 * favorites list to attend.
 * @type {string}
 */
export const TYPE_ATTENDEE = 'ATTENDEE';

/**
 * The {@link Organizer} user type who can create and manage their events.
 * @type {string}
 */
export const TYPE_ORGANIZER = 'ORGANIZER';

/**
 * An abstract type to identify a person using the app. A user can be an
 * Organizer or an Attendee.
 * @abstract
 */
export class User {

    /** @type {number} */
    id;

    /** @type {string} */
    type;

    /** @type {string} */
    email;

    /** @type {string} */
    password;

    /** @type {string} */
    username;

    /** @type {Image} */
    profileImage;

    /** @type {EventList[]} */
    eventList;

    /**
     * @param {number} userId
     * @param {string} type
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {Image} profileImage
     * @param {EventList[]} eventList
     */
    constructor(userId, type, email, password, username, profileImage,
                eventList) {
        if (this.constructor === User) {
            throw new Error('Cannot instantiate abstract class');
        }
        this.id = userId;
        this.type = type;
        this.email = email;
        this.password = password;
        this.username = username;
        this.profileImage = profileImage;
    }

    /**
     * Add an event to the {@link eventList} array.
     *
     * @param {Event} event the event to add
     */
    addEvent(event) {
//        for (const source of this.allowedSources) {
//            if (source === event.source) {
//                this.eventList.push(event);
//                break;
//            }
//        }
        for (const sourceList of this.eventList) {
//            console.log('Made it inside addEvent for loop');
            if (sourceList.source === event.source) {
                sourceList.eventIds.push(event.id);
                break;
            }
        }
    }

    /**
     * Remove the first occurrence of the given event from the
     * {@link eventList} array by id.
     *
     * @param {Event} event the event to remove (matching by event id)
     */
    removeEvent(event) {
//        this.eventList = this.eventList
//            .filter(elem => elem.id !== event.id);
        for (const sourceList of this.eventList) {
            if (sourceList.source === event.source) {
                const index = sourceList.eventIds.indexOf(event.id);
                sourceList.eventIds.splice(index, 1);
                break;
            }
        }
    }
}

/**
 * An Attendee is a {@link User} implementation for a user that can search and
 * add Events to their favorites list to attend.
 */
export class Attendee extends User {

    /** @type {Genre[]} */
    interests;

    /**
     * @param {number} userId
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {Image} [profileImage]
     * @param {EventList[]} [eventList]
     * @param {Genre[]} [interests]
     */
    constructor(userId, email, password, username, profileImage,
                eventList = [], interests = []) {
        super(userId, TYPE_ATTENDEE, email, password, username, profileImage,
              eventList);
        this.interests = interests;
//        this.allowedSources = [SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER];
        this.eventList = [
            new EventList(SOURCE_EVENT_MONKEY, []),
            new EventList(SOURCE_TICKET_MASTER, [])];
    }
}

/**
 * An Organizer is a {@link User} implementation for a user that can create
 * and manage their events.
 */
export class Organizer extends User {

    /**
     * @param {number} userId
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {Image} [profileImage]
     * @param {EventList[]} [eventList]
     */
    constructor(userId, email, password, username, profileImage,
                eventList = []) {
        super(userId, TYPE_ORGANIZER, email, password, username, profileImage,
              eventList);
//        this.allowedSources = [SOURCE_EVENT_MONKEY];
        this.eventList = [
                    new EventList(SOURCE_EVENT_MONKEY, [])];
    }

    /**
     * Add an event to the {@link eventList} array. The {@link Event.source}
     * must be {@link SOURCE_EVENT_MONKEY} since organizers can only own events
     * created and stored in the EventMonkey database.
     *
     * @param {Event} event the event to add
     *
     * @throws {Error} when event source is not {@link SOURCE_EVENT_MONKEY}
     */
    addEvent(event) {
        if (event.source !== SOURCE_EVENT_MONKEY) {
            throw new Error(`Expected eventMonkey source, got ${event.source}`);
        }
        super.addEvent(event);
    }
}
