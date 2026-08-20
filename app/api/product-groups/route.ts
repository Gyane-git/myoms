const API_URL =
  "http://myomsapi.globaltechsolution.com.np:802/api/MasterList/ProductListCustomer?DbName=ERPDEMO101&BrCode=";

type ProductListItem = {
  GroupName?: string;
  SubGroupName?: string;
  group_name?: string;
  sub_group_name?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getArrayPayload(payload: unknown): ProductListItem[] {
  if (Array.isArray(payload)) return payload as ProductListItem[];

  if (payload && typeof payload === "object") {
    const candidate = payload as Record<string, unknown>;
    const keys = ["data", "products", "result", "items", "objLedgerDetails"];

    for (const key of keys) {
      const value = candidate[key];
      if (Array.isArray(value)) return value as ProductListItem[];
    }
  }

  return [];
}

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
    });

    const payload = await res.json();
    const items = getArrayPayload(payload);

    const groups = new Map<string, { group: string; subGroup: string }>();

    for (const item of items) {
      const group = normalizeText(item.GroupName ?? item.group_name);
      if (!group || groups.has(group)) continue;

      groups.set(group, {
        group,
        subGroup: normalizeText(item.SubGroupName ?? item.sub_group_name),
      });
    }

    return Response.json(
      {
        groups: Array.from(groups.values()).sort((a, b) =>
          a.group.localeCompare(b.group)
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to load groups",
        groups: [],
      },
      { status: 500 }
    );
  }
}
