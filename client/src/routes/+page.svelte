<script lang="ts">
    import { onMount } from "svelte";
    import DataTable, { Body, Cell, Head, Row } from "@smui/data-table";
    import CellWithInfo from "./CellWithInfo.svelte";
    import { Graphic, Label } from "@smui/list";
    import Button, { Icon } from "@smui/button";

    interface Info {
        synced: boolean;
        pubkey: string;
        onChainBalance: {
            confirmed: number;
            pending: number;
            total: number;
        };
        lightningBalance: {
            available: number;
            notAvailable: number;
            pending: number;
            total: number;
        };
        fees: {
            fastest: number;
            hour: number;
            halfHour: number;
            minimum: number;
        };
    }

    let info: Info | undefined = undefined;

    async function fetchInfo(): Promise<void> {
        try {
            const res = await fetch("http://localhost:8000/api/info");
            info = await res.json();
        } catch (err) {
            console.log(err);
        }
    }

    const formatSats = (sats: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BTC",
            currencyDisplay: "narrowSymbol",
            signDisplay: "always",
            minimumFractionDigits: 8,
        })
            .format(sats / 1e8)
            .replace("BTC", "₿");

    function formatFee(fee: number): string {
        return `${fee} sat/vB`;
    }

    async function copyToCliboard() {
        try {
            if (!info) {
                return;
            }

            await navigator.clipboard.writeText(info?.pubkey);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }

    onMount(async () => await fetchInfo());
</script>

<div class="container">
    {#if info}
        <h2>Resumo</h2>
        <DataTable>
            <Head>
                <Row>
                    <CellWithInfo
                        title="Sincronizado"
                        description="O node Lightning está sincronizado com a blockchain"
                    />
                    <CellWithInfo
                        title="Total"
                        description="Soma na carteira Bitcoin do node Lightning e quantidade travada em canais de pagamento"
                    />
                    <CellWithInfo
                        title="Bitcoin"
                        description="Soma na carteira Bitcoin do node Lightning"
                    />
                    <CellWithInfo
                        title="Lightning"
                        description="Quantidade travada em canais de pagamento"
                    />
                </Row>
            </Head>

            <Body>
                <Row>
                    <Cell>{info.synced ? "✅" : "❌"}</Cell>
                    <Cell numeric
                        >{formatSats(
                            info.onChainBalance.total +
                                info.lightningBalance.total
                        )}</Cell
                    >
                    <Cell numeric>{formatSats(info.onChainBalance.total)}</Cell>
                    <Cell numeric
                        >{formatSats(info.lightningBalance.total)}</Cell
                    >
                </Row>
            </Body>
        </DataTable>

        <div style="margin-top: 20px;">
            <DataTable>
                <Head>
                    <Row>
                        <Cell>
                            <Graphic class="material-icons" aria-hidden="true"
                                >bolt</Graphic
                            >
                        </Cell>
                        <Cell>Lightning</Cell>
                    </Row>
                </Head>

                <Body>
                    <Row>
                        <CellWithInfo
                            title="Disponível"
                            description="Saldo em canais ativos"
                        />
                        <Cell numeric
                            >{formatSats(info.lightningBalance.available)}</Cell
                        >
                    </Row>
                    <Row>
                        <CellWithInfo
                            title="Indisponível"
                            description="Saldo em canais inativos"
                        />
                        <Cell numeric
                            >{formatSats(
                                info.lightningBalance.notAvailable
                            )}</Cell
                        >
                    </Row>
                    <Row>
                        <CellWithInfo
                            title="Pendente"
                            description="Saldo pendente em canais não confirmados"
                        />
                        <Cell numeric
                            >{formatSats(info.lightningBalance.pending)}</Cell
                        >
                    </Row>
                </Body>
            </DataTable>

            <DataTable>
                <Head>
                    <Row>
                        <Cell>
                            <Graphic class="material-icons" aria-hidden="true"
                                >anchor</Graphic
                            >
                        </Cell>
                        <Cell>Bitcoin</Cell>
                    </Row>
                </Head>

                <Body>
                    <Row>
                        <CellWithInfo
                            title="Disponível"
                            description="Saldo confirmado em carteira"
                        />
                        <Cell numeric
                            >{formatSats(info.onChainBalance.total)}</Cell
                        >
                    </Row>
                    <Row>
                        <CellWithInfo
                            title="Pendente"
                            description="Saldo não confirmado"
                        />
                        <Cell numeric
                            >{formatSats(info.onChainBalance.pending)}</Cell
                        >
                    </Row>
                </Body>
            </DataTable>
        </div>

        {#if info.pubkey}
            <div style="margin-top: 20px;">
                <h2>Conectar</h2>
                <Button on:click={copyToCliboard}>
                    <Icon class="material-icons">copy_all</Icon>
                    <Label>{info.pubkey}</Label>
                </Button>
                <div>
                    <a
                        href={`https://mempool.space/lightning/node/${info.pubkey}`}
                        target="_blank"
                        rel="noreferrer">Mempool</a
                    >
                    <a
                        href={`https://amboss.space/node/${info.pubkey}`}
                        target="_blank"
                        rel="noreferrer">Amboss</a
                    >
                    <a
                        href={`https://1ml.com/node/${info.pubkey}`}
                        target="_blank"
                        rel="noreferrer">1ml</a
                    >
                </div>
            </div>
        {/if}

        <div>
            <h2>Taxas (sat/vByte)</h2>

            <DataTable>
                <Head>
                    <Row>
                        <Cell>Rápida</Cell>
                        <Cell>Meia-hora</Cell>
                        <Cell>Hora</Cell>
                        <Cell>Mínima</Cell>
                    </Row>
                </Head>

                <Body>
                    <Row>
                        <Cell>{formatFee(info.fees.fastest)}</Cell>
                        <Cell>{formatFee(info.fees.hour)}</Cell>
                        <Cell>{formatFee(info.fees.halfHour)}</Cell>
                        <Cell>{formatFee(info.fees.minimum)}</Cell>
                    </Row>
                </Body>
            </DataTable>
        </div>
    {/if}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 10 auto;
    }
</style>
