import * as dotenv from "dotenv";

interface Env {
    port: number,
    cert: string,
    socket: string,
    macaroon: string,
}

function getEnv(): Env {
    dotenv.config();

    if (
        !process.env.PORT ||
        !process.env.LND_SOCKET ||
        !process.env.LND_CERT ||
        !process.env.LND_MACAROON
    ) {
        throw new Error("You've missed something on your env");
    }

    return {
        port: parseInt(process.env.PORT),
        cert: process.env.LND_CERT,
        macaroon: process.env.LND_MACAROON,
        socket: process.env.LND_SOCKET
    };
}

export const env = getEnv();
