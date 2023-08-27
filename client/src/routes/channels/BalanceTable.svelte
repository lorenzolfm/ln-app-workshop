<script lang="ts">
    import DataTable, { Body, Cell, Head, Row } from "@smui/data-table";
    import CellWithInfo from "../CellWithInfo.svelte";
    import { formatSats } from "$lib";

    export let title: string;
    export let description: string;
    export let total: number;
    export let active: number;
    export let inactive: number;
    export let pending: number;
</script>

<DataTable>
    <Head>
        <Row>
            <CellWithInfo {title} {description} />
            <Cell>Saldo</Cell>
        </Row>
    </Head>
    <Body>
        <Row>
            <CellWithInfo title="⚡ Total" description="Capacidade total" />
            <Cell numeric>{formatSats(total)}</Cell>
        </Row>
        <Row>
            <CellWithInfo
                title="✅ Ativo"
                description="Capacidade disponível par online/operante"
            />
            <Cell numeric>{formatSats(active)}</Cell>
        </Row>
        <Row>
            <CellWithInfo
                title="💤 Inativo"
                description="Capacidade indisponível par offline/inoperante"
            />
            <Cell numeric>{formatSats(inactive)}</Cell>
        </Row>
        <Row>
            <CellWithInfo
                title="⏳ Pendente"
                description="Capacidade com transação de abertura não confirmada"
            />
            <Cell numeric>{formatSats(pending)}</Cell>
        </Row>
    </Body>
</DataTable>
