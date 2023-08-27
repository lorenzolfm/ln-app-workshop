import express, { Application } from "express";
import { info } from "./info";
import { channels } from "./channels";
import { network } from "./network";
import { invoices } from "./invoices";

export function routes(app: Application) {
    app.use(express.json());
    app.use('/api/info', info);
    app.use('/api/channels', channels);
    app.use('/api/network', network);
    app.use('/api/invoices', invoices);
}
