import { Request, Router } from "express";
import { closeChannel, getChannel, getChannels, getClosedChannels, getPendingChannels, openChannel } from "lightning";
import { lnd } from "../lnd";
import { Channel, ChannelInfo, ChannelStatus, Channels } from "../types";

async function listChannels(): Promise<Channels> {
    let activeChannelsCount = 0;
    let inactiveChannelsCount = 0;
    let pendingChannelsCount = 0;
    let closedChannelsCount = 0;
    let activeLocalBalance = 0;
    let activeRemoteBalance = 0;
    let inactiveLocalBalance = 0;
    let inactiveRemoteBalance = 0;
    let pendingLocalBalance = 0;
    let pendingRemoteBalance = 0;

    const [openChannels, pendingChannels, closedChannels] = await Promise.all([
        listOpenChannels(),
        listPendingChannels(),
        listClosedChannels(),
    ]);

    const channels = [
        ...openChannels,
        ...pendingChannels,
        ...closedChannels,
    ];

    for (const c of channels) {
        switch (c.status) {
            case ChannelStatus.Active:
                activeChannelsCount += 1;
                activeLocalBalance += c.localBalance;
                activeRemoteBalance += c.remoteBalance;
                break;

            case ChannelStatus.Inactive:
                inactiveChannelsCount += 1;
                inactiveLocalBalance += c.localBalance;
                inactiveRemoteBalance += c.remoteBalance;
                break;

            case ChannelStatus.Pending:
                pendingChannelsCount += 1;
                pendingLocalBalance += c.localBalance;
                pendingRemoteBalance += c.remoteBalance;
                break;

            case ChannelStatus.Closed:
                closedChannelsCount += 1;
                break;

            default:
                break;
        }
    }

    const openChannelsCount = activeChannelsCount + inactiveChannelsCount;
    const totalLocalBalance = activeLocalBalance + inactiveLocalBalance;
    const totalRemoteBalance = activeRemoteBalance + inactiveRemoteBalance;
    const totalCapacity = totalLocalBalance + totalRemoteBalance;
    const totalActiveCapacity = activeLocalBalance + activeRemoteBalance;
    const totalInactiveCapacity = inactiveLocalBalance + inactiveRemoteBalance;
    const totalPendingCapacity = pendingLocalBalance + pendingRemoteBalance;

    return {
        activeChannelsCount,
        activeLocalBalance,
        activeRemoteBalance,
        channels,
        closedChannelsCount,
        inactiveChannelsCount,
        inactiveLocalBalance,
        inactiveRemoteBalance,
        openChannelsCount,
        pendingChannelsCount,
        pendingLocalBalance,
        pendingRemoteBalance,
        totalActiveCapacity,
        totalCapacity,
        totalInactiveCapacity,
        totalLocalBalance,
        totalPendingCapacity,
        totalRemoteBalance,
    };
}


async function listOpenChannels(): Promise<Channel[]> {
    const openChannels = (await getChannels({ lnd })).channels;

    return openChannels.map((c) => {
        return {
            peer: c.partner_public_key,
            status: c.is_active ? ChannelStatus.Active : ChannelStatus.Inactive,
            capacity: c.capacity,
            localBalance: c.local_balance,
            remoteBalance: c.remote_balance,
            balanceRatio: (c.local_balance / (c.local_balance + c.remote_balance)),
            channelId: c.id,
        };
    });
}

async function listPendingChannels(): Promise<Channel[]> {
    const pendingChannels = (await getPendingChannels({ lnd })).pending_channels;


    return pendingChannels.map((c) => {
        return {
            peer: c.partner_public_key,
            status: ChannelStatus.Pending,
            capacity: c.capacity,
            localBalance: c.local_balance,
            remoteBalance: c.remote_balance,
            balanceRatio: (c.local_balance / (c.local_balance + c.remote_balance)),
        };
    });
}

async function listClosedChannels(): Promise<Channel[]> {
    const closedChannels = (await getClosedChannels({ lnd })).channels;

    return closedChannels.map((c) => {
        return {
            peer: c.partner_public_key,
            status: ChannelStatus.Closed,
            capacity: c.capacity,
            localBalance: 0,
            remoteBalance: 0,
            balanceRatio: 0,
        };
    });
}

const router = Router();

router.get('/', async (_, res) => {
    try {
        return res.send(await listChannels());
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const channel = await getChannel({ lnd, id });

        const policy = channel.policies.at(-1);

        const body: ChannelInfo = {
            id: channel.id,
            capacity: channel.capacity,
            policy: {
                base_fee_mtokens: policy?.base_fee_mtokens,
                cltv_delta: policy?.cltv_delta,
                fee_rate: policy?.fee_rate,
                is_disabled: policy?.is_disabled,
                max_htlc_mtokens: policy?.max_htlc_mtokens,
                min_htlc_mtokens: policy?.min_htlc_mtokens,
                public_key: policy?.public_key || "",
                updated_at: policy?.updated_at,
            },
            transaction_id: channel.transaction_id,
            transaction_vout: channel.transaction_vout,
            updated_at: channel.updated_at,
        };

        return res.send(body);
    } catch (err) {
        return res.status(500).send(err);
    }
});

interface OpenChannelRequest extends Request {
    body: {
        amountSats: number,
        pubkey: string,
    }
};

router.post('/open', async (req: OpenChannelRequest, res) => {
    try {
        const amountSats = req.body.amountSats;
        const pubkey = req.body.pubkey;

        const openChannelResult = await openChannel({ lnd, local_tokens: amountSats, partner_public_key: pubkey });

        return res.send(openChannelResult.transaction_id);
    } catch (err) {
        return res.status(500).send(err);
    }
});

interface CloseChannelRequest extends Request {
    body: {
        id: string;
    }
}

router.post('/close', async (req: CloseChannelRequest, res) => {
    try {
        const id = req.body.id;
        await closeChannel({ lnd, id });

        return res.send(`Closed channel ${id}`);
    } catch (err) {
        return res.status(500).send(`${err}`);
    }
});

export const channels = router;
