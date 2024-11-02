import { seedData1 } from "@app/db/seed-data";

describe("Consumer Secret V1 Route", async () => {
  test("GET Consumer Secrets List", async () => {
    const res = await testServer.inject({
      method: "GET",
      url: `/api/v1/consumer-secrets/${seedData1.organization.id}`,
      headers: {
        authorization: `Bearer ${jwtAuthToken}`
      }
    });
    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.payload);
    expect(payload).toEqual([]);
  });
});
