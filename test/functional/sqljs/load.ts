import "reflect-metadata";
import * as fs from "fs";
import {expect} from "chai";
import {getSqljsManager} from "../../../src/index";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {Post} from "./entity/Post";

describe("sqljs driver > load", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [Post],
        schemaCreate: true,
        dropSchema: true,
        enabledDrivers: ["sqljs"]
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should load from a file", () => Promise.all(connections.map(async connection => {
        const manager = getSqljsManager("sqljs");
        manager.loadDatabase("test/functional/sqljs/sqlite/test.sqlite");

        const repository = connection.getRepository(Post);
        const post = await repository.findOne({title: "The title"});

        expect(post).not.to.be.undefined;
        if (post) {
            expect(post.title).to.be.equal("The title");
        }

        const exportedDatabase = manager.exportDatabase();
        expect(exportedDatabase).not.to.be.undefined;
        const originalFileContent = fs.readFileSync("test/functional/sqljs/sqlite/test.sqlite");
        expect(exportedDatabase.length).to.equal(originalFileContent.length);
    })));

    it("should throw an error if the file doesn't exist", () => Promise.all(connections.map(async connection => {
        const manager = getSqljsManager("sqljs");
        const functionWithExecption = () => {
            manager.loadDatabase("test/functional/sqljs/sqlite/test2.sqlite");
        };

        expect(functionWithExecption).to.throw(/File .* does not exist/);
    })));
});
