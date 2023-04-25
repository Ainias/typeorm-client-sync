import {Testcase} from "../Testcase";
import {TestcaseRunner} from "../TestcaseRunner";
import {Database, LastQueryDate, waitForSyncRepository} from "@ainias42/typeorm-sync";
import {Author} from "../../models/Author";

class RelationSyncTest extends Testcase<any> {

    private query = {
        where: {id: 1},
        relations: ["books", "books.authors"]
    }

    async before(): Promise<void> {
        await window["queryDB"]("INSERT INTO author (id, version, name, createdAt, updatedAt) VALUES (1, 0, 'Author different from Server', '2022-05-28 10:00:00.000', '2022-05-28 10:00:00.000');")
        await window["queryDB"]("INSERT INTO book (id, version, name, createdAt, updatedAt) VALUES (1, 0, 'Book different from Server', '2022-05-28 10:00:00.000', '2022-05-28 10:00:00.000');")
        await window["queryDB"]("INSERT INTO book_authors_author (bookId, authorId) VALUES (1, 1);")

        const lastQueryDate = new LastQueryDate();
        lastQueryDate.query = JSON.stringify({...this.query, modelId: Database.getModelIdFor(Author)});
        lastQueryDate.lastQueried = new Date();
        lastQueryDate.lastQueried.setFullYear(2022);
        lastQueryDate.lastQueried.setMonth(10);
        await lastQueryDate.save();
    }

    async run() {
        const authorRepository = await waitForSyncRepository(Author);
        const [client, server] = await authorRepository.promiseFindAndSync(this.query);

        return {client, server};
    }

    async assert({client, server}: Awaited<ReturnType<RelationSyncTest["run"]>>): Promise<void> {
        this.expectEqual(client.length, 1);
        this.expectEqual(server.length, 1);

        this.expectEqual(client[0].name, "Author different from Server")
        this.expectEqual(server[0].name, "Author different from Server")

        this.expectEqual(client[0].books.length, 1)
        this.expectEqual(server[0].books.length, 1)

        this.expectEqual(client[0].books[0].name, "Book different from Server")
        this.expectEqual(server[0].books[0].name, "Book 1")

        // this.expectEqual(client[0].books[0].authors.length, 1)
        // this.expectEqual(server[0].books[0].authors.length, 1)
    }
}

TestcaseRunner.getInstance().addTestcase("RelationSyncTest", new RelationSyncTest());
