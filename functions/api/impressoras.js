// functions/api/impressoras.js

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);
  const idParam = url.searchParams.get('id');

  try {
    // GET: Listar Impressoras
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM printers").all();
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST: Salvar ou Atualizar (Upsert)
    if (method === "POST") {
      const data = await request.json();
      
      await env.DB.prepare(`
        INSERT INTO printers (
          id, nome, marca, modelo, status, potencia, preco, 
          rendimento_total, horas_totais, ultima_manutencao_hora, 
          intervalo_manutencao, historico
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
        ON CONFLICT(id) DO UPDATE SET
          nome=?2, marca=?3, modelo=?4, status=?5, potencia=?6, preco=?7,
          rendimento_total=?8, horas_totais=?9, ultima_manutencao_hora=?10, 
          intervalo_manutencao=?11, historico=?12
      `).bind(
        data.id, data.nome, data.marca, data.modelo, data.status,
        data.potencia, data.preco, data.rendimento_total,
        data.horas_totais, data.ultima_manutencao_hora,
        data.intervalo_manutencao, data.historico // Já vem como String do seu helper corrigido
      ).run();

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // DELETE: Remover
    if (method === "DELETE") {
      if (!idParam) return new Response("ID inválido", { status: 400 });
      await env.DB.prepare("DELETE FROM printers WHERE id = ?").bind(idParam).run();
      return new Response(null, { status: 204 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}