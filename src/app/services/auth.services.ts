"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

// Retrieve the base API URL from environment variables for backend communication.
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Ensure the application fails early if the API URL is not configured.
if(!BASE_API_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

/**
 * Exchanges the current refresh token for a new set of authentication tokens.
 * This function hits the backend refresh endpoint and securely stores the new tokens in cookies.
 * 
 * @param refreshToken - The user's valid refresh token string.
 * @returns A promise that resolves to a boolean indicating success (true) or failure (false).
 */
export async function getNewTokensWithRefreshToken(refreshToken  : string) : Promise<boolean> {
    try {
        // Send a POST request to the backend to get fresh tokens
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                // Pass the refresh token in the Cookie header as expected by the backend
                Cookie : `refreshToken=${refreshToken}`
            }
        });

        // Check if the backend accepted our refresh token
        if(!res.ok){
            return false;
        }

        // Parse the JSON response containing the new tokens
        const {data} = await res.json();
        const { accessToken, refreshToken: newRefreshToken, token } = data;

        // If the backend returned a new access token, store it in the cookies
        if(accessToken){
            await setTokenInCookies("accessToken", accessToken);
        }

        // If the backend returned a new refresh token (rotating refresh tokens), update it in the cookies
        if(newRefreshToken){
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        // Optional: Updates a separate session token for third-party auth (like better-auth)
        if(token){
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // valid for 1 day
        }

        return true;
    } catch (error) {
        // Log errors to server console (e.g., node backend/vercel logs) safely, hiding any sensitive error stacks
        console.error("Error refreshing token:", error);
        return false;
    }
}

/**
 * Fetches the currently authenticated user's profile information from the backend `/auth/me` endpoint.
 * It automatically retrieves the available access token from Next.js server-side cookies.
 * 
 * @returns The user's detailed data object if authenticated successfully, or null otherwise.
 */
export async function getUserInfo() {
    try {
        // Get the runtime cookie store from Next.js headers
        const cookieStore = await cookies();
        
        // Extract the user's access token if it exists
        const accessToken = cookieStore.get("accessToken")?.value;

        // If there's no access token, the user isn't logged in thus we return null early
        if (!accessToken) {
            return null;
        }

        // Fetch the user's details from the backend using the retrieved access token
        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // Send the accessToken along with the request securely
                Cookie: `accessToken=${accessToken}`
            }
        });

        // If the response fails (e.g. 401 Unauthorized), the token might be invalid or expired
        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        // Parse and return the user details contained within the 'data' record
        const { data } = await res.json();
        return data;
        
    } catch (error) {
        // Fallback for network issues or server crashes
        console.error("Error fetching user info:", error);
        return null;
    }
}