import { Router } from 'express';
import status from 'http-status';

import { UserManager } from '../helpers/UserManager.js';
import { emDBSource } from "../helpers/Database.js";
import { eventManager } from "./event.js";

export const userManager = new UserManager(emDBSource);
export const router = Router();

router.get('/:id',
    (req, res) => getUser(req, res)
);

router.post('/register',
    (req, res) => register(req, res)
);

router.post('/login',
    (req, res) => login(req, res)
);

router.post('/:userId/create',
    (req, res) => createEvent(req, res)
);

router.delete('/:userId/delete/:eventId',
    (req, res) => deleteEvent(req, res)
);

router.get('/:userId/created_events',
    (req, res) => getCreatedEvents(req, res)
);

router.get('/:userId/favorites',
    (req, res) => getFavorites(req, res)
);

router.put('/:userId/add_favorite/:eventId',
    (req, res) => addToFavorites(req, res)
);

router.delete('/:userId/remove_favorite/:eventId',
    (req, res) => removeFromFavorites(req, res)
);

router.get('/:userId/interests',
    (req, res) => getInterests(req, res)
);

router.put('/:userId/add_interest/:genreId',
    (req, res) => addToInterests(req, res)
);

router.delete('/:userId/remove_interest/:genreId',
    (req, res) => removeFromInterests(req, res)
);

router.get('/:userId/friends',
    (req, res) => getFriendsList(req, res)
);

router.put('/:userId/add_friend/:friendId',
    (req, res) => addToFriends(req, res)
);

router.delete('/:userId/remove_friend/:friendId',
    (req, res) => removeFromFriends(req, res)
);

async function getUser(req, res) {
    try {
        const userId = Number(req.params['id']);
        const result = await userManager.getUser(userId);

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).send(result.message);
        }
    } catch (error) {
        console.error(error);
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
    }
}

async function register(req, res) {
    try {
        const result = await userManager.register(
            req.body['type'],
            req.body['username'],
            req.body['email'],
            req.body['password']
        );

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).send(result.message);
        }
    } catch (error) {
        console.error(error);
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
    }
}

async function login(req, res) {
    const email = req.body['email'];
    const password = req.body['password'];

    console.debug(`email: ${email}`, `password: ${password}`);

    try {
        const loginDetails = await userManager.login(email, password);

        if (loginDetails.message) {
            res.status(status.NOT_ACCEPTABLE).send(loginDetails.message);
        } else {
            const user = await userManager.getUser(loginDetails.userId);

            if (user.message) {
                res.status(status.NOT_ACCEPTABLE).send(user.message);
            } else {
                res.status(status.OK).json(user);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
    }
}

async function createEvent(req, res) {
    try {
        const userId = Number(req.params['userId']);

        const result = await eventManager.createEvent(
            userId,
            req.body['name'],
            req.body['description'],
            req.body['location'],
            req.body['dates'],
            req.body['priceRanges'],
            req.body['genres'],
            req.body['images']
        );

        if (result.eventId) {
            res.status(status.OK).json(result);
        } else if (result.message) {
            res.status(status.BAD_REQUEST).json(result);
        } else {
            res.status(status.BAD_REQUEST).json({
                message: 'Failed to create event, with no errors!'
            });
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function deleteEvent(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const eventId = Number(req.params['eventId']);

        const result = await eventManager.deleteEvent(userId, eventId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function getCreatedEvents(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const result = await userManager.getCreatedEvents(userId);

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json({ message: result.message });
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function getFavorites(req, res) {
    try {
        const userId = Number(req.params['userId']);

        const result = await userManager.getFavorites(userId);

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json({ message: result.message });
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function addToFavorites(req, res) {
    try {
        const userId = Number(req.params['userId']);

        // ticket master ids can be strings, so no Number cast
        const eventId = req.params['eventId'];

        const result = await userManager.addToFavorites(userId, eventId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function removeFromFavorites(req, res) {
    try {
        const userId = Number(req.params['userId']);

        // ticket master ids can be strings, so no Number cast
        const eventId = req.params['eventId'];

        const result = await userManager.removeFromFavorites(userId, eventId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function getInterests(req, res) {
    try {
        const userId = Number(req.params['userId']);

        const result = await userManager.getInterests(userId);

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function addToInterests(req, res) {
    try {
        const userId = Number(req.params["userId"]);
        const genreId = Number(req.params['genreId']);

        const result = await userManager.addToInterests(userId, genreId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function removeFromInterests(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const genreId = Number(req.params['genreId']);

        const result = await userManager.removeFromInterests(userId, genreId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function getFriendsList(req, res) {
    try {
        const userId = Number(req.params['userId']);

        const result = await userManager.getFriendsList(userId);

        if (!result.message) {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function addToFriends(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const friendId = Number(req.params['friendId']);

        const result = await userManager.addToFriends(userId, friendId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function removeFromFriends(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const friendId = Number(req.params['friendId']);

        const result = await userManager.removeFromFriends(userId, friendId);

        if (result.message === 'success') {
            res.status(status.OK).json(result);
        } else {
            res.status(status.BAD_REQUEST).json(result);
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}
