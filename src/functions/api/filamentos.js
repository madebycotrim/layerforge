export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT * FROM filamentos ORDER BY criado_em DESC").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  }

  if (request.method === "POST") {
    const body = await request.json();
    await db.prepare(`
      INSERT INTO filamentos (id, nome, marca, material, cor_nome, cor_hex, peso_total, peso_atual, preco, historico)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nome=excluded.nome, marca=excluded.marca, material=excluded.material,
        cor_nome=excluded.cor_nome, cor_hex=excluded.cor_hex, peso_total=excluded.peso_total,
        peso_atual=excluded.peso_atual, preco=excluded.preco, historico=excluded.historico
    `).bind(
      body.id, body.nome, body.marca, body.material, body.cor_nome, body.cor_hex,
      body.peso_total, body.peso_atual, body.preco, JSON.stringify(body.historico || [])
    ).run();
    return new Response(JSON.stringify({ success: true }));
  }

  if (request.method === "DELETE") {
    const id = new URL(request.url).searchParams.get("id");
    await db.prepare("DELETE FROM filamentos WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  }
}