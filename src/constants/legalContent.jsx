import React from "react";
import { ShieldCheck, Lock, EyeOff, Database, Cpu, AlertTriangle } from "lucide-react";

export const TERMS_CONTENT = (
    <div className="space-y-6">
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-sky-500" />
                1. O que é o PrintLog
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog é um sistema de gestão feito para makers e donos de 
                farms de impressão 3D que precisam organizar custos, processos e o histórico
                de produção. Nossas ferramentas servem para te ajudar a entender seus gastos e 
                planejar melhor sua rotina de impressão.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Todos os cálculos (preço de peça, tempo de máquina, etc.) dependem dos dados
                que você insere, como valor do filamento, gasto de energia e manutenção. 
                A decisão final sobre quanto cobrar e como gerenciar seu lucro é sempre sua.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-sky-500" />
                2. Melhorias e Evolução
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog está sempre recebendo atualizações. Podemos ajustar ou criar 
                novas funções para deixar o sistema mais rápido e útil para a sua produção. 
                Trabalhamos para manter tudo rodando 24h, mas como qualquer software, o sistema 
                pode passar por manutenções rápidas.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">
                3. Nossa Criação
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Todo o visual, a lógica de cálculo e o jeito que o sistema funciona foram 
                desenvolvidos por nós. Pedimos que não tente copiar, modificar ou revender 
                partes da plataforma. O PrintLog foi feito com muito esforço para a comunidade maker.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-sky-500" />
                4. Uso Correto do Sistema
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Ao usar o PrintLog, você concorda em não usar robôs ou scripts que possam 
                sobrecarregar nossos servidores. O uso deve ser manual e focado na gestão 
                da sua farm.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Se notarmos um comportamento que coloque o sistema em risco, poderemos 
                suspender o acesso temporariamente para proteger os dados dos outros usuários.
            </p>
        </section>
    </div>
);

export const PRIVACY_CONTENT = (
    <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <ShieldCheck className="text-emerald-500" size={24} />
            <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                    Segurança levada a sério
                </p>
                <p className="text-xs text-zinc-500">
                    Sua farm, seus dados e sua privacidade em primeiro lugar.
                </p>
            </div>
        </div>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} className="text-sky-500" />
                1. O que guardamos e como protegemos
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Guardamos apenas o essencial: seus dados de acesso, as configurações da sua 
                máquina e seu histórico de peças. Não pedimos informações que não tenham 
                nada a ver com impressão 3D.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Seus dados financeiros, custos de filamento e margens de lucro são protegidos 
                com tecnologia de ponta (criptografia AES-256) antes mesmo de entrarem 
                no nosso banco de dados.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <EyeOff size={14} className="text-sky-500" />
                2. Seus dados são só seus
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog não vende e não repassa seus dados para ninguém. Suas informações 
                de custo, pedidos e clientes não são compartilhadas com fornecedores, 
                marcas de filamento ou anunciantes.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">
                3. Conversas e E-mails
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Usamos seu e-mail apenas para o básico: alertas de estoque, avisos da farm 
                ou recuperação de senha. Não enviamos spam ou propagandas indesejadas.
            </p>
        </section>
    </div>
);