import { describe, it, expect } from "@jest/globals";
import { ConfigurationSchema, ensureConfiguration } from "../../configuration.js";
import { SYSTEM_PROMPT_TEMPLATE } from "../../prompts.js";

describe("Configuration", () => {
  describe("ConfigurationSchema", () => {
    it("should have the correct annotation properties", () => {
      expect(ConfigurationSchema).toBeDefined();
      expect(ConfigurationSchema.spec).toBeDefined();
      expect(ConfigurationSchema.spec.systemPromptTemplate).toBeDefined();
      expect(ConfigurationSchema.spec.model).toBeDefined();
    });
  });

  describe("ensureConfiguration", () => {
    it("should return default configuration when no configurable is provided", () => {
      const config = {};
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe("claude-3-7-sonnet-latest");
    });

    it("should return default configuration when configurable is undefined", () => {
      const config = { configurable: undefined };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe("claude-3-7-sonnet-latest");
    });

    it("should use provided systemPromptTemplate when available", () => {
      const customPrompt = "Custom system prompt template";
      const config = {
        configurable: {
          systemPromptTemplate: customPrompt
        }
      };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(customPrompt);
      expect(result.model).toBe("claude-3-7-sonnet-latest");
    });

    it("should use provided model when available", () => {
      const customModel = "gpt-4";
      const config = {
        configurable: {
          model: customModel
        }
      };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe(customModel);
    });

    it("should use both provided values when available", () => {
      const customPrompt = "Custom system prompt";
      const customModel = "custom-model";
      const config = {
        configurable: {
          systemPromptTemplate: customPrompt,
          model: customModel
        }
      };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(customPrompt);
      expect(result.model).toBe(customModel);
    });

    it("should handle partial configuration correctly", () => {
      const config = {
        configurable: {
          model: "partial-model"
          // systemPromptTemplate not provided
        }
      };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe("partial-model");
    });

    it("should handle empty configurable object", () => {
      const config = { configurable: {} };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe("claude-3-7-sonnet-latest");
    });

    it("should ignore extra properties in configurable", () => {
      const config = {
        configurable: {
          model: "test-model",
          extraProperty: "should be ignored",
          anotherExtra: 123
        }
      };
      const result = ensureConfiguration(config);
      
      expect(result.systemPromptTemplate).toBe(SYSTEM_PROMPT_TEMPLATE);
      expect(result.model).toBe("test-model");
      expect(result).not.toHaveProperty("extraProperty");
      expect(result).not.toHaveProperty("anotherExtra");
    });
  });
});