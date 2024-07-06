import { createHash, randomBytes } from 'crypto';
import { PassThrough, Readable } from 'stream';
import { createWriteStream, existsSync, mkdirSync } from 'fs';


export class FileWriter {
    static async writeToFile(src: string, saveDirectory: string) {
        const base64SearchText = ';base64,';
        const indexBase64SearchText = src.indexOf(base64SearchText);
        const indexSlash = src.indexOf('/');

        // file is already a url
        if (indexBase64SearchText === -1 || indexSlash === -1 || !src.startsWith('data:')) {
            return src;
        }

        const fileType = src.substring('data:'.length, indexSlash);
        const fileEnding = src.substring(indexSlash + 1, indexBase64SearchText);
        const data = src.substring(indexBase64SearchText + base64SearchText.length);

        const seed = randomBytes(20);
        const now = new Date();

        // Month is 0-based. Add 1 to get 1-12
        const name = `${now.getUTCFullYear()}-${now.getUTCMonth()+1}-${now.getUTCDate()}-${fileType}-${createHash('sha1').update(seed).digest('hex')}.${fileEnding}`;

        const dataBuffer = Buffer.from(data, 'base64');
        const inputStream = new Readable();
        const dataStream = new PassThrough();

        if(!existsSync(saveDirectory)) {
            mkdirSync(saveDirectory, {recursive: true});
        }

        const writeStream = createWriteStream(saveDirectory + name);
        inputStream.pipe(dataStream);

        inputStream.push(dataBuffer);
        inputStream.push(null);

        const resultPromise = new Promise((r) => writeStream.addListener('finish', r));
        dataStream.pipe(writeStream);
        await resultPromise;
        return name;
    }
}
