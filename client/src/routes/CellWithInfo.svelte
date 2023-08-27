<script lang="ts">
    import { Cell } from "@smui/data-table";
    import { Graphic } from "@smui/list";
    import Tooltip, { Wrapper } from "@smui/tooltip";

    export let title: string;
    export let description: string;
</script>

<Wrapper>
    <Cell {...$$restProps}>
        <div class="container">
            {title}
            <Graphic class="material-icons" aria-hidden="true">info</Graphic>

            <Tooltip>{description}</Tooltip>
            <slot />
        </div>
    </Cell>
</Wrapper>

<style>
    .container {
        display: flex;
        gap: 2px;
        align-items: center;
    }
</style>
