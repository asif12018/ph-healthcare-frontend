"use server"

import { httpClient } from "@/lib/axios/httpClient";

interface IDoctor {
    
}

export const getDoctors = async () =>{
    const doctors = await httpClient.get("/doctors");
    return doctors;
}