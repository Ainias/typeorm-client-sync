import * as express from 'express';
import {queryFromClient} from "@ainias42/typeorm-sync";

const routes = express.Router();
routes.post('/sync', async (req, res) => {
    const answer = await queryFromClient(req.body.lastQueryDate ? new Date(req.body.lastQueryDate): undefined, req.body.queryOptions)
    return res.status(200).json({success: true, ...answer});
});

export { routes };
