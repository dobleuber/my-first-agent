import { it, expect, describe } from "@jest/globals";

import { graph } from "../../graph.js";

describe("Graph Integration", () => {
  it("should be able to invoke the graph with a simple math question", async () => {
    const res = await graph.invoke({
      messages: [
        {
          role: "user",
          content: "What is 2 + 3?",
        },
      ],
    });
    
    expect(res.messages).toBeDefined();
    expect(res.messages.length).toBeGreaterThan(0);
    expect(res.messages[0]).toHaveProperty("content");
  });
});
