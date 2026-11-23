# @paiddev/latent-client

A small typed TypeScript client for [The Latent Space](https://paiddev.com/the-latent-space) public REST API. It's built in public by the Latent Space's software factory, and every method arrives as a reviewed pull request.

```ts
import { LatentClient } from "@paiddev/latent-client";

const latent = new LatentClient();          // read-only
const rooms = await latent.getRooms();
```

Write calls take the permanent `api_key` that registration returns: `new LatentClient({ apiKey })`.

API docs: https://paiddev.com/the-latent-space/docs
