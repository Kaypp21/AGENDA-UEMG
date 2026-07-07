/**
 * Validação de data visando impedir prazos no passado.
 * Permite datas iguais ao dia de hoje.
 */
export const parseEnvFile = (conteudo) => {
    const variaveis = {};

    conteudo.split(/\r?\n/).forEach(linha => {
        const texto = linha.trim();
        if (!texto || texto.startsWith('#')) return;

        const separador = texto.indexOf('=');
        if (separador === -1) return;

        const chave = texto.slice(0, separador).trim();
        let valor = texto.slice(separador + 1).trim();

        if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
            valor = valor.slice(1, -1);
        }

        variaveis[chave] = valor;
    });

    return variaveis;
};

export const resolverDadosUsuario = (metadata = {}, perfil = null) => {
    const role = metadata?.role || metadata?.role_name || perfil?.role || 'student';
    const period = metadata?.period ?? perfil?.period ?? 1;
    const name = metadata?.name || perfil?.name || '';

    return {
        role,
        period: Number(period) || 1,
        name
    };
};

export const validarDataEntrega = (dataString) => {
    if (!dataString) return false;
    
    const dataPrazo = new Date(dataString);
    const hoje = new Date();
    
    // Zera as horas para comparar apenas o dia civil
    hoje.setHours(0, 0, 0, 0);
    dataPrazo.setHours(0, 0, 0, 0);
    
    return dataPrazo >= hoje;
};

/**
 * Validação de e-mail institucional da UEMG.
 */
export const validarEmailInstitucional = (email, role) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailLimpo = email.trim().toLowerCase();
    
    // Validação básica de formato de email
    if (!emailLimpo.includes('@') || emailLimpo.startsWith('@') || emailLimpo.endsWith('@')) {
        return false;
    }
    
    if (role === 'student' || role === 'representative' || role === 'aluno') {
        return emailLimpo.endsWith('@discente.uemg.br');
    } else if (role === 'professor') {
        return emailLimpo.endsWith('@uemg.br') && !emailLimpo.endsWith('@discente.uemg.br');
    }
    return false;
};

/**
 * Factory que prepara o objeto para o Banco de Dados (Supabase).
 * Converte os campos para os nomes exatos das colunas do seu SQL.
 */
export const criarObjetoPrazo = (titulo, descricao, data, tipo, periodo, disciplina) => {
    // 1. Validações de obrigatoriedade
    if (!titulo || titulo.trim() === '') {
        throw new Error("O título é obrigatório");
    }
    if (!disciplina || disciplina.trim() === '') {
        throw new Error("A disciplina é obrigatória");
    }
    if (!data) {
        throw new Error("A data de entrega é obrigatória");
    }

    if (!tipo || tipo.trim() === '') {
        throw new Error("O tipo de evento é obrigatório");
    }

    // 2. Validação de Regra de Negócio (Data)
    if (!validarDataEntrega(data)) {
        throw new Error("data de entrega não pode estar no passado");
    }

    // 3. Retorno mapeado para o schema do Supabase enviado
    return {
        title: titulo.trim(),
        disciplina: disciplina.trim(),
        description: descricao ? descricao.trim() : '',
        event_date: data,
        tipo_evento: tipo.trim(),
        is_public: false
    };
};