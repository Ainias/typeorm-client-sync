import {Testcase} from "../Testcase";
import {TestcaseRunner} from "../TestcaseRunner";
import {Database, LastQueryDate, waitForSyncRepository} from "@ainias42/typeorm-sync";
import {Post} from "../../models/Post";

class CleanSyncTest extends Testcase<any> {

    async run() {
        const postRepository = await waitForSyncRepository(Post);
        const [clientRes, serverRes] = await postRepository.promiseFindAndSync();

        const savedResult = await window["queryDB"]("SELECT * FROM post;");

        const lastQueryDate = await LastQueryDate.findOne({
            where: {
                query: JSON.stringify({where: {}, modelId: Database.getModelIdFor(Post)})
            }
        });

        return {
            server: serverRes,
            client: clientRes,
            saved: savedResult,
            lastQueryDate
        }
    }

    async assert(result: Awaited<ReturnType<CleanSyncTest["run"]>>): Promise<void>{
        const {server, client, saved} = result;

        this.expectEqual(client.length, 0);
        this.expectEqual(server.length, 5);
        this.expectEqual(saved.length, 5);

        this.expectEqual(server[0].id, 1);
        this.expectEqual(saved[0].id, 1);

        return undefined;
    }


}

TestcaseRunner.getInstance().addTestcase("CleanSyncTest", new CleanSyncTest());
