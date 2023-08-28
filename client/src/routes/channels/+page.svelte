<script lang="ts">
    import DataTable, {
        Body,
        Cell,
        Head,
        Row,
        SortValue,
    } from "@smui/data-table";
    import SegmentedButton, { Segment } from "@smui/segmented-button";
    import Textfield from "@smui/textfield";
    import Tooltip, { Wrapper } from "@smui/tooltip";
    import { onMount } from "svelte";
    import CellWithInfo from "../CellWithInfo.svelte";
    import BalanceTable from "./BalanceTable.svelte";
    import IconButton from "@smui/icon-button";
    import { endpoint, formatSats, formatPercent } from "$lib";

    interface ChannelDetails {
        openChannelsCount: number;
        activeChannelsCount: number;
        inactiveChannelsCount: number;
        pendingChannelsCount: number;
        closedChannelsCount: number;

        totalCapacity: number;
        totalActiveCapacity: number;
        totalInactiveCapacity: number;
        totalPendingCapacity: number;
        totalLocalBalance: number;
        totalRemoteBalance: number;
        activeLocalBalance: number;
        activeRemoteBalance: number;
        inactiveLocalBalance: number;
        inactiveRemoteBalance: number;
        pendingLocalBalance: number;
        pendingRemoteBalance: number;

        channels: Channel[];
    }

    interface Channel {
        peer: string;
        status: ChannelStatus;
        capacity: number;
        localBalance: number;
        remoteBalance: number;
        balanceRatio: number;
        channelId?: string;
    }

    enum ChannelStatus {
        Active,
        Inactive,
        Pending,
        Closed,
        UNRECOGNIZED,
    }

    const status: { name: string; value: ChannelStatus }[] = [
        { name: "🌐 Todos", value: ChannelStatus.UNRECOGNIZED },
        { name: "✅ Ativos", value: ChannelStatus.Active },
        { name: "💤 Inativos", value: ChannelStatus.Inactive },
        { name: "⏳ Pendentes", value: ChannelStatus.Pending },
        { name: "🚫 Fechados", value: ChannelStatus.Closed },
    ];
    let selectedStatus = status[1];

    enum SortOptions {
        Capacity = "Capacity",
        LocalBalance = "LocalBalance",
        RemoteBalance = "RemoteBalance",
        BalanceRatio = "BalanceRatio",
    }

    let searchTerm = "";
    let channelDetails: ChannelDetails | undefined = undefined;
    let channels: Channel[] = [];

    let sort: SortOptions = SortOptions.Capacity;
    let sortDirection: Lowercase<keyof typeof SortValue> = "ascending";

    onMount(async () => fetchChannels());

    async function fetchChannels(): Promise<void> {
        try {
            const res = await fetch(`${endpoint}/channels`);

            channelDetails = await res.json();
            if (channelDetails) {
                channels = channelDetails.channels;
            }
        } catch (err) {
            console.log(err);
        }
    }

    function formatPeerPubKey(pubkey: string): string {
        return pubkey.slice(0, 5) + "..." + pubkey.slice(-5);
    }

    function mapStatus(status: ChannelStatus): string {
        switch (status) {
            case ChannelStatus.Active:
                return "✅";
            case ChannelStatus.Inactive:
                return "💤";
            case ChannelStatus.Pending:
                return "⏳";
            case ChannelStatus.Closed:
                return "🚫";
            default:
                return "❔";
        }
    }

    function filterChannels(target: ChannelStatus, searchTerm: string): void {
        if (channelDetails?.channels === undefined) return;

        if (target === ChannelStatus.UNRECOGNIZED) {
            channels =
                searchTerm === ""
                    ? channelDetails.channels
                    : channelDetails.channels.filter((c) =>
                          pubkeyIncludesTerm(c.peer, searchTerm)
                      );
        } else {
            channels = channelDetails.channels.filter(
                (c) =>
                    c.status === target &&
                    pubkeyIncludesTerm(c.peer, searchTerm)
            );
        }

        sortChannels(channels);
    }

    function sortChannels(c: Channel[]) {
        c.sort((a, b) => {
            const [valA, valB] =
                sortDirection === "ascending" ? [a, b] : [b, a];

            switch (sort) {
                case SortOptions.Capacity:
                    return valB.capacity - valA.capacity;
                case SortOptions.LocalBalance:
                    return valB.localBalance - valA.localBalance;
                case SortOptions.RemoteBalance:
                    return valB.remoteBalance - valA.remoteBalance;
                case SortOptions.BalanceRatio:
                    return valB.balanceRatio - valA.balanceRatio;
                default:
                    return 0;
            }
        });

        channels = c;
    }

    function pubkeyIncludesTerm(pubkey: string, term: string): boolean {
        return pubkey.toLowerCase().includes(term.toLowerCase());
    }

    function getDivColor(ratio: number): string {
        if (ratio > 0.77) {
            return "#50CE5C";
        } else if (ratio <= 0.77 && ratio > 0.33) {
            return "#E1B30A";
        } else {
            return "#D13232";
        }
    }

    $: filterChannels(selectedStatus.value, searchTerm);
</script>

<div class="container">
    {#if channelDetails}
        <h2>Resumo</h2>
        <DataTable>
            <Head>
                <Row>
                    <CellWithInfo
                        title="⚡ Canais Abertos"
                        description="Canais com abertura confirmada"
                    />
                    <CellWithInfo
                        title="✅ Canais Ativos"
                        description="Canais com par online/operante"
                    />
                    <CellWithInfo
                        title="💤 Canais Inativos"
                        description="Canais com par offline/inoperante"
                    />
                    <CellWithInfo
                        title="⏳ Canais Pendentes"
                        description="Canais com transação de abertura não confirmada"
                    />
                    <CellWithInfo
                        title="🚫 Canais Fechados"
                        description="Canais com transação de fechamento confirmada"
                    />
                </Row>
            </Head>
            <Body>
                <Row>
                    <Cell>{channelDetails.openChannelsCount}</Cell>
                    <Cell>{channelDetails.activeChannelsCount}</Cell>
                    <Cell>{channelDetails.inactiveChannelsCount}</Cell>
                    <Cell>{channelDetails.pendingChannelsCount}</Cell>
                    <Cell>{channelDetails.closedChannelsCount}</Cell>
                </Row>
            </Body>
        </DataTable>

        <div style="margin-top: 20px">
            <BalanceTable
                title="💰 Capacidade"
                description="Local + Remoto"
                total={channelDetails.totalCapacity}
                active={channelDetails.totalActiveCapacity}
                inactive={channelDetails.totalInactiveCapacity}
                pending={channelDetails.totalPendingCapacity}
            />

            <BalanceTable
                title="↗️ Local"
                description="Capacidade de envio (outbound liquidity)"
                total={channelDetails.totalLocalBalance}
                active={channelDetails.activeLocalBalance}
                inactive={channelDetails.inactiveLocalBalance}
                pending={channelDetails.pendingLocalBalance}
            />

            <BalanceTable
                title="↙️ Remoto"
                description="Capacidade de recebimento (inbound liquidity)"
                total={channelDetails.totalRemoteBalance}
                active={channelDetails.activeRemoteBalance}
                inactive={channelDetails.inactiveRemoteBalance}
                pending={channelDetails.pendingRemoteBalance}
            />
        </div>

        <h2>Canais</h2>

        <div style="margin-bottom: 10px">
            <Textfield
                variant="outlined"
                bind:value={searchTerm}
                style="width: 50%; margin-top: 5px;"
            />
            <SegmentedButton
                bind:selected={selectedStatus}
                segments={status}
                let:segment
                singleSelect
            >
                <Segment
                    {segment}
                    on:click$preventDefault={() => {
                        selectedStatus = segment;
                    }}>{segment.name}</Segment
                >
            </SegmentedButton>
        </div>

        <DataTable
            stickyHeader
            sortable
            bind:sort
            bind:sortDirection
            on:SMUIDataTable:sorted={() => sortChannels(channels)}
        >
            <Head>
                <Row>
                    <CellWithInfo
                        title="🆔 Pubkey"
                        description="Chave pública do par"
                    />
                    <CellWithInfo
                        title="ℹ️  Status"
                        description="Canal com par online/operante"
                    />
                    <CellWithInfo
                        title="💰 Capacidade"
                        description="Capacidade de recebimento"
                        columnId={SortOptions.Capacity}
                    >
                        <IconButton class="material-icons"
                            >arrow_upward</IconButton
                        >
                    </CellWithInfo>
                    <CellWithInfo
                        title="↗️ Local "
                        description="Capacidade de envio"
                        columnId={SortOptions.LocalBalance}
                    >
                        <IconButton class="material-icons"
                            >arrow_upward</IconButton
                        >
                    </CellWithInfo>
                    <Cell columnId={SortOptions.BalanceRatio}
                        >⚖️ Distribuição
                        <IconButton class="material-icons"
                            >arrow_upward</IconButton
                        >
                    </Cell>
                    <CellWithInfo
                        title="↙️ Remoto"
                        description="Capacidade de recebimento"
                        columnId={SortOptions.RemoteBalance}
                    >
                        <IconButton class="material-icons"
                            >arrow_upward</IconButton
                        >
                    </CellWithInfo>
                </Row>
            </Head>

            <Body>
                {#each channels as c}
                    <Row>
                        <Cell>
                            {#if c.channelId}
                                <a href={`/channel/${c.channelId}`}>
                                    {formatPeerPubKey(c.peer)}</a
                                >
                            {:else}
                                <p>{formatPeerPubKey(c.peer)}</p>
                            {/if}
                        </Cell>
                        <Cell>{mapStatus(c.status)}</Cell>
                        <Cell>{formatSats(c.capacity)}</Cell>
                        <Cell>{formatSats(c.localBalance)}</Cell>
                        <Wrapper>
                            {@const parsedRatio = formatPercent(c.balanceRatio)}
                            <Cell>
                                <div class="balanceRatio">
                                    <div
                                        class="progress-fill"
                                        style="width: {parsedRatio}; background-color: {getDivColor(
                                            c.balanceRatio
                                        )}"
                                    />
                                </div>
                                <Tooltip>{parsedRatio}</Tooltip>
                            </Cell>
                        </Wrapper>
                        <Cell>{formatSats(c.remoteBalance)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .balanceRatio {
        display: flex;
        width: 200px;
        height: 10px;
        border: 1px outset rgb(50, 50, 50);
        border-radius: 5px;
    }

    .progress-fill {
        border-radius: 5px 5px 5px 5px;
    }
</style>
