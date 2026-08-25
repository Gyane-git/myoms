const API_URL =
  "http://myomsapi.globaltechsolution.com.np:802/api/GeneralLedger/SaveProductRelated";

type SavePayload = {
  objLedgerDetails?: unknown[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SavePayload;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return Response.json(
      {
        success: res.ok,
        message:
          (data && typeof data === "object" && "message" in data
            ? String((data as { message?: unknown }).message ?? "")
            : "") || (res.ok ? "Product saved successfully" : "Product save failed"),
        data,
      },
      { status: res.ok ? 200 : res.status }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Product save failed",
      },
      { status: 500 }
    );
  }
}
