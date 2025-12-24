export async function onRequest(context) {
  const { request, env } = context;
  
  // A "chave" para o banco de dados no Cloudflare não é uma string de texto, 
  // é um BINDING (um objeto injetado diretamente no ambiente).
  const db = env.DB; 

  if (!db) {
    return new Response(JSON.stringify({ erro: "Banco de dados não configurado (Binding 'DB' ausente)" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // GET: Listar todas as impressoras
  if (request.method === "GET") {
    try {
      const { results } = await db.prepare("SELECT * FROM impressoras ORDER BY criado_em DESC").all();
      return new Response(JSON.stringify(results), { 
        headers: { "Content-Type": "application/json" } 
      });
    } catch (err) {
      return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
    }
  }

  // POST: Criar ou Atualizar (Upsert)
  if (request.method === "POST") {
    try {
      const dados = await request.json();
      await db.prepare(`
        INSERT INTO impressoras (id, nome, marca, modelo, potencia, preco, rendimento_total, status, horas_totais, ultima_manutencao_hora, historico)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, 
          potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
          status=excluded.status, horas_totais=excluded.horas_totais, 
          ultima_manutencao_hora=excluded.ultima_manutencao_hora, historico=excluded.historico,
          atualizado_em=CURRENT_TIMESTAMP
      `).bind(
        dados.id, dados.nome, dados.marca, dados.modelo, dados.potencia, dados.preco, 
        dados.rendimento_total, dados.status, dados.horas_totais, 
        dados.ultima_manutencao_hora, JSON.stringify(dados.historico || [])
      ).run();
      return new Response(JSON.stringify({ sucesso: true }));
    } catch (err) {
      return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
    }
  }

  // DELETE: Remover impressora
  if (request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      await db.prepare("DELETE FROM impressoras WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ sucesso: true }));
    } catch (err) {
      return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
    }
  }

  return new Response("Método não permitido", { status: 405 });
}