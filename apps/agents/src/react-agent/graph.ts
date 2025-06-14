import { AIMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import { ConfigurationSchema, ensureConfiguration } from "./configuration.js";
import { TOOLS } from "./tools.js";
import { loadChatModel } from "./utils.js";

// Extiende el estado base usando Annotation.Root y el spec de MessagesAnnotation
const CustomAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  callModelCount: Annotation<number>({
    value: (prev, next) => next,
    default: () => 0,
  }),
});

// Define the function that calls the model
async function callModel(
  state: typeof CustomAnnotation.State,
  config: RunnableConfig,
): Promise<typeof CustomAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);

  // Feel free to customize the prompt, model, and other logic!
  const model = (await loadChatModel(configuration.model)).bindTools(TOOLS);

  const currentCount = state.callModelCount ?? 0;

  const response = await model.invoke([
    {
      role: "system",
      content: configuration.systemPromptTemplate.replace(
        "{system_time}",
        new Date().toISOString(),
      ),
    },
    ...state.messages,
  ]);

  // We return a list, because this will get added to the existing list
  // Además, incrementamos el contador
  return { messages: [response], callModelCount: currentCount + 1 };
}

// Nodo especial para cuando se alcanza el máximo de turnos
async function maxTurnsReached(state: typeof CustomAnnotation.State, config: RunnableConfig): Promise<typeof CustomAnnotation.Update> {
  return {
    messages: [
      {
        role: "system",
        content: "¡Has alcanzado el número máximo de turnos permitidos!"
      }
    ]
  };
}

// Define the function that determines whether to continue or not
function routeModelOutput(state: typeof CustomAnnotation.State): string {
  if (state.callModelCount >= 3) {
    return "maxTurnsReached";
  }
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  // If the LLM is invoking tools, route there.
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "tools";
  }
  // Otherwise end the graph.
  else {
    return "__end__";
  }
}

// Define a new graph. Usamos la anotación extendida para el estado personalizado
const workflow = new StateGraph(CustomAnnotation, ConfigurationSchema)
  // Define the two nodes we will cycle between
  .addNode("callModel", callModel)
  .addNode("tools", new ToolNode(TOOLS))
  .addNode("maxTurnsReached", maxTurnsReached)
  // Set the entrypoint as `callModel`
  .addEdge("__start__", "callModel")
  .addConditionalEdges(
    "callModel",
    routeModelOutput,
  )
  .addEdge("tools", "callModel");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
  interruptBefore: [],
  interruptAfter: [],
});
