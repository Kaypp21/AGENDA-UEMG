// ✅ O jeito correto para rodar direto no navegador via CDN:
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { parseEnvFile } from './utils.js';

const fallbackUrl = 'https://expdgbgibiqjggbszkbc.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cGRnYmdpYmlxamdnYnN6a2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjAwOTgsImV4cCI6MjA5MDUzNjA5OH0.YK9D-3fBxw5eKpshrunLPowhT2yVQA3-165souAVUZA';

const lerVariavelDeAmbiente = () => {
    if (typeof window !== 'undefined' && window.__ENV__) {
        return window.__ENV__;
    }

    if (typeof document !== 'undefined') {
        const script = document.currentScript;
        if (script?.dataset?.env) {
            return parseEnvFile(script.dataset.env);
        }
    }

    return {};
};

const envConfig = lerVariavelDeAmbiente();
const supabaseUrl = envConfig.SUPABASE_URL || fallbackUrl;
const supabaseKey = envConfig.SUPABASE_ANON_KEY || fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ===================================
// AUTH METHODS
// ===================================

export const cadastrarUsuario = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: metadata // Passa o objeto com name, period e secret_key para o seu SQL Trigger
        }
    });

    if (error) throw new Error(error.message);
    return data;
};

export const logarUsuario = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) throw new Error(error.message);
    return data;
};

export const deslogarUsuario = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
};

export const getSessaoAtual = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
};

export const buscarPerfilUsuario = async (userId) => {
    if (!userId) return null;

    const { data, error } = await supabase
        .from('users')
        .select('role, period, name')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
};

// ===================================
// DISCIPLINAS (Grade Curricular UEMG)
// ===================================

export const buscarDisciplinasPorPeriodo = async (periodo) => {
    const { data, error } = await supabase
        .from('disciplines')
        .select('name')
        .eq('period', periodo)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

// ===================================
// STORAGE (Upload de Arquivos)
// ===================================

export const uploadArquivo = async (file) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        
        // Faz o upload para o bucket 'anexos' (Certifique-se que ele é PÚBLICO no painel)
        const { data, error } = await supabase.storage
            .from('anexos')
            .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('anexos')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        throw new Error('Erro ao subir arquivo: ' + error.message);
    }
};

// ===================================
// CRUD (Tabela EVENTS conforme seu SQL)
// ===================================

export const criarPayloadsPrazo = (prazo) => {
    const payloadBase = { ...prazo };
    delete payloadBase.discipline_name;
    delete payloadBase.discipline;
    delete payloadBase.disciplineName;
    delete payloadBase.disciplins;

    return [payloadBase];
};

export const persistirPrazo = async (prazo) => {
    const payloads = criarPayloadsPrazo(prazo);
    let ultimoErro = null;

    for (const payload of payloads) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([payload])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            ultimoErro = error;
            const mensagem = error?.message || '';
            if (!mensagem.includes('column') && !mensagem.includes('Could not find')) {
                break;
            }
        }
    }

    throw new Error(ultimoErro?.message || 'Erro ao salvar prazo');
};

export const buscarPrazos = async (periodoUsuario = null, usuarioId = null) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) throw new Error(error.message);

        const periodoAtual = Number(periodoUsuario);
        const hasPeriodoValido = !Number.isNaN(periodoAtual);
        const resultados = [];

        for (const prazo of data || []) {
            const isPublic = prazo.is_public === true || prazo.is_public === 'true' || prazo.is_public === 1 || prazo.is_public === 'TRUE';
            const isOwner = usuarioId != null && prazo.user_id === usuarioId;

            if (isOwner) {
                resultados.push(prazo);
                continue;
            }

            if (!isPublic) {
                continue;
            }

            if (!hasPeriodoValido) {
                resultados.push(prazo);
                continue;
            }

            const periodoEvento = Number(prazo.period);
            if (!Number.isNaN(periodoEvento) && periodoEvento === periodoAtual) {
                resultados.push(prazo);
                continue;
            }

            const perfilAutor = await buscarPerfilUsuario(prazo.user_id);
            const periodoAutor = Number(perfilAutor?.period);
            if (!Number.isNaN(periodoAutor) && periodoAutor === periodoAtual) {
                resultados.push(prazo);
            }
        }

        return resultados;
    } catch (e) {
        throw e;
    }
};

export const atualizarPrazo = async (id, prazo) => {
    const payloads = criarPayloadsPrazo(prazo);
    let ultimoErro = null;

    for (const payload of payloads) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(payload)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            ultimoErro = error;
            const mensagem = error?.message || '';
            if (!mensagem.includes('column') && !mensagem.includes('Could not find')) {
                break;
            }
        }
    }

    throw new Error(ultimoErro?.message || 'Erro ao atualizar prazo');
};

export const excluirPrazo = async (id) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
};