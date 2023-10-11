import {Testcase} from "../Testcase";
import {TestcaseRunner} from "../TestcaseRunner";
import {Database, LastQueryDate, waitForSyncRepository} from "@ainias42/typeorm-sync";
import {Post} from "../../models/Post";
import { Book } from "../../models/Book";
import { Author } from "../../models/Author";

class SaveRelationTest extends Testcase<any> {

    async run() {
        const bookRepository = await waitForSyncRepository(Book);
        const [, serverBookRes] = await bookRepository.promiseFindAndSync({relations: ["authors"]});

        const authorRepository = await waitForSyncRepository(Author);
        const [, serverAuthorRes] = await authorRepository.promiseFindAndSync();

        serverBookRes[0].authors = [serverAuthorRes[0], serverAuthorRes[1]];
        await bookRepository.saveAndSync(serverBookRes[0]);

        const [,serverBookRes2] = await bookRepository.promiseFindAndSync({relations: ["authors"]});

        return {
            server: serverBookRes2
        }
    }

    async assert(result: Awaited<ReturnType<SaveRelationTest["run"]>>): Promise<void>{
        const {server} = result;

        this.expectEqual(server.length, 1);
        this.expectEqual(server[0].authors.length, 2);

        this.expectTrue(server[0].authors[1].updatedAt.getTime() >  1697046289000); // 11.10.2023

        return undefined;
    }
}

TestcaseRunner.getInstance().addTestcase("SaveRelationTest", new SaveRelationTest());
