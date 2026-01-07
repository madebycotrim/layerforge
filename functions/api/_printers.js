import { sendJSON, toNum, corsHeaders } from './[[path]]';

export async function handlePrinters({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    if (method === 'GET') {
        const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
        return sendJSON(results || []);
    }

    if (method === 'DELETE') {
        const id = idFromPath || url.searchParams.get('id');
        await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (['POST', 'PUT'].includes(method)) {
        const p = await request.json();
        const id = p.id || idFromPath || crypto.randomUUID();
        
        // Ajuste: Verifica se o histórico já é string ou precisa ser convertido
        const historico = typeof p.historico === 'string' 
            ? p.historico 
            : JSON.stringify(p.historico || p.history || []);

        await db.prepare(`INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
            nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, status=excluded.status, 
            potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
            horas_totais=excluded.horas_totais, ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
            intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico`)
            .bind(
                id, 
                userId, 
                p.nome || p.name, 
                p.marca || p.brand || "", 
                p.modelo || p.model || "", 
                p.status || 'idle',
                toNum(p.potencia || p.power), 
                toNum(p.preco || p.price), 
                toNum(p.rendimento_total || p.yieldTotal),
                toNum(p.horas_totais || p.totalHours), 
                toNum(p.ultima_manutencao_hora || p.lastMaintenanceHour),
                toNum(p.intervalo_manutencao || p.maintenanceInterval, 300), 
                historico
            ).run();
            
        return sendJSON({ id, ...p });
    }
}