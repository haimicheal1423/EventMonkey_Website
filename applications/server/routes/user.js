import { Router } from 'express';
import status from 'http-status';

import { UserManager } from '../helpers/UserManager.js';
import { emDBSource } from "../helpers/Database.js";

const userManager = new UserManager(emDBSource);

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
            //     req.session.success = true;
            //     req.session.email = email;
            //     req.session.userId = results[0].id;

            res.cookie('email', loginDetails.email);
            res.cookie('name', loginDetails.username);
            res.status(status.OK).send('Logged in!');
        }
    } catch (error) {
        console.error(error);
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
    }
}
