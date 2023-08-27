import { Router } from "express";
import { getChainBalance, getChannels, getPendingChainBalance, getPendingChannels, getWalletInfo } from "lightning";
import { lnd } from "../lnd";
import { getRecommendedFees } from "../mempooolspace";

interface Info {
    synced: boolean,
    pubkey: string,
    onChainBalance: {
        confirmed: number,
        pending: number,
        total: number,
    },
    lightningBalance: {
        available: number,
        notAvailable: number,
        pending: number,
        total: number,
    },
    fees: {
        fastest: number,
        hour: number,
        halfHour: number,
        minimum: number,
    }
}

async function getInfo(): Promise<Info> {
    const [
        { public_key, is_synced_to_chain },
        { chain_balance },
        { pending_chain_balance },
        { channels },
        { pending_channels },
        { fastest, hour, minimum, halfHour },
    ] = await Promise.all([
        getWalletInfo({ lnd }),
        getChainBalance({ lnd }),
        getPendingChainBalance({ lnd }),
        getChannels({ lnd }),
        getPendingChannels({ lnd }),
        getRecommendedFees(),
    ]);

    const confirmedOnChainBalance = chain_balance;
    const pendingOnChainBalance = pending_chain_balance;

    const totalLNBalance = channels
        .reduce((acc, curr) => acc += curr.local_balance, 0);

    const availableLNBalance = channels
        .filter((c) => c.is_active)
        .reduce((acc, curr) => acc += curr.local_balance, 0);

    const pendingLNBalance = pending_channels
        .reduce((acc, curr) => acc += curr.local_balance, 0);

    return {
        synced: is_synced_to_chain,
        pubkey: public_key,
        onChainBalance: {
            confirmed: confirmedOnChainBalance,
            pending: pendingOnChainBalance,
            total: confirmedOnChainBalance + pendingOnChainBalance,
        },
        lightningBalance: {
            available: availableLNBalance,
            notAvailable: totalLNBalance - availableLNBalance,
            pending: pendingLNBalance,
            total: totalLNBalance,
        },
        fees: {
            fastest,
            hour,
            halfHour,
            minimum,
        }
    };
}

const router = Router();

router.get('/', async (_, res) => {
    try {
        return res.send(await getInfo());
    } catch (err) {
        return res.status(500).send(err);
    }
});

export const info = router;
