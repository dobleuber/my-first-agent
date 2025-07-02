import { cn } from "../utils";

describe("utils", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("bg-red-500", "text-white");
      expect(result).toBe("bg-red-500 text-white");
    });

    it("should handle conditional classes", () => {
      const result = cn("base-class", true && "conditional-class", false && "hidden-class");
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle Tailwind conflicts correctly", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toBe("bg-blue-500");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle object-based conditional classes", () => {
      const result = cn({
        "active": true,
        "disabled": false,
        "primary": true
      });
      expect(result).toBe("active primary");
    });

    it("should merge complex Tailwind classes", () => {
      const result = cn(
        "px-4 py-2 bg-blue-500 text-white",
        "hover:bg-blue-600 focus:outline-none",
        "disabled:opacity-50"
      );
      expect(result).toBe("px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none disabled:opacity-50");
    });
  });
});