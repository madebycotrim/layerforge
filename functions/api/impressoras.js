export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB; 

  if (!db) return new Response(JSON.stringify({ erro: "Binding DB não configurado." }), { status: 500 });

  try {
    if (request.method === "GET") {
      const { results } = await db.prepare("SELECT * FROM impressoras ORDER BY criado_em DESC").all();
      return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
      const d = await request.json();
      
      // SQLite exige string para JSON. Garantimos isso aqui.
      const historicoStr = typeof d.historico === 'string' ? d.historico : JSON.stringify(d.historico || []);

      const query = `
        INSERT INTO impressoras (
          id, nome, marca, modelo, potencia, preco, rendimento_total, status, horas_totais, ultima_manutencao_hora, historico
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nome=excluded.nome, 
          marca=excluded.marca, 
          modelo=excluded.modelo, 
          potencia=excluded.potencia, 
          preco=excluded.preco, 
          rendimento_total=excluded.rendimento_total,
          status=excluded.status, 
          horas_totais=excluded.horas_totais, 
          ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
          historico=excluded.historico,
          atualizado_em=CURRENT_TIMESTAMP
      `;

      await db.prepare(query).bind(
        d.id, d.nome, d.marca, d.modelo, 
        Number(d.potencia) || 0, 
        Number(d.preco) || 0, 
        Number(d.rendimento_total) || 0, 
        d.status, 
        Number(d.horas_totais) || 0, 
        Number(d.ultima_manutencao_hora) || 0, 
        historicoStr
      ).run();

      return new Response(JSON.stringify({ sucesso: true }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "DELETE") {
      const id = new URL(request.url).searchParams.get("id");
      await db.prepare("DELETE FROM impressoras WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ sucesso: true }));
    }
  } catch (err) {
    return new Response(JSON.stringify({ erro: "Conflito SQL: " + err.message }), { status: 500 });
  }
}