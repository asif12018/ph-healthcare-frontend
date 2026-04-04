import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { isTokenExpiringSoon } from '../tokenUtils';
import { cookies, headers } from 'next/headers';
import { getNewTokensWithRefreshToken } from '@/app/services/auth.services';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables');
}

/**
 * Checks if the current access token is about to expire and refreshes it if necessary.
 * This ensures that API requests don't fail due to an expired token seamlessly.
 * 
 * @param accessToken - The user's current JWT access token.
 * @param refreshToken - The token used to request a new set of tokens.
 */
async function tryRefreshToken(accessToken:string, refreshToken:string): Promise<void> {
  // If the token is still valid and not expiring soon, do nothing
  if(!isTokenExpiringSoon(accessToken)){
    return;
  }
   
   // Prevents an infinite loop if the middleware has already refreshed it natively in this request cycle
   const requestHeader = await headers();
   if(requestHeader.get("x-token-refreshed") === "1"){
    return;
   }

   try{
    // Hit the auth service to rotate the tokens and update the cookies
    await getNewTokensWithRefreshToken(refreshToken);
   }catch(error:any){
      console.error("Error refreshing token: httpClient", error);
   }
}

/**
 * Creates and configures an Axios HTTP client instance dynamically for server-side fetching.
 * It automatically grabs cookies (like access tokens) from Next.js and attaches them to every outgoing request.
 * 
 * @returns A fully configured Axios instance ready to make secure API calls.
 */
const axiosInstance = async() => {
    // 1. Retrieve all cookies set by the Next.js app 
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    // 2. Automatically refresh the token if it's about to expire before we make the HTTP call
    if(accessToken && refreshToken){
        await tryRefreshToken(accessToken, refreshToken);
    }
    
    // 3. Serialize the cookies back into a standard "Cookie" string format
    // Example: "accessToken=eyJhb...; refreshToken=eyJhb..."
    const cookieHeader = cookieStore.getAll().map((cookie ) => `${cookie.name}=${cookie.value}`).join("; ");
    
    // 4. Create an isolated Axios instance for this specific server-side request
    const instance = axios.create({
        baseURL : API_BASE_URL,    // Point to our Next.js backend API
        timeout : 30000,           // Drop the request if it takes > 30s
        headers:{
            'Content-Type' : 'application/json',
            Cookie: cookieHeader   // Automatically attach the current session cookies to the fetch
        }
    })

    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

/**
 * Reusable HTTP GET method using the configured Axios instance.
 * Automatically type-checks the response wrapper via ApiResponse<TData>.
 */
const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions) : Promise<ApiResponse<TData>> => {
    try {     
        const instance = await axiosInstance();   
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {       
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    }
    catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpDelete =  async <TData>(endpoint: string, options?: ApiRequestOptions) : Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
}