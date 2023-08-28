<script lang="ts">
    import { endpoint } from "$lib";
    import DataTable, { Cell, Head, Row } from "@smui/data-table";
    import IconButton from "@smui/icon-button";
    import { onMount } from "svelte";
    import CellWithInfo from "../CellWithInfo.svelte";
    import Textfield from "@smui/textfield";
    import Button from "@smui/button";
    import { parseAddress } from "$lib";

    interface Peer {
        pubkey: string;
        socket: string;
    }

    let address: string = "";
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

    async function disconnect(pubkey: string) {
        try {
            await fetch(`${endpoint}/network/disconnect/${pubkey}`);
            await fetchPeers();
        } catch (err) {
            console.log(err);
        }
    }

    async function connect(address: string) {
        try {
            const { pubkey, host } = parseAddress(address);

            const body = {
                pubkey,
                host,
            };

            const response = await fetch(`${endpoint}/network/connect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                console.log(`${response.status}`);
            }

            return await fetchPeers();
        } catch (err) {
            console.error(err);
        }
    }

    async function copyPubkey(pubkey: string) {
        try {
            await navigator.clipboard.writeText(pubkey);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }

    $: disabled = address === "";
</script>

<div class="container">
    <h2>Pares</h2>
    <div class="field-container">
        <Textfield
            variant="outlined"
            bind:value={address}
            style="width: 100%"
        />

        <Button on:click={() => connect(address)} variant="raised" {disabled}
            >Conectar</Button
        >
        <Button on:click={fetchPeers} variant="raised">Recarregar</Button>
    </div>

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
                    <CellWithInfo
                        title="🙅 Disconnet"
                        description="Click to disconnet peer"
                    />
                </Row>
            </Head>
            {#each peers as p}
                <Row>
                    <Cell on:click={() => copyPubkey(p.pubkey)}>{p.pubkey}</Cell
                    >
                    <Cell>{p.socket}</Cell>
                    <Cell>
                        <IconButton
                            class="material-icons"
                            on:click={() => disconnect(p.pubkey)}
                            >wifi_off</IconButton
                        >
                    </Cell>
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
    .field-container {
        flex: 1;
        margin: 20px;
    }
</style>
