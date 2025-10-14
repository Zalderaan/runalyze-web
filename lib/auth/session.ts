/**
 * * PURPOSE: manages user session creation, 
 * *          encryption, storage, and deletion using JWTs + browser cookies
 * 
 * * KEY FUNCTIONS:
 * *    createSession & deleteSession -- called upon login & logout
 * *    encypt & decrypt -- handle JWT creation & validation
 */

'use server'

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt }); // create session

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: false,
        secure: true,
        expires: expiresAt
    })
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

type SessionPayload = {
    userId: string;
    expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload
    } catch {
        // console.log("Failed to verify session")
    }
}