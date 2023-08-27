import { authenticatedLndGrpc } from "lightning";
import { env } from "../env";

export const { lnd } = authenticatedLndGrpc({
    cert: env.cert,
    macaroon: env.macaroon,
    socket: env.socket,
});
