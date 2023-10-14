import { TAlert } from '@/types/types';
import express, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getDateV2 } from '@/utils/date';

type CustomJwtPayload = JwtPayload & { userId: string };

const router = express.Router();

function isAlert(data: {alert:TAlert}|{userId:string, projectId:string}): data is {alert: TAlert} {
    return !!(data as {alert: TAlert}).alert;
}

const clients:{[key:string]:Response} = {};

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const {SESSION_COOKIE_NAME, JWT_SECRET} = process.env as {SESSION_COOKIE_NAME: string, JWT_SECRET: string};
    if (!SESSION_COOKIE_NAME || !JWT_SECRET) {
        return res.status(204).end();
    }

    const accessToken = req.cookies[SESSION_COOKIE_NAME];
    if (!accessToken) {
        return res.status(204).end();
    }

    const {userId, projectId} = jwt.verify(accessToken, JWT_SECRET) as CustomJwtPayload;
    if (!userId || !projectId) {
        return res.status(204).end();
    }

    clients[userId] = res;

    res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive',
		'Cache-Control': 'no-cache',
	});
    res.write('event: connected\n');
    res.write(`data: You are now subscribed!\n`);
    res.write(`id: ${userId}\n\n`);

    req.on('close', () => {
        console.log(`${userId} - Connection closed`);
        delete clients[userId];
        res.end();
    });
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const body: {alert:TAlert}|{userId:string, projectId:string} = req.body;
    if (isAlert(body)) {
        if (clients.hasOwnProperty(body.alert.userId)) {
            let link = null;
            if (body.alert.subjectType === 'entries') {
                link = `/structures/${body.alert.structureId}/entries/${body.alert.subjectId}`;
            }

            const alert = {
                id: body.alert.id,
                message: body.alert.message,
                read: body.alert.read,
                createdAt: getDateV2(body.alert.createdAt),
                link
            };

            clients[body.alert.userId].write(`event: alert\ndata: ${JSON.stringify(alert)}\nid: ${alert.id}\n\n`);
        }
    }

    res.json({});
});

export default router;