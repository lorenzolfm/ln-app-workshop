import { Router, Request } from "express";
import { addPeer, getPeers, removePeer } from "lightning";
import { lnd } from "../lnd";

const router = Router();

export interface ListPeersResponse {
    peers: string[],
}

async function listPeers(): Promise<ListPeersResponse> {
    const peers = (await getPeers({ lnd })).peers;

    return { peers: peers.map((p) => p.public_key) };
}

router.get('/', async (_, res) => res.send(await listPeers()));

export interface ConnectRequest extends Request {
    body: {
        pubkey: string,
        host: string,
    }
}

router.post('/connect', async (req: ConnectRequest, res) => {
    try {
        const pubkey = req.body.pubkey;
        const host = req.body.host;

        await addPeer({ lnd, public_key: pubkey, socket: host, timeout: 1000 });

        return res.status(200).send("Connected");
    } catch (err) {
        return res.status(500).send(`${err}`);
    }
});

router.get('/disconnect/:pubkey', async (req, res) => {
    try {
        const pubkey = req.params.pubkey;

        await removePeer({ lnd, public_key: pubkey });

        return res.status(200).send("Disonnected");
    } catch (err) {
        return res.status(500).send(`${err}`);
    }
});

export const network = router;
