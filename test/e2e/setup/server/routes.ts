import * as express from 'express';
import { persistFromClient, queryFromClient } from "@ainias42/typeorm-sync";

const routes = express.Router();
routes.post('/sync', async (req, res) => {
    const answer = await queryFromClient(req.body.lastQueryDate ? new Date(req.body.lastQueryDate): undefined, req.body.queryOptions)
    return res.status(200).json({success: true, ...answer});
});

routes.post('/persist', async (req, res) => {
    const answer = await persistFromClient(req.body.modelId, req.body.entityId, req.body.syncContainer)
    return res.status(200).json({success: true, syncContainer: answer});
});

export { routes };
