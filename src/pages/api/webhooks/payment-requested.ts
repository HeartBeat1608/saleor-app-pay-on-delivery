import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: OrderCreatedWebhookPayloadFragment
 */
const PaymentGatewayInitializeWebhookPayload = gql`
  fragment PaymentGatewayInitializeWebhookPayload on PaymentGatewayInitializeSession {
    amount
    issuedAt
    issuingPrincipal {
      __typename
    }
    version
    recipient {
      id
      name
    }
    data
    sourceObject {
      __typename
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const PaymentGatewayInitializeQuery = gql`
  # Payload fragment must be included in the root query
  ${PaymentGatewayInitializeWebhookPayload}
  subscription {
    event {
      ...PaymentGatewayInitializeWebhookPayload
    }
  }
`;

/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * orderCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
// export const paymentGatewayInitialize = new SaleorAsyncWebhook<any>({
//   name: "Payment Gateway Requested",
//   webhookPath: "api/webhooks/payment-requested",
//   event: "CHECKOUT_CREATED",
//   apl: saleorApp.apl,
//   query: OrderCreatedGraphqlSubscription,
// });

export const paymentGatewayInitializeSync = new SaleorSyncWebhook<any>({
  name: "Payment Gateway Requested",
  webhookPath: "api/webhooks/payment-requested",
  event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
  apl: saleorApp.apl,
  query: PaymentGatewayInitializeQuery,
});

paymentGatewayInitializeSync.createHandler((req, res, ctx) => {
  const { payload, authData } = ctx;

  console.log(`Payment Gateway Requested for checkout: ${payload.checkout?.id}`);
  console.log(payload);

  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  return res.status(200).end();
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
