<script lang="ts">
    import { endpoint } from "$lib";
    import DataTable, { Cell, Head, Row } from "@smui/data-table";
    import { onMount } from "svelte";
    import CellWithInfo from "../CellWithInfo.svelte";

    interface Peer {
        pubkey: string;
        socket: string;
    }

    let peers: Peer[] | undefined = undefined;

    onMount(async () => await fetchPeers());

    async function fetchPeers() {
        try {
            const res = await fetch(`${endpoint}/network`);
            peers = (await res.json()).peers;
        } catch (err) {
            console.log(err);
        }
    }
</script>

<div class="container">
    <h2>Pares</h2>
    {#if peers}
        <DataTable>
            <Head>
                <Row>
                    <CellWithInfo
                        title="🔑 Pubkey"
                        description="Pubkey do par"
                    />
                    <CellWithInfo
                        title="📡 Host"
                        description="Endpoint do par"
                    />
                </Row>
            </Head>
            {#each peers as p}
                <Row>
                    <Cell>{p.pubkey}</Cell>
                    <Cell>{p.socket}</Cell>
                </Row>
            {/each}
        </DataTable>
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
