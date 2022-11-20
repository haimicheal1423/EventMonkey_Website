import { Router } from 'express';
import status from "http-status";

import { EventManager } from "../helpers/EventManager.js";
import { emDBSource } from "../helpers/Database.js";

const eventManager = new EventManager(emDBSource);

export const router = Router();

router.get('/',
    (req, res) => getAllEventMonkeyEvents(req, res)
);

router.get('/search',
    (req, res) => searchEvent(req, res)
);

router.get('/user/:userId',
    (req, res) => getEventsByUserId(req, res)
);

router.post('/user/:userId/create',
    (req, res) => createEvent(req, res)
);

router.delete('/user/:userId/delete/:eventId',
    (req, res) => deleteEvent(req, res)
);

// TODO: Maybe these belong in the User route instead

router.get('/user/:userId/interests',
    (req, res) => getInterests(req, res)
);

router.put('/user/:userId/add_interest/:genreId',
    (req, res) => addToInterests(req, res)
);

router.delete('/user/:userId/remove_interest/:genreId',
    (req, res) => removeFromInterests(req, res)
);

router.put('/user/:userId/add_favorite/:eventId',
    (req, res) => addToFavorites(req, res)
);

router.delete('/user/:userId/remove_favorite/:eventId',
    (req, res) => removeFromFavorites(req, res)
);

async function getAllEventMonkeyEvents(req, res) {
    try {
        const events = await eventManager.getAllEvents();
        res.status(status.OK).json(events);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function searchEvent(req, res) {
    try {
        const searchRequest = {};

        if (req.query['source']) {
            searchRequest.source = req.query['source'];
        }

        if (req.query['limit']) {
            searchRequest.limit = req.query['limit'];
        }

        if (req.query['eventId']) {
            searchRequest.eventId = req.query['eventId'];
        }

        if (req.query['genre']) {
            searchRequest.genre = req.query['genre'];
        }

        if (req.query['keyword']) {
            searchRequest.keyword = req.query['keyword'];
        }

        const result = await eventManager.search(searchRequest);

        res.status(status.OK).json(result);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function getEventsByUserId(req, res) {
    try {
        const userId = Number(req.params['userId']);
        const result = await eventManager.findEventsByUserId(userId);
        res.status(status.OK).json(result);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
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

async function addToFavorites(req, res) {
    try {
        const userId = Number(req.params['userId']);

        // ticket master ids can be strings, so no Number cast
        const eventId = req.params['eventId'];

        const result = await eventManager.addToFavorites(userId, eventId);

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

        const result = await eventManager.removeFromFavorites(userId, eventId);

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

        const result = await eventManager.getInterests(userId);

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

        const result = await eventManager.addToInterests(userId, genreId);

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

        const result = await eventManager.removeFromInterests(userId, genreId);

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
