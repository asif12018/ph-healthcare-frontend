"use server"
import { cookies } from "next/headers"



//Funciton to set cookie on browser
export const setCookie = async (name: string, value: string, maxAgeInSeconds: number) =>{
    const cookieStore = await cookies();

    cookieStore.set(name, value, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: maxAgeInSeconds
    })
}

//Function to get cookie on browser
export const getCookie = async(name: string) =>{
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}


//Function to delete cookie on browser
export const deleteCookie = async(name: string) =>{
    const cookieStore = await cookies();
    cookieStore.delete(name);
}
