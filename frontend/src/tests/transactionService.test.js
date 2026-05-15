import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../services/api.js";
import transactionService from "../services/transactionService.js";

const sampleTx = {
  id: "tx-1",
  amount: -50000,
  category: "makanan",
  description: "Mie ayam",
  date: "2025-01-01T00:00:00.000Z",
};

describe("transactionService.getTransactions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /transactions and returns data array", async () => {
    api.get.mockResolvedValue({ data: [sampleTx] });

    const result = await transactionService.getTransactions();

    expect(api.get).toHaveBeenCalledWith("/transactions");
    expect(result).toEqual([sampleTx]);
  });

  it("propagates network errors to the caller", async () => {
    api.get.mockRejectedValue(new Error("Network Error"));
    await expect(transactionService.getTransactions()).rejects.toThrow(
      "Network Error",
    );
  });
});

describe("transactionService.createTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /transactions with payload and returns created tx", async () => {
    api.post.mockResolvedValue({ data: sampleTx });

    const payload = {
      amount: -50000,
      category: "makanan",
      description: "Mie ayam",
    };
    const result = await transactionService.createTransaction(payload);

    expect(api.post).toHaveBeenCalledWith("/transactions", payload);
    expect(result).toEqual(sampleTx);
  });

  it("propagates API errors (e.g. 400) to the caller", async () => {
    const err = Object.assign(new Error("Bad Request"), {
      response: { status: 400, data: { message: "amount required" } },
    });
    api.post.mockRejectedValue(err);

    await expect(
      transactionService.createTransaction({}),
    ).rejects.toMatchObject({
      response: { status: 400 },
    });
  });
});

describe("transactionService.updateTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PUT /transactions/:id and returns updated tx", async () => {
    const updated = { ...sampleTx, description: "Nasi goreng" };
    api.put.mockResolvedValue({ data: updated });

    const result = await transactionService.updateTransaction("tx-1", {
      description: "Nasi goreng",
    });

    expect(api.put).toHaveBeenCalledWith("/transactions/tx-1", {
      description: "Nasi goreng",
    });
    expect(result.description).toBe("Nasi goreng");
  });
});

describe("transactionService.deleteTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls DELETE /transactions/:id", async () => {
    api.delete.mockResolvedValue({ data: { message: "deleted" } });

    await transactionService.deleteTransaction("tx-1");

    expect(api.delete).toHaveBeenCalledWith("/transactions/tx-1");
  });

  it("propagates 404 when transaction not found", async () => {
    const err = Object.assign(new Error("Not Found"), {
      response: { status: 404 },
    });
    api.delete.mockRejectedValue(err);

    await expect(
      transactionService.deleteTransaction("ghost"),
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("transactionService.getTransactionById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /transactions/:id and returns the transaction", async () => {
    api.get.mockResolvedValue({ data: sampleTx });

    const result = await transactionService.getTransactionById("tx-1");

    expect(api.get).toHaveBeenCalledWith("/transactions/tx-1");
    expect(result).toEqual(sampleTx);
  });
});
