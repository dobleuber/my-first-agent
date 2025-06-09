import { AIMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { MessagesAnnotation, StateGraph, interrupt } from "@langchain/langgraph";
import { ToolNode, HumanInterrupt } from "@langchain/langgraph/prebuilt";

import { ConfigurationSchema, ensureConfiguration } from "./configuration.js";
import { TOOLS } from "./tools.js";
import { loadChatModel } from "./utils.js";

// Define the function that calls the model
async function callModel(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig,
): Promise<typeof MessagesAnnotation.Update> {
  /** Call the LLM powering our agent. **/
  const configuration = ensureConfiguration(config);

  // Feel free to customize the prompt, model, and other logic!
  const model = (await loadChatModel(configuration.model)).bindTools(TOOLS);

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
  return { messages: [response] };
}

// Define the function that determines whether to continue or not
function routeModelOutput(state: typeof MessagesAnnotation.State): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  // If the LLM is invoking tools, route to human approval with actions (Agent Inbox).
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "humanApprovalWithActions";
  }
  // Otherwise end the graph.
  else {
    return "__end__";
  }
}

// Create a human approval node that shows what tools will be executed
async function humanApproval(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig,
): Promise<typeof MessagesAnnotation.Update> {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  
  // Extract tool calls information
  const toolCalls = lastMessage.tool_calls || [];
  
  // Create interrupt data to show in GenericInterruptView
  const interruptData = {
    message: "Se van a ejecutar las siguientes herramientas. ¿Desea continuar?",
    toolCalls: toolCalls.map(tc => ({
      name: tc.name,
      id: tc.id,
      arguments: tc.args
    })),
    totalTools: toolCalls.length,
    timestamp: new Date().toISOString()
  };
  
  // Generate the interrupt with the tool calls data
  interrupt(interruptData);
  
  // This return value doesn't matter since we're interrupting
  return { messages: [] };
}

// Create a human approval node with approve/reject buttons using HumanInterrupt
async function humanApprovalWithActions(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig,
): Promise<typeof MessagesAnnotation.Update> {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  
  // Extract tool calls information
  const toolCalls = lastMessage.tool_calls || [];
  
  // Create HumanInterrupt for Agent Inbox with approve/reject buttons
  const toolCallsDescription = toolCalls.map(tc => 
    `${tc.name}(${JSON.stringify(tc.args)})`
  ).join(", ");
  
  // Create HumanInterrupt object that follows the expected schema
  const humanInterruptData: HumanInterrupt = {
    action_request: {
      action: "approve_tool_execution",
      args: {
        toolCalls: toolCalls,
        totalTools: toolCalls.length,
        proposedActions: toolCallsDescription
      }
    },
    description: `El agente quiere ejecutar las siguientes herramientas: ${toolCallsDescription}. ¿Desea aprobar la ejecución?`,
    config: {
      allow_edit: false,
      allow_respond: false,
      allow_ignore: true,
      allow_accept: true
    }
  };
  
  // Generate the interrupt with HumanInterrupt
  interrupt(humanInterruptData);
  
  // This return value doesn't matter since we're interrupting
  return { messages: [] };
}

// Define a new graph. We use the prebuilt MessagesAnnotation to define state:
// https://langchain-ai.github.io/langgraphjs/concepts/low_level/#messagesannotation
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the four nodes in our workflow
  .addNode("callModel", callModel)
  .addNode("humanApproval", humanApproval)
  .addNode("humanApprovalWithActions", humanApprovalWithActions)
  .addNode("tools", new ToolNode(TOOLS))
  // Set the entrypoint as `callModel`
  // This means that this node is the first one called
  .addEdge("__start__", "callModel")
  .addConditionalEdges(
    // First, we define the edges' source node. We use `callModel`.
    // This means these are the edges taken after the `callModel` node is called.
    "callModel",
    // Next, we pass in the function that will determine the sink node(s), which
    // will be called after the source node is called.
    routeModelOutput,
  )
  // After human approval, go to tools
  .addEdge("humanApproval", "tools")
  .addEdge("humanApprovalWithActions", "tools")
  // This means that after `tools` is called, `callModel` node is called next.
  .addEdge("tools", "callModel");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
  // We're handling interrupts internally in the humanApproval node
  interruptBefore: [],
  interruptAfter: [],
});
