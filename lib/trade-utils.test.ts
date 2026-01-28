import { calculateRR, calculateRealizedRR } from "./trade-utils";

describe("Trade Utilities - RR Calculations", () => {
  describe("calculateRR (Predicted)", () => {
    test("calculates Long RR correctly", () => {
      const result = calculateRR({
        entryPrice: 100,
        stopLoss: 90,
        takeProfit: 130,
        direction: "Long",
      });
      expect(result).toBe(3.0); // (130-100) / (100-90) = 30 / 10 = 3
    });

    test("calculates Short RR correctly", () => {
      const result = calculateRR({
        entryPrice: 100,
        stopLoss: 110,
        takeProfit: 70,
        direction: "Short",
      });
      expect(result).toBe(3.0); // (100-70) / (110-100) = 30 / 10 = 3
    });

    test("returns 0 if risk is 0 or negative for Long", () => {
      const result = calculateRR({
        entryPrice: 100,
        stopLoss: 110, // SL above entry for Long
        takeProfit: 130,
        direction: "Long",
      });
      expect(result).toBe(0);
    });

    test("enforces 2-decimal precision", () => {
      const result = calculateRR({
        entryPrice: 100,
        stopLoss: 97,
        takeProfit: 105,
        direction: "Long",
      });
      // (105-100) / (100-97) = 5 / 3 = 1.6666...
      expect(result).toBe(1.67);
    });
  });

  describe("calculateRealizedRR", () => {
    test("calculates Realized Long RR correctly (Win)", () => {
      const result = calculateRealizedRR({
        entryPrice: 100,
        stopLoss: 90,
        exitPrice: 120,
        direction: "Long",
      });
      expect(result).toBe(2.0); // (120-100) / (100-90) = 2
    });

    test("calculates Realized Long RR correctly (Loss)", () => {
      const result = calculateRealizedRR({
        entryPrice: 100,
        stopLoss: 90,
        exitPrice: 95,
        direction: "Long",
      });
      expect(result).toBe(-0.5); // (95-100) / (100-90) = -5 / 10 = -0.5
    });

    test("calculates Realized Short RR correctly (Win)", () => {
      const result = calculateRealizedRR({
        entryPrice: 100,
        stopLoss: 110,
        exitPrice: 80,
        direction: "Short",
      });
      expect(result).toBe(2.0); // (100-80) / (110-100) = 2
    });

    test("enforces 2-decimal precision for realized RR", () => {
      const result = calculateRealizedRR({
        entryPrice: 100,
        stopLoss: 97,
        exitPrice: 98.5,
        direction: "Long",
      });
      // (98.5-100) / (100-97) = -1.5 / 3 = -0.5
      expect(result).toBe(-0.5);
    });
  });
});
