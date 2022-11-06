export const TYPE_ATTENDEE = 'ATTENDEE';
export const TYPE_ORGANIZER = 'ORGANIZER';

export class User {
    id;
    type;
    email;
    password;
    username;
    profilePictureUrl;
    notificationList;
    eventList;

    constructor(userId, type, email, password, username, profilePictureUrl = undefined) {
        if (this.constructor === User) {
            throw new Error('Cannot instantiate abstract class');
        }
        this.id = userId;
        this.type = type;
        this.email = email;
        this.password = password;
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
        this.notificationList = [];
        this.eventList = [];
    }

    addEvent(event) {
        this.eventList.push(event);
    }

    removeEvent(event) {
        this.eventList = this.eventList.filter(elem => elem.id === event.id);
    }

    addNotification(notification) {
        this.notificationList.push(notification);
    }

    removeNotification(notification) {
        this.notificationList = this.notificationList.filter(elem => elem.id === notification.id);
    }
}

export class Attendee extends User {
    friendsList;

    constructor(userId, email, password, username, profilePictureUrl) {
        super(userId, TYPE_ATTENDEE, email, password, username, profilePictureUrl);
        this.friendsList = [];
    }

    isFriend(user) {
        for (const friend of this.friendsList) {
            if (friend.id === user.id) {
                return true;
            }
        }
        return false;
    }

    addFriend(user) {
        this.friendsList.push(user.id);
    }

    removeFriend(user) {
        this.friendsList = this.friendsList.filter(other => other.id !== user.id);
    }
}

export class Organizer extends User {
    constructor(userId, email, password, username, profilePictureUrl) {
        super(userId, TYPE_ORGANIZER, email, password, username, profilePictureUrl);
    }
}

export class Notification {
    id;
    date;
    title;
    description;

    constructor(notificationId, date, title, description) {
        this.id = notificationId;
        this.date = date;
        this.title = title;
        this.description = description;
    }

    containsText(text) {
        // client sided?
        return this.title.toLowerCase().indexOf(text)
            || this.description.toLowerCase().indexOf(text);
    }
}