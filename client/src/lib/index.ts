export const endpoint = "http://localhost:8000/api";

export const formatSats = (sats: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BTC",
        currencyDisplay: "narrowSymbol",
        signDisplay: "always",
        minimumFractionDigits: 8,
    })
        .format(sats / 1e8)
        .replace("BTC", "₿");

export const formatPercent = (number: number): string => {
    return new Intl.NumberFormat("pt-BR", {
        style: "percent",
    }).format(number);
};

export function formatFee(fee: number): string {
    return `${fee} sat/vB`;
}

export function formatPayreq(payreq: string): string {
    return payreq.slice(0, 10) + "..." + payreq.slice(-10);
}
