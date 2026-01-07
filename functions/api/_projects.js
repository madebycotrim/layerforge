import { sendJSON } from './[[path]]';

export async function handleProjects({ request, db, userId, url }) {
    const method = request.method;

    if (method === 'GET') {
        const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
        return sendJSON((results || []).map(r => ({
            id: r.id,
            label: r.label || "Sem Nome",
            data: JSON.parse(r.data || "{}"),
            created_at: r.created_at
        })));
    }

    if (['POST', 'PUT'].includes(method)) {
        const p = await request.json();
        const id = String(p.id || crypto.randomUUID());
        const label = String(p.label || p.entradas?.nomeProjeto || "Novo Orçamento");
        const dataStr = JSON.stringify({
            entradas: p.entradas || p.data?.entradas || {},
            resultados: p.resultados || p.data?.resultados || {},
            status: p.status || p.data?.status || 'rascunho'
        });

        await db.prepare("INSERT INTO projects (id, user_id, label, data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
            .bind(id, userId, label, dataStr).run();
        return sendJSON({ id, label });
    }

    if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        if (id) {
            await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
        } else {
            await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
        }
        return sendJSON({ success: true });
    }
}