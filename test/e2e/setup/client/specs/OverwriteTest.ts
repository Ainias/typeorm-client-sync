import {Testcase} from "../Testcase";
import {TestcaseRunner} from "../TestcaseRunner";
import { waitForSyncRepository} from "typeorm-sync";
import {Post} from "../../models/Post";

class OverwriteTest extends Testcase<any> {

    async run() {
        const postRepository = await waitForSyncRepository(Post);

        const [client, server] = await postRepository.promiseFindAndSync({relations: ["author", "comments"]});
        const saved = await window["queryDB"]("SELECT * FROM post;");

        const [client2, server2] = await postRepository.promiseFindAndSync();
        const saved2 = await window["queryDB"]("SELECT * FROM post;");

        return {
            server,
            client,
            saved,

            server2,
            client2,
            saved2,

            // server2: server,
            // client2: client,
            // saved2: saved,
        };
    }

    async assert(result: Awaited<ReturnType<OverwriteTest["run"]>>): Promise<void> {
        const {server, client, saved, server2, client2, saved2} = result;

        this.expectEqual(client.length, 0);
        this.expectEqual(server.length, 5);
        this.expectEqual(saved.length, 5);

        this.expectEqual(server[0].id, 1);
        this.expectEqual(saved[0].id, 1);

        this.expectTruthLike(server[0].author);
        this.expectTruthLike(server[0].comments);

        this.expectFalseLike(server2[0].author);
        this.expectFalseLike(server2[0].comments);

        this.expectEqual(client2.length, 5);
        this.expectEqual(server2.length, 5);
        this.expectEqual(saved2.length, 5);

        this.expectEqual(client2[0].id, 1);
        this.expectEqual(server2[0].id, 1);
        this.expectEqual(saved2[0].id, 1);

        this.expectFalseLike(client2[0].author);
        this.expectFalseLike(server2[0].author);
        this.expectFalseLike(client2[0].comments);
        this.expectFalseLike(server2[0].comments);

        this.expectEqual(saved2[0].authorId, 1);
    }
}

TestcaseRunner.getInstance().addTestcase("OverwriteTest", new OverwriteTest());
