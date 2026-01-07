import { createClerkClient } from '@clerk/backend';
import { sendJSON, initSchema, corsHeaders } from './_utils';
import { handleFilaments } from './_filaments';
import { handlePrinters } from './_printers';
import { handleSettings } from './_settings';
import { handleProjects, handleApproveBudget } from './_projects';
import { handleUsers } from './_users';

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const method = request.method;

    // Resposta rápida para Preflight (CORS)
    if (method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 1. Autenticação Clerk
        const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
        const authRequest = await clerk.authenticateRequest(request);
        
        if (!authRequest.isSignedIn) {
            return sendJSON({ error: "Sessão inválida" }, 401);
        }

        const { userId } = authRequest.toAuth();
        const db = env.DB;

        // 2. Garantir que as tabelas existam
        await initSchema(db);

        // 3. Parsing da Rota
        const pathArray = params.path || [];
        const entity = pathArray[0]; 
        const idFromPath = pathArray[1];

        // 4. Roteamento
        switch (entity) {
            case 'filaments':
            case 'filamentos':
                return await handleFilaments(method, url, idFromPath, db, userId, request);
            
            case 'printers':
            case 'impressoras':
                return await handlePrinters(method, url, idFromPath, db, userId, request);

            case 'settings':
                return await handleSettings(method, db, userId, request);

            case 'projects':
                return await handleProjects(method, url, idFromPath, db, userId, request);

            case 'approve-budget':
                return await handleApproveBudget(db, userId, request);

            case 'users':
                return await handleUsers(method, idFromPath, db, userId);
            
            default:
                return sendJSON({ error: "Rota não encontrada" }, 404);
        }
    } catch (err) {
        console.error("Worker Error:", err.message);
        return sendJSON({ error: "Erro Interno no Servidor", details: err.message }, 500);
    }
}