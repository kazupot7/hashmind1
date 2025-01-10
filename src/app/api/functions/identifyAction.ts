import { RESPONSE_CODE } from "@/types";
import openai from "../config/openai";
import HttpException from "../utils/exception";
import genConversation from "../utils/genConversation";
import { supportedActions } from "../data/ai/function";

type gptFunctions = "identify_action" | "identify_update_blog_action";

export type IdentifyActionRespType = {
  functions: gptFunctions[];
  error: null | string;
  action: null | string;
  title: null | string;
  emoji: null | string;
  subtitle: null | string;
  keywords: null | string;
  aiMsg: null | string;

  // for update blog action
  updateTitle?: null | string;
  updateContent?: null | string;
  updateSubtitle?: null | string;
  updateCoverImage?: null | string;
};

// identify user actions / intent from request
export default async function identifyAction(request: string) {
  try {
    const messages = genConversation({
      role: "user",
      message: request,
    }) as any;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "identify_action",
            description:
              "Identify users intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored. Also, the title and subtitle and emoji must be returned if available.",
            parameters: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  description: `The user request action gotten from the prompt, supported actions are ${supportedActions.join(
                    ""
                  )}`,
                },
                title: {
                  type: "string",
                  description:
                    "Extract the title of the prompt if available and make sure to be short and concise.",
                },
                subtitle: {
                  type: "string",
                  description:
                    "Extract the subtitle from the prompt. Be short and concise.",
                },
                emoji: {
                  type: "string",
                  description:
                    "Generate a random emoji of the title in the prompt.",
                },
                keywords: {
                  type: "string",
                  description:
                    "Extract keywords from the prompt and return them as a string separated by comma. Make sure no duplicate are found within the keywords and that the keywords are meaningful and not random.",
                },
              },
              required: ["action", "title", "subtitle", "emoji", "keywords"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "identify_update_blog_action",
            description:
              "Identify users intent or action from the given prompt. You need to decide from the given prompt if they want to update either (title, subtitle, cover image, content)",
            parameters: {
              type: "object",
              properties: {
                updateTitle: {
                  type: "string",
                  description:
                    "Determine if the user wants to update the title of the blog post, if they need to update the title, add the new title as value. return null if not",
                },
                updateContent: {
                  type: "string",
                  description:
                    "Determine if the user wants to update the title of the blog post. return null if not",
                },
                updateSubtitle: {
                  type: "string",
                  description:
                    "Determine if the user wants to update the subtitle of the blog post. return null if not",
                },
                updateCoverImage: {
                  type: "string",
                  description:
                    "Determine if the user wants to update the cover image of the article, if they requested one, extract the keywords of what they need the image to be, otherwise use the extracted keywords from the identify_action function. return null if not",
                },
              },
              required: ["updateTitle", "updateContent", "updateSubtitle"],
            },
          },
        },
      ],
      tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;

    // what get sent back to the client
    let funcResp = {
      // initial values
      functions: [],
      error: null,
      action: null,
      title: null,
      emoji: null,
      subtitle: null,
      keywords: null,
      aiMsg: null,
    } as IdentifyActionRespType;

    // the ai tries to identify the action from the request
    if (responseMessage?.tool_calls && responseMessage?.tool_calls.length > 0) {
      let validJson = new Map<string, IdentifyActionRespType>();
      for (let i = 0; i < responseMessage.tool_calls.length; i++) {
        const toolCall = responseMessage.tool_calls[i];
        const funcName = toolCall.function.name;
        const funcArguments = toolCall.function.arguments;

        try {
          const parseArg = JSON.parse(funcArguments);
          validJson.set(funcName, parseArg);

          if (!funcResp.action && parseArg.action) {
            funcResp.action = parseArg.action;
          }
          funcResp.functions.push(funcName as gptFunctions);

          for (const prop in parseArg) {
            // @ts-ignore
            funcResp[prop] = validJson.get(funcName)?.[prop] ?? null;
          }
        } catch (e: any) {
          // an invalid json was returned from ai model
          console.log(e);
          funcResp.error = `Something went wrong identifying your action, please try again`;
        }
      }
      return funcResp;
    }

    // the ai just tried replying to user query back.
    if (responseMessage.content) {
      funcResp.aiMsg = responseMessage.content;
      return funcResp;
    }

    // console.log({ responseMessage });
    // console.log(responseMessage.tool_calls);
  } catch (e: any) {
    console.log(e);
    throw new HttpException(
      RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
      `Error identifying ai action`,
      500
    );
  }
}

//! Would need to use embeddings here.
// identify the article that requires update using the title provided
export async function identifyArticleToUpdate(
  title: string,
  metadata: { title: string; id: string }[]
) {
  try {
    const messages = genConversation({
      role: "user",
      message: `Title: ${title} \n\n Metadata: ${metadata}`,
    }) as any;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "find_article_to_update",
            description: `Find the article to update from the given metadata. Return only the article id and title if found or identified, else return null. Metadata: ${metadata}. `,
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The found article id from the metadata",
                },
                article_id: {
                  type: "string",
                  description: `The article id of the article to update. Do not include id of article that isn't found in the metadata, return null as value if not found. Metadata: ${metadata}.`,
                },
              },
              metadata,
              required: ["title", "article_id"],
            },
          },
        },
      ],
      tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;

    console.log(responseMessage.tool_calls);
  } catch (e: any) {
    console.log(e);
    throw new HttpException(
      RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
      `Error identifying ai action`,
      500
    );
  }
}
