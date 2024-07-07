import OpenAI from "openai";

// import {
//   suggestBestsellingProducts,
//   searchProducts,
//   getShopPolicies,
// } from "./shopify";

const openai = new OpenAI();

export const embeddings = async (input: string[]) => {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
    encoding_format: "float",
  });
  return res.data;
};

export const vision = async (text: string, image_urls: string[]) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text },
          ...image_urls.map(
            (i) =>
              ({
                type: "image_url",
                image_url: { url: i, detail: "low" },
              } as const)
          ),
        ],
      },
    ],
  });
  return response.choices[0]!;
};

// const functions = () => ({
//   suggest_bestselling_products: suggestBestsellingProducts,
//   search_products: searchProducts,
//   get_shop_policies: getShopPolicies,
// });

// type FunctionNames = keyof ReturnType<typeof functions>;
// const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
//   {
//     type: "function",
//     function: {
//       name: "suggest_bestselling_products",
//       description:
//         "Gets upto top 5 bestselling products only if user query indicates intent to look for best selling products",
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "search_products",
//       description:
//         "Search up to the top 5 products based on vector search query, with a fallback to keyword search.",
//       parameters: {
//         type: "object",
//         properties: {
//           query: {
//             type: "string",
//             description:
//               "Detailed user query for product search, preserving as much context as possible.",
//           },
//           keywords: {
//             type: "array",
//             items: {
//               type: "string",
//               description: "Searchable keywords, tags, etc.",
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "get_shop_policies",
//       description:
//         "Gets shop policies based on values in a JavaScript array of one or more of these values: 'privacyPolicy', 'refundPolicy', 'shippingPolicy', 'termsOfService', 'subscriptionPolicy', 'shipsToCountries'.",
//       parameters: {
//         type: "object",
//         properties: {
//           policies: {
//             type: "array",
//             items: {
//               type: "string",
//               description:
//                 "One or more of these values: 'privacyPolicy', 'refundPolicy', 'shippingPolicy', 'termsOfService', 'subscriptionPolicy', 'shipsToCountries'.",
//             },
//           },
//         },
//       },
//     },
//   },
// ];

type CompletionParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type OpenAICompletion = {
  previousMessages?: CompletionParam[];
  currentMessage: CompletionParam;
};
export const completion = ({
  previousMessages = [],
  currentMessage,
  useTools = false,
}: OpenAICompletion & { useTools?: boolean }) => {
  const systemPrompt = `You are a sales agent on an e-commerce platform, your job is to reply to customer queries just as a real life sales agent would.
    You will be given relevant info about the products and policies if and when required to be used to answer a query appropriately.
    you must try to reply within 120 words.

    please respond in plain text instead of markdown format.`;

  return openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      { role: "system", content: systemPrompt },
      ...previousMessages,
      currentMessage,
    ],
    // ...(useTools ? { tools, tool_choice: "auto" } : {}),
    max_tokens: 512,
  });
};

// type MessagesResp = ({
//   role: OpenAI.Chat.Completions.ChatCompletionRole;
// } & Partial<Pick<Message, "message" | "action" | "actionData">>)[];

// type _Message = Partial<Pick<Message, "message" | "action" | "actionData">>;
// export const getResponseUsingOpenAI = async ({
//   message,
//   shopId,
// }: {
//   message: _Message;
//   shopId: string;
// }) => {
//   const messages: MessagesResp = [];

//   const response = await completion({
//     currentMessage: { role: "user", content: message.message! },
//     useTools: true,
//   });
//   const topChoice = response.choices[0];
//   if (topChoice.message.content)
//     messages.push({
//       role: topChoice.message.role,
//       message: topChoice.message.content,
//     });
//   if (
//     topChoice.finish_reason === "tool_calls" &&
//     topChoice.message.tool_calls
//   ) {
//     console.log(JSON.stringify(topChoice.message.tool_calls));
//     for (let index = 0; index < topChoice.message.tool_calls.length; index++) {
//       const tool_call = topChoice.message.tool_calls[index];
//       if (tool_call.type === "function") {
//         const { name, arguments: _args } = tool_call.function;
//         if (
//           ["search_products", "suggest_bestselling_products"].includes(name)
//         ) {
//           let products = await functions()[name as FunctionNames].call(
//             null,
//             shopId,
//             JSON.parse(_args)
//           );
//           if (!products?.length)
//             products = await functions()["suggest_bestselling_products"].call(
//               null,
//               shopId
//             );

//           let messageChunk = "";
//           if (name === "search_products")
//             messageChunk = "that surfaced from the search query";
//           if (name === "suggest_bestselling_products")
//             messageChunk = "of few bestselling products at our store";
//           const completionForProductRecommendations = await completion({
//             previousMessages: [{ role: "user", content: message.message! }],
            // currentMessage: {
            //   role: "system",
            //   content: `Here is the JSON of products ${messageChunk}:
            //   ${JSON.stringify(
            //     products.map((p: any) => ({
            //       title: p.title,
            //       description: p.description,
            //     }))
            //   )}

            //   based on user query recommend on ore more of these to the customer. do not list or describe products unless user asked,
            //   try to keep each products description under 30 words if replying with description.`,
            // },
//           });
//           const _topChoice = completionForProductRecommendations.choices[0];
//           if (_topChoice.message.content) {
//             messages.push({
//               role: _topChoice.message.role,
//               message: _topChoice.message.content,
//               action: "SUGGEST_PRODUCTS",
//               actionData: {
//                 products: products.map((p: any) => ({
//                   id: p.id,
//                   title: p.title,
//                   featuredImage: p.featuredImage,
//                 })),
//               },
//             });
//           }
//         }
//         if (["get_shop_policies"].includes(name)) {
//           const policies = await functions()[name as FunctionNames].call(
//             null,
//             shopId,
//             JSON.parse(_args)
//           );
//           const completionForProductRecommendations = await completion({
//             previousMessages: [{ role: "user", content: message.message! }],
//             currentMessage: {
//               role: "system",
//               content: `Here is the policy document:
//               ${JSON.stringify(policies)}

//               find and reply with the relevant answer from given policy doc under 60 words.`,
//             },
//           });
//           const _topChoice = completionForProductRecommendations.choices[0];
//           if (_topChoice.message.content) {
//             messages.push({
//               role: _topChoice.message.role,
//               message: _topChoice.message.content,
//             });
//           }
//         }
//       }
//     }
//   }

//   return messages;
// };
