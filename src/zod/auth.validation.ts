import {z} from 'zod';



export const loginZodSchema = z.object({
    email: z.email("Please provide a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})


export type ILoginPayload = z.infer<typeof loginZodSchema>;