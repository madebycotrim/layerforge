import { sendJSON } from './[[path]]';

export async function handleUsers({ request, db, userId, pathArray }) {
    const method = request.method;

    if (method === 'GET') {
        const action = pathArray[2]; // /users/[id]/backup
        if (action === 'backup') {
            try {
                const results = await db.batch([
                    db.prepare("SELECT id, nome, material, cor_hex, peso_atual FROM filaments WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, nome, modelo FROM printers WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, label, data, created_at FROM projects WHERE user_id = ?").bind(userId)
                ]);

                return sendJSON({
                    success: true,
                    metadata: {
                        operator_id: userId,
                        generated_at: new Date().toISOString(),
                        status: "MANIFESTO_GERADO"
                    },
                    data: {
                        filaments: results[0].results || [],
                        printers: results[1].results || [],
                        settings: results[2].results[0] || {},
                        projects: (results[3].results || []).map(p => ({
                            ...p,
                            data: JSON.parse(p.data || "{}")
                        }))
                    }
                });
            } catch (err) {
                return sendJSON({ error: "Falha na extração do Manifesto", details: err.message }, 500);
            }
        }
        return sendJSON({ error: "Ação não identificada" }, 404);
    }

    if (method === 'DELETE') {
        try {
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);
            return sendJSON({ success: true, protocol: "EXPURGO_COMPLETE" });
        } catch (dbErr) {
            return sendJSON({ error: "Falha crítica no protocolo de exclusão", details: dbErr.message }, 500);
        }
    }

    return sendJSON({ error: "Método não autorizado" }, 405);
}