import { sendJSON, toNum } from './[[path]]';

export async function handleApprove({ request, db, userId }) {
    if (request.method !== 'POST') return sendJSON({ error: "Método não permitido" }, 405);

    const p = await request.json();
    const projectId = String(p.projectId || "");
    const printerId = String(p.printerId || "");

    if (!projectId) return sendJSON({ error: "ID do projeto obrigatório" }, 400);

    const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
    if (!project) return sendJSON({ error: "Projeto não encontrado" }, 404);

    let pData = JSON.parse(project.data || "{}");
    pData.status = "aprovado";

    const batch = [
        db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?").bind(JSON.stringify(pData), projectId, userId)
    ];

    if (printerId) {
        batch.push(db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?")
            .bind(toNum(p.totalTime), printerId, userId));
    }

    if (Array.isArray(p.filaments)) {
        p.filaments.forEach(f => {
            if (f.id && f.id !== 'manual') {
                batch.push(db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND user_id = ?")
                    .bind(toNum(f.peso || f.weight), String(f.id), userId));
            }
        });
    }

    await db.batch(batch);
    return sendJSON({ success: true });
}