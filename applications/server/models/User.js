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

    /** @type {string} */
    profilePictureUrl;

    /** @type {Array<Notification>} */
    notificationList;

    /** @type {Array<Event>} */
    eventList;

    /**
     * @param {number} userId
     * @param {string} type
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {string} profilePictureUrl
     * @param {Array<Notification>} notificationList
     * @param {Array<Event>} eventList
     */
    constructor(userId, type, email, password, username, profilePictureUrl,
                notificationList, eventList) {
        if (this.constructor === User) {
            throw new Error('Cannot instantiate abstract class');
        }
        this.id = userId;
        this.type = type;
        this.email = email;
        this.password = password;
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
        this.notificationList = notificationList;
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

    /**
     * Add an event to the {@link notificationList} array.
     *
     * @param {Notification} notification the notification to add
     */
    addNotification(notification) {
        this.notificationList.push(notification);
    }

    /**
     * Remove every occurrence of the given notification from the
     * {@link notificationList} array.
     *
     * @param {Notification} notification the notification to filter out of the
     *     array (by notification id)
     */
    removeNotification(notification) {
        this.notificationList = this.notificationList
            .filter(elem => elem.id === notification.id);
    }
}

/**
 * An Attendee is a {@link User} implementation for a user that can search and
 * add Events to their favorites list to attend.
 */
export class Attendee extends User {

    /** @type {Array<User>} */
    friendsList;

    /**
     * @param {number} userId
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {string} profilePictureUrl
     * @param {Array<Notification>} [notificationList]
     * @param {Array<Event>} [eventList]
     * @param {Array<User>} [friendsList]
     */
    constructor(userId, email, password, username, profilePictureUrl,
                notificationList = [], eventList = [], friendsList = []) {
        super(userId, TYPE_ATTENDEE, email, password, username,
              profilePictureUrl, notificationList, eventList);
        this.friendsList = friendsList;
    }

    /**
     * Test if the given user exists in the {@link friendsList}.
     *
     * @param {User} user
     *
     * @returns {boolean} <code>true</code> if the user id matches another user
     *     in the {@link friendsList} array.
     */
    isFriend(user) {
        for (const friend of this.friendsList) {
            if (friend.id === user.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add a user to the {@link friendsList} array.
     *
     * @param {User} user the user to add
     */
    addFriend(user) {
        this.friendsList.push(user);
    }

    /**
     * Remove every occurrence of the given user from the {@link friendsList}
     * array.
     *
     * @param {User} user the user to filter out of the array (by user id)
     */
    removeFriend(user) {
        this.friendsList = this.friendsList
            .filter(other => other.id !== user.id);
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
     * @param {string} profilePictureUrl
     * @param {Array<Notification>} [notificationList]
     * @param {Array<Event>} [eventList]
     */
    constructor(userId, email, password, username, profilePictureUrl,
                notificationList = [], eventList = []) {
        super(userId, TYPE_ORGANIZER, email, password, username,
              profilePictureUrl, notificationList, eventList);
    }
}

/**
 * A notification message created for a {@link User}.
 */
export class Notification {

    /** @type {number} */
    id;

    /** @type {Date} */
    date;

    /** @type {string} */
    title;

    /** @type {string} */
    description;

    /**
     * @param {number} notificationId
     * @param {Date} date
     * @param {string} title
     * @param {string} description
     */
    constructor(notificationId, date, title, description) {
        this.id = notificationId;
        this.date = date;
        this.title = title;
        this.description = description;
    }

    /**
     * Test if the given text is found in this notification. The text is
     * searched in the notification title and description for matches.
     *
     * @param {string} text the text to search for
     *
     * @returns {boolean} <code>true</code> if the text is found in the
     *     notification.
     */
    containsText(text) {
        // client sided?
        return this.title.toLowerCase().indexOf(text) !== -1
            || this.description.toLowerCase().indexOf(text) !== -1;
    }
}
