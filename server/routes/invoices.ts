import { Request, Router } from "express";
import { createInvoice, pay } from "lightning";
import { lnd } from "../lnd";

const router = Router();

router.get('/', async (_, res) => {
    try {
        const invoice = await createInvoice({ lnd });
        const payreq = invoice.request;

        return res.send({ payreq });
    } catch (err) {
        return res.status(500).send(err);
    }
});

interface PayRequest extends Request {
    body: {
        invoice: string;
    }
}

router.post('/pay', async (req: PayRequest, res) => {
    try {
        const invoice = req.body.invoice;

        const result = await pay({ lnd, request: invoice });

        return res.send(result.secret);
    } catch (err) {
        return res.status(500).send(err);
    }
});

export const invoices = router;
