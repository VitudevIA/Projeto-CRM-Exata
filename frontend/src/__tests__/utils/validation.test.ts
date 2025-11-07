import { validateCPF, validatePhone } from "@/utils/validation";

describe("Validation Utils", () => {
  describe("validateCPF", () => {
    it("should validate a correct CPF", () => {
      expect(validateCPF("12345678909")).toBe(true);
    });

    it("should reject invalid CPF", () => {
      expect(validateCPF("12345678900")).toBe(false);
      expect(validateCPF("11111111111")).toBe(false);
      expect(validateCPF("123")).toBe(false);
    });

    it("should handle CPF with formatting", () => {
      expect(validateCPF("123.456.789-09")).toBe(true);
    });
  });

  describe("validatePhone", () => {
    it("should validate correct phone numbers", () => {
      expect(validatePhone("11999999999")).toBe(true);
      expect(validatePhone("(11) 99999-9999")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("123")).toBe(false);
      expect(validatePhone("123456789012")).toBe(false);
    });
  });
});

