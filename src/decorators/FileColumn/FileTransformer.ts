import { FileType } from "./FileType";

export type FileTransformer = {
    isFile: true,
    fileOptions: { saveDirectory: string, publicPath: string },
    to: (value: FileType) => FileType,
    from: (value: FileType) => FileType
}
