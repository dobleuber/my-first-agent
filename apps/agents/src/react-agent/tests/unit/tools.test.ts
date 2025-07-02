import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { adderTool, weatherTool, TOOLS } from "../../tools.js";

describe("Tools", () => {
  describe("adderTool", () => {
    it("should add two positive numbers correctly", async () => {
      const result = await adderTool.invoke({ a: 5, b: 3 });
      expect(result).toBe("La suma de 5 y 3 es 8");
    });

    it("should add negative numbers correctly", async () => {
      const result = await adderTool.invoke({ a: -2, b: -3 });
      expect(result).toBe("La suma de -2 y -3 es -5");
    });

    it("should add zero correctly", async () => {
      const result = await adderTool.invoke({ a: 0, b: 5 });
      expect(result).toBe("La suma de 0 y 5 es 5");
    });

    it("should add decimal numbers correctly", async () => {
      const result = await adderTool.invoke({ a: 2.5, b: 1.5 });
      expect(result).toBe("La suma de 2.5 y 1.5 es 4");
    });

    it("should have correct tool metadata", () => {
      expect(adderTool.name).toBe("adder");
      expect(adderTool.description).toBe("Suma dos números proporcionados");
    });
  });

  describe("weatherTool", () => {
    beforeEach(() => {
      // Mock fetch globally for these tests
      global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    });

    it("should fetch weather data for a city", async () => {
      const mockResponse = "Madrid: ☀️ +15°C";
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: jest.fn(() => Promise.resolve(mockResponse)),
      } as any);

      const result = await weatherTool.invoke({ city: "Madrid" });
      
      expect(global.fetch).toHaveBeenCalledWith("https://wttr.in/Madrid?format=3");
      expect(result).toBe(mockResponse);
    });

    it("should handle city names with spaces", async () => {
      const mockResponse = "New York: ❄️ -5°C";
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: jest.fn(() => Promise.resolve(mockResponse)),
      } as any);

      const result = await weatherTool.invoke({ city: "New York" });
      
      expect(global.fetch).toHaveBeenCalledWith("https://wttr.in/New York?format=3");
      expect(result).toBe(mockResponse);
    });

    it("should have correct tool metadata", () => {
      expect(weatherTool.name).toBe("weather");
      expect(weatherTool.description).toBe("Obtiene el clima actual de una ciudad");
    });
  });

  describe("TOOLS array", () => {
    it("should export all available tools", () => {
      expect(TOOLS).toHaveLength(4);
      expect(TOOLS.some(tool => tool.name === "adder")).toBe(true);
      expect(TOOLS.some(tool => tool.name === "weather")).toBe(true);
      expect(TOOLS.some(tool => tool.name === "tavily_search_results_json")).toBe(true);
      expect(TOOLS.some(tool => tool.name === "wikipedia-api")).toBe(true);
    });

    it("should have tools with proper structure", () => {
      TOOLS.forEach(tool => {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(typeof tool.name).toBe("string");
        expect(typeof tool.description).toBe("string");
      });
    });
  });
});