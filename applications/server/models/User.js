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

    /** @type {Event[]} */
    eventList;

    /**
     * @param {number} userId
     * @param {string} type
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {Image} profileImage
     * @param {Event[]} eventList
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
        this.eventList = eventList;
    }

    /**
     * Add an event to the {@link eventList} array.
     *
     * @param {Event} event the event to add
     */
    addEvent(event) {
        this.eventList.push(event);
    }

    /**
     * Remove every occurrence of the given event from the
     * {@link eventList} array.
     *
     * @param {Event} event the event to filter out of the array (by event id)
     */
    removeEvent(event) {
        this.eventList = this.eventList
            .filter(elem => elem.id === event.id);
    }
}

/**
 * An Attendee is a {@link User} implementation for a user that can search and
 * add Events to their favorites list to attend.
 */
export class Attendee extends User {

    /**
     * @param {number} userId
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {Image} profileImage
     * @param {Event[]} [eventList]
     */
    constructor(userId, email, password, username, profileImage,
                eventList = []) {
        super(userId, TYPE_ATTENDEE, email, password, username,
              profileImage, eventList);
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
     * @param {Image} profileImage
     * @param {Event[]} [eventList]
     */
    constructor(userId, email, password, username, profileImage,
                eventList = []) {
        super(userId, TYPE_ORGANIZER, email, password, username,
              profileImage, eventList);
    }
}
