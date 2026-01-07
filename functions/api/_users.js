import { sendJSON } from './[[path]]';

export async function handleUsers({ request, db, userId, pathArray }) {
    const method = request.method;

    if (method === 'GET' && pathArray[2] === 'backup') {
        try {
            const results = await db.batch([
                db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(userId)
            ]);

            return sendJSON({
                success: true,
                metadata: { operator_id: userId, generated_at: new Date().toISOString() },
                data: {
                    filaments: results[0].results || [],
                    printers: results[1].results || [],
                    settings: results[2].results[0] || {},
                    projects: (results[3].results || []).map(p => ({ ...p, data: JSON.parse(p.data || "{}") }))
                }
            });
        } catch (err) {
            return sendJSON({ error: "Falha no Backup", details: err.message }, 500);
        }
    }

    if (method === 'DELETE') {
        await db.batch([
            db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
        ]);
        return sendJSON({ success: true, message: "Dados excluídos com sucesso." });
    }

    return sendJSON({ error: "Ação não permitida" }, 405);
}