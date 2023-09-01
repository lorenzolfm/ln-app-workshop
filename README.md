# Lightning Network App Workshop

Hello and welcome to the Lightning Network App Workshop. In this mini-tutorial we'll build a small lightning application to manage your Lightning Node.
I've come up with this approach because I think it's the best way to bootstrap the basic knowledge you'll need as an Lightning Application Developer.
Feel free to open pull requests and issues. I'm a little rusty on javascript development :P

## Setup up

* Install [Lightning Polar](https://lightningpolar.com/).
* Open polar and create a network.
* Spin up some Lightning Nodes.
* Play around with polar (open channels, pay invoices, etc...)
* Use the connect section to grab connection to fill up your `.env` (see `env.sample`)
    * LND_SOCKET -> GRPC Host
    * LND_CERT -> Base64 TLS Cert
    * LND_MACAROON -> Base64 Macaroon
* Install the dependencies with `npm install` on the server and client folder
* `npm run dev` on the server, `npm run dev -- --open` on the client.
