
export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  const send = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });

  try {
    if (req.method !== "GET") {
      return send({ error: "Method not allowed" }, 405);
    }

    const apiKey = process.env.NOVA_POSHTA_API_KEY;

    if (!apiKey) {
      throw new Error("Не налаштований API-ключ Нової пошти в Netlify");
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const q = (url.searchParams.get("q") || "").trim();

    let modelName;
    let calledMethod;
    let methodProperties;

    if (type === "cities") {
      if (q.length < 2) return send({ results: [] });

      modelName = "AddressGeneral";
      calledMethod = "searchSettlements";
      methodProperties = {
        CityName: q,
        Limit: "20",
        Page: "1"
      };

    } else if (type === "warehouses") {
      const cityRef = url.searchParams.get("cityRef");

      if (!cityRef) {
        return send({ error: "Не вибрано місто" }, 400);
      }

      if (q.length < 1) return send({ results: [] });

      modelName = "Address";
      calledMethod = "getWarehouses";
      methodProperties = {
        CityRef: cityRef,
        FindByString: q,
        Page: "1",
        Limit: "30"
      };

    } else {
      return send({ error: "Невідомий тип запиту" }, 400);
    }

    const response = await fetch(
      "https://api.novaposhta.ua/v2.0/json/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          modelName,
          calledMethod,
          methodProperties
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        (result.errors || ["Помилка API Нової пошти"]).join("; ")
      );
    }

    if (type === "cities") {
      const addresses = (result.data || [])
        .flatMap(item => item.Addresses || []);

      const unique = new Map();

      for (const item of addresses) {
        const ref = item.DeliveryCity || item.Ref;
        const name = item.Present || item.MainDescription;

        if (ref && name && !unique.has(ref)) {
          unique.set(ref, { ref, name });
        }
      }

      return send({ results: [...unique.values()] });
    }

    const warehouses = (result.data || []).map(item => ({
      ref: item.Ref,
      name: item.Description
    }));

    return send({ results: warehouses });

  } catch (error) {
    return send({ error: error.message || "Помилка сервера" }, 500);
  }
};
