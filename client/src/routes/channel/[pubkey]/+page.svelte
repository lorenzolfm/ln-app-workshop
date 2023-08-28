<script lang="ts">
    import { endpoint } from "$lib";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import DataTable, { Cell, Head, Row } from "@smui/data-table";
    import CellWithInfo from "../../CellWithInfo.svelte";
    import Button from "@smui/button";

    export let data: PageData;

    interface Channel {
        id: string;
        capacity: number;
        policy?: {
            base_fee_mtokens?: string;
            cltv_delta?: number;
            fee_rate?: number;
            is_disabled?: boolean;
            max_htlc_mtokens?: string;
            min_htlc_mtokens?: string;
            public_key: string;
            updated_at?: string;
        };
        transaction_id: string;
        transaction_vout: number;
        updated_at?: string;
    }

    let channel: Channel | undefined = undefined;

    onMount(async () => await fetchChannel());

    async function fetchChannel() {
        try {
            const res = await fetch(`${endpoint}/channels/${data.pubkey}`);
            channel = await res.json();
        } catch (err) {
            console.log(err);
        }
    }

    async function closeChannel(): Promise<void> {
        try {
            if (!channel) {
                return;
            }

            const body = {
                id: channel.id,
            };

            const res = await fetch(`${endpoint}/channels/close`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.log(`${res.status}`);
            }
        } catch (err) {
            console.log(err);
        }
    }
</script>

<div class="container">
    {#if channel}
        <h2>{channel.id}</h2>
        <DataTable>
            <Head>
                <Row>
                    <Cell>Dado</Cell>
                    <Cell>Valor</Cell>
                </Row>
            </Head>
            <Row>
                <CellWithInfo
                    title="Id"
                    description="Block X Transaction X Vout"
                />
                <Cell>{channel.id}</Cell>
            </Row>
            <Row>
                <CellWithInfo
                    title="Capacidade"
                    description="Quantidade de Bitcoin alocados no canal"
                />
                <Cell>{channel.capacity}</Cell>
            </Row>
            <Row>
                <CellWithInfo title="Id da Tx" description="Id da transacao" />
                <Cell>{channel.transaction_id}</Cell>
            </Row>
            <Row>
                <CellWithInfo
                    title="Indice do UTXO"
                    description="Indice do UTXO dentro da Tx"
                />
                <Cell>{channel.transaction_vout}</Cell>
            </Row>
            {#if channel.policy}
                <Row>
                    <CellWithInfo title="Base fee mSat" description="" />
                    <Cell>{channel.policy.base_fee_mtokens}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Fee rate" description="" />
                    <Cell>{channel.policy.fee_rate}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="CLTV Delta" description="" />
                    <Cell>{channel.policy.cltv_delta}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Desligado" description="" />
                    <Cell>{channel.policy.is_disabled ? "yes" : "no"}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Max HTLC mSat" description="" />
                    <Cell>{channel.policy.max_htlc_mtokens}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Min HTLC mSat" description="" />
                    <Cell>{channel.policy.min_htlc_mtokens}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Public key" description="" />
                    <Cell>{channel.policy.public_key}</Cell>
                </Row>
                <Row>
                    <CellWithInfo title="Atualizado em" description="" />
                    <Cell>{channel.policy.updated_at}</Cell>
                </Row>
            {/if}
        </DataTable>
        <Button
            on:click={closeChannel}
            variant="outlined"
            style="margin-top: 10px;">Fechar Canal</Button
        >
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
