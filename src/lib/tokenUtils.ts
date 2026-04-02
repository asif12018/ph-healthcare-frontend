"use server"

import jwt, { JwtPayload } from "jsonwebtoken";
import { setCookie } from "./cookieUtils";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET

//decoding the token and finding out the expired time in second
const getTokenSecondsRemaining =  (token: string): number => {
    if(!token) return 0;

    try {
        const tokenPayload= JWT_ACCESS_SECRET ? jwt.verify(token, JWT_ACCESS_SECRET as string) as JwtPayload : jwt.decode(token) as JwtPayload;

        if (tokenPayload && !tokenPayload.exp){
            return 0;
        }

        const remainingSeconds = tokenPayload.exp as number - Math.floor(Date.now() / 1000)

        return remainingSeconds > 0 ? remainingSeconds : 0;

    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
} 


//setting the token on cookie
export const setTokenInCookies = async (
    name : string,
    token : string,
    fallbackMaxAgeInSeconds = 60 * 60 * 24 // 1 days
) => {
    const maxAgeInSeconds = getTokenSecondsRemaining(token);

    await setCookie(name, token, maxAgeInSeconds || fallbackMaxAgeInSeconds);
}