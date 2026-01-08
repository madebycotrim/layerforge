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
            // 1. PROTOCOLO DE EXPURGO NO BANCO DE DADOS
            // Deletamos tudo relacionado ao usuário primeiro
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);

            // 2. EXCLUSÃO DA CONTA NO CLERK (AUTENTICAÇÃO)
            // Você precisa da sua CLERK_SECRET_KEY configurada no seu ambiente (env)
            const clerkSecretKey = env.CLERK_SECRET_KEY;

            if (!clerkSecretKey) {
                throw new Error("Chave de segurança do sistema não configurada");
            }

            const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${clerkSecretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!clerkResponse.ok) {
                const errorData = await clerkResponse.json();
                throw new Error(errorData.errors?.[0]?.message || "Falha ao remover conta do provedor de autenticação");
            }

            // 3. RETORNO DE SUCESSO
            return sendJSON({
                success: true,
                protocol: "EXPURGO_TOTAL_COMPLETE",
                message: "Dados e conta removidos permanentemente."
            });

        } catch (err) {
            console.error("ERRO CRÍTICO NO EXPURGO:", err);
            return sendJSON({
                error: "Falha crítica no protocolo de exclusão",
                details: err.message
            }, 500);
        }
    }

    return sendJSON({ error: "Método não autorizado" }, 405);
}