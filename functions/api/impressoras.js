export async function onRequest(context) {
  const { request, env } = context;
  
  // 1. Verifica se o Binding existe
  if (!env.DB) {
    return new Response(JSON.stringify({ 
      erro: "BINDING_MISSING", 
      detalhes: "O objeto env.DB não foi injetado. Verifique o wrangler.json e o comando --d1 DB" 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const db = env.DB;

  try {
    // GET: LISTAR
    if (request.method === "GET") {
      try {
        const { results } = await db.prepare("SELECT * FROM impressoras").all();
        return new Response(JSON.stringify(results || []), { 
          headers: { "Content-Type": "application/json" } 
        });
      } catch (sqlError) {
        // Retorna o erro real do SQLite para nós
        return new Response(JSON.stringify({ 
          erro: "SQL_ERROR", 
          mensagem: sqlError.message,
          causa: "Provavelmente a tabela não existe no banco de dados local que o Wrangler está lendo agora."
        }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // POST: SALVAR
    if (request.method === "POST") {
      const d = await request.json();
      const hist = typeof d.historico === 'string' ? d.historico : JSON.stringify(d.historico || []);

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
        d.id, d.nome, d.marca, d.modelo, d.potencia, d.preco, 
        d.rendimento_total, d.status, d.horas_totais, 
        d.ultima_manutencao_hora, hist
      ).run();

      return new Response(JSON.stringify({ sucesso: true }));
    }

    return new Response("Método não permitido", { status: 405 });

  } catch (err) {
    return new Response(JSON.stringify({ 
      erro: "CRITICAL_CRASH", 
      mensagem: err.message 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}