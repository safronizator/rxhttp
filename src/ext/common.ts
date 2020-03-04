import { debug as stdDebug } from "../interface";

export const debug = stdDebug.extend("ext");

export interface BodyParsed {
    parsedBody: any;
}

export interface CustomResponseData {
    responseData: any;
}
