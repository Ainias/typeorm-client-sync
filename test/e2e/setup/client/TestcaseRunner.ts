import {Testcase} from "./Testcase";
import {Database} from "typeorm-sync";

export class TestcaseRunner {
    private static instance: TestcaseRunner = new TestcaseRunner();

    static getInstance() {
        return this.instance;
    };

    private testcases: Record<string, Testcase<any>> = {};
    private display?: HTMLDivElement;

    addTestcase(name: string, test: Testcase<any>) {
        this.testcases[name] = test;
    }

    setDisplay(display: HTMLDivElement) {
        this.display = display;
    }

    private addDisplayText(text: string) {
        if (this.display) {
            this.display.innerText += text + "\n";
        }
    }

    private clearDisplay() {
        if (this.display) {
            this.display.innerText = "";
        }
    }

    async run(name: string) {
        if (this.testcases[name]) {
            const test = this.testcases[name];
            let state = "clear database";

            try {
                this.clearDisplay();
                this.addDisplayText("Cleaning Database " + name + "...");
                await Database.getInstance().clearTables();
                state = "before";
                this.addDisplayText("Running startup for " + name + "...");
                await test.before();
                state = "run";
                this.addDisplayText("Running test for " + name + "...");
                const result = await test.run();
                state = "asserts";
                this.addDisplayText("Assert results for " + name + "...");
                await test.assert(result);
                state = "after";
                this.addDisplayText("Running teardown for " + name + "...");
                await test.after();
                state = "done";
                this.addDisplayText("Done testing " + name + "!");
                return {success: true, result};
            } catch (e) {
                console.log("LOg-d caught", e);
                const message = "error in state " + state + ": '" + e.message ?? e.getMessage?.() ?? e + "'";
                this.addDisplayText(message);
                return {
                    success: false,
                    reason: message,
                    error: e
                };
            }
        } else {
            this.addDisplayText("no test found with " + name);
        }
    }
}
