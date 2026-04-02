"use server"
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";


//Communication happening in server to serser. backend server to nextjs server
export const loginAction = async (payload: ILoginPayload): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsePayload = loginZodSchema.safeParse(payload);
    if (!parsePayload.success) {
        const firstError = parsePayload.error.issues[0].message || "Invalid input";
        return {
            success: false,
            message: firstError
        }
    }
    try {
        const response = await httpClient.post<ILoginResponse>("/auth/login", parsePayload.data);
        const {accessToken, refreshToken, token} = response.data;
        //set token on cookies
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);
        await setTokenInCookies("better-auth.session_token", token);
        redirect("/dashboard");
    } catch (error: any) {
        return {
            success: false,
            message: `Login Failed:${error.message}`
        }
    }
}