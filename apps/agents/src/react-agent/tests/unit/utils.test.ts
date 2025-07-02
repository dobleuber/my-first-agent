import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { loadChatModel } from "../../utils.js";

// Mock the initChatModel function
jest.mock("langchain/chat_models/universal", () => ({
  initChatModel: jest.fn(),
}));

describe("Utils", () => {
  describe("loadChatModel", () => {
    const { initChatModel } = require("langchain/chat_models/universal");
    const mockInitChatModel = initChatModel as jest.MockedFunction<typeof initChatModel>;

    beforeEach(() => {
      mockInitChatModel.mockClear();
    });

    it("should call initChatModel with just the model name when no provider is specified", async () => {
      const modelName = "claude-3-sonnet";
      const mockModel = { name: "mock-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(modelName);

      expect(mockInitChatModel).toHaveBeenCalledWith(modelName);
      expect(mockInitChatModel).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockModel);
    });

    it("should parse provider/model format correctly", async () => {
      const fullySpecifiedName = "anthropic/claude-3-sonnet";
      const mockModel = { name: "mock-anthropic-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("claude-3-sonnet", {
        modelProvider: "anthropic"
      });
      expect(mockInitChatModel).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockModel);
    });

    it("should handle complex model names with multiple parts", async () => {
      const fullySpecifiedName = "openai/gpt-4-turbo-preview";
      const mockModel = { name: "mock-openai-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("gpt-4-turbo-preview", {
        modelProvider: "openai"
      });
      expect(result).toBe(mockModel);
    });

    it("should handle provider names with dashes", async () => {
      const fullySpecifiedName = "azure-openai/gpt-4";
      const mockModel = { name: "mock-azure-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("gpt-4", {
        modelProvider: "azure-openai"
      });
      expect(result).toBe(mockModel);
    });

    it("should handle model names with multiple slashes by taking only the first one as provider separator", async () => {
      const fullySpecifiedName = "provider/path/to/model";
      const mockModel = { name: "mock-complex-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("path/to/model", {
        modelProvider: "provider"
      });
      expect(result).toBe(mockModel);
    });

    it("should handle empty strings", async () => {
      const fullySpecifiedName = "";
      const mockModel = { name: "mock-empty-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("");
      expect(result).toBe(mockModel);
    });

    it("should handle provider with no model (edge case)", async () => {
      const fullySpecifiedName = "provider/";
      const mockModel = { name: "mock-edge-case-model" };
      mockInitChatModel.mockResolvedValueOnce(mockModel);

      const result = await loadChatModel(fullySpecifiedName);

      expect(mockInitChatModel).toHaveBeenCalledWith("", {
        modelProvider: "provider"
      });
      expect(result).toBe(mockModel);
    });

    it("should propagate errors from initChatModel", async () => {
      const fullySpecifiedName = "invalid/model";
      const error = new Error("Invalid model configuration");
      mockInitChatModel.mockRejectedValueOnce(error);

      await expect(loadChatModel(fullySpecifiedName)).rejects.toThrow(error);
    });
  });
});