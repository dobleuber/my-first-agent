import { ensureToolCallsHaveResponses, DO_NOT_RENDER_ID_PREFIX } from "../ensure-tool-responses";
import { Message } from "@langchain/langgraph-sdk";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));

describe("ensureToolCallsHaveResponses", () => {
  it("should return empty array when no AI messages with tool calls need responses", () => {
    const messages: Message[] = [
      {
        type: "human",
        content: "Hello",
        id: "1",
      },
      {
        type: "ai",
        content: "Hi there!",
        id: "2",
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    expect(result).toEqual([]);
  });

  it("should create tool response when AI message has tool calls but no following tool message", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "I'll search for that",
        id: "1",
        tool_calls: [
          {
            id: "tool-call-1",
            name: "search",
            args: { query: "test" },
          },
        ],
      },
      {
        type: "human",
        content: "Thanks",
        id: "2",
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: "tool",
      tool_call_id: "tool-call-1",
      id: `${DO_NOT_RENDER_ID_PREFIX}mock-uuid-1234`,
      name: "search",
      content: "Successfully handled tool call.",
    });
  });

  it("should not create tool response when AI message already has a following tool message", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "I'll search for that",
        id: "1",
        tool_calls: [
          {
            id: "tool-call-1",
            name: "search",
            args: { query: "test" },
          },
        ],
      },
      {
        type: "tool",
        tool_call_id: "tool-call-1",
        id: "2",
        name: "search",
        content: "Search results here",
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    expect(result).toEqual([]);
  });

  it("should handle multiple tool calls in a single AI message", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "I'll use multiple tools",
        id: "1",
        tool_calls: [
          {
            id: "tool-call-1",
            name: "search",
            args: { query: "test1" },
          },
          {
            id: "tool-call-2",
            name: "calculator",
            args: { expression: "2+2" },
          },
        ],
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    
    expect(result).toHaveLength(2);
    expect(result[0].tool_call_id).toBe("tool-call-1");
    expect(result[0].name).toBe("search");
    expect(result[1].tool_call_id).toBe("tool-call-2");
    expect(result[1].name).toBe("calculator");
  });

  it("should handle AI messages with empty tool_calls array", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "Just a regular response",
        id: "1",
        tool_calls: [],
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    expect(result).toEqual([]);
  });

  it("should handle AI messages without tool_calls property", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "Just a regular response",
        id: "1",
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    expect(result).toEqual([]);
  });

  it("should handle tool calls without id", () => {
    const messages: Message[] = [
      {
        type: "ai",
        content: "Using tool without id",
        id: "1",
        tool_calls: [
          {
            name: "search",
            args: { query: "test" },
          },
        ],
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    
    expect(result).toHaveLength(1);
    expect(result[0].tool_call_id).toBe("");
    expect(result[0].name).toBe("search");
  });

  it("should handle mixed scenarios in a conversation", () => {
    const messages: Message[] = [
      {
        type: "human",
        content: "Question 1",
        id: "1",
      },
      {
        type: "ai",
        content: "Using tool",
        id: "2",
        tool_calls: [
          {
            id: "tool-call-1",
            name: "search",
            args: { query: "test1" },
          },
        ],
      },
      {
        type: "tool",
        tool_call_id: "tool-call-1",
        id: "3",
        name: "search",
        content: "Results",
      },
      {
        type: "ai",
        content: "Another tool usage",
        id: "4",
        tool_calls: [
          {
            id: "tool-call-2",
            name: "calculator",
            args: { expression: "5+5" },
          },
        ],
      },
      {
        type: "human",
        content: "Thanks",
        id: "5",
      },
    ];

    const result = ensureToolCallsHaveResponses(messages);
    
    // Only the second AI message should generate a tool response
    expect(result).toHaveLength(1);
    expect(result[0].tool_call_id).toBe("tool-call-2");
    expect(result[0].name).toBe("calculator");
  });
});