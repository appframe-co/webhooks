import { TAlert } from '@/types/types';
import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

function isAlert(data: {alert:TAlert}|{userId:string, projectId:string}): data is {alert: TAlert} {
    return !!(data as {alert: TAlert}).alert;
}

const listeners:{[key:string]:Response} = {};

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const body: {alert:TAlert}|{userId:string, projectId:string} = req.body;
    
    if (!isAlert(body)) {
        listeners[body.userId] = res;
    }

    if (isAlert(body)) {
        if (!listeners.hasOwnProperty(body.alert.userId)) {
            return res.json({});
        }

        listeners[body.alert.userId].json({alert: {
            id: body.alert.id,
            userId: body.alert.userId,
            projectId: body.alert.projectId,
            structureId: body.alert.structureId,
            message: body.alert.message,
            subjectId: body.alert.subjectId,
            subjectType: body.alert.subjectType,
            read: body.alert.read,
            createdAt: body.alert.createdAt
        }});
        if (listeners[body.alert.userId] !== res) {
            res.json({});
        }
        delete listeners[body.alert.userId];
    }
});

export default router;