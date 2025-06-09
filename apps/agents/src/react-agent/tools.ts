/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Tavily search tool configuration
 * This tool allows the agent to perform web searches using the Tavily API.
 */
const searchTavily = new TavilySearchResults({
  maxResults: 3,
});

const wikipediaTool = new WikipediaQueryRun({
  topKResults: 3,
  maxDocContentLength: 4000,
});

export const adderTool = tool(
  async ({ a, b }: { a: number; b: number }): Promise<string> => {
    const sum = a + b;
    return `La suma de ${a} y ${b} es ${sum}`;
  },
  {
    name: "adder",
    description: "Suma dos números proporcionados",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

export const weatherTool = tool(
  async ({ city }: { city: string }) => {
    const response = await fetch(`https://wttr.in/${city}?format=3`);
    const result = await response.text();
    return result;
  },
  {
    name: "weather",
    description: "Obtiene el clima actual de una ciudad",
    schema: z.object({
      city: z.string(),
    }),
  }
);

/**
 * Export an array of all available tools
 * Add new tools to this array to make them available to the agent
 *
 * Note: You can create custom tools by implementing the Tool interface from @langchain/core/tools
 * and add them to this array.
 * See https://js.langchain.com/docs/how_to/custom_tools/#tool-function for more information.
 */
export const TOOLS = [searchTavily, wikipediaTool, adderTool, weatherTool];
