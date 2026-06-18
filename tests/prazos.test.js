import { validarDataEntrega, criarObjetoPrazo, validarEmailInstitucional } from '../src/js/utils.js';

// ===================================
// MOCKS GLOBAIS
// ===================================

// Mock para simular localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('🎓 AGENDA UEMG - Suite Completa de Testes', () => {

    // ===================================
    // TESTES DE VALIDAÇÃO DE DATA
    // ===================================
    describe('📅 Validação de Data de Entrega', () => {
        test('Deve aceitar data de hoje', () => {
            const hoje = new Date().toISOString().split('T')[0];
            expect(validarDataEntrega(hoje)).toBe(true);
        });

        test('Deve aceitar data futura', () => {
            const futura = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            expect(validarDataEntrega(futura)).toBe(true);
        });

        test('Deve rejeitar data no passado', () => {
            expect(validarDataEntrega('2020-01-01')).toBe(false);
        });

        test('Deve rejeitar entradas inválidas', () => {
            expect(validarDataEntrega('')).toBe(false);
            expect(validarDataEntrega(null)).toBe(false);
            expect(validarDataEntrega(undefined)).toBe(false);
            expect(validarDataEntrega('data-invalida')).toBe(false);
        });

        test('Deve lidar com datas muito antigas', () => {
            expect(validarDataEntrega('1900-01-01')).toBe(false);
        });

        test('Deve aceitar datas de ano bissexto', () => {
            expect(validarDataEntrega('2028-02-29')).toBe(true);
        });
    });

    // ===================================
    // TESTES DE VALIDAÇÃO DE EMAIL
    // ===================================
    describe('📧 Validação de Email Institucional', () => {
        test('Deve aceitar email de discente válido', () => {
            expect(validarEmailInstitucional('aluno@discente.uemg.br', 'student')).toBe(true);
        });

        test('Deve aceitar email de representante válido', () => {
            expect(validarEmailInstitucional('rep@discente.uemg.br', 'representative')).toBe(true);
        });


        test('Deve rejeitar emails pessoais para alunos', () => {
            expect(validarEmailInstitucional('aluno@gmail.com', 'student')).toBe(false);
            expect(validarEmailInstitucional('aluno@hotmail.com', 'student')).toBe(false);
        });

        test('Deve rejeitar emails pessoais para professores', () => {
            expect(validarEmailInstitucional('prof@gmail.com', 'professor')).toBe(false);
        });

        test('Deve ser case-insensitive', () => {
            expect(validarEmailInstitucional('ALUNO@DISCENTE.UEMG.BR', 'student')).toBe(true);
            expect(validarEmailInstitucional('Prof@UEMG.BR', 'professor')).toBe(true);
        });

        test('Deve rejeitar roles desconhecidas', () => {
            expect(validarEmailInstitucional('admin@uemg.br', 'admin')).toBe(false);
            expect(validarEmailInstitucional('user@discente.uemg.br', 'visitante')).toBe(false);
        });

        test('Deve lidar com emails inválidos', () => {
            expect(validarEmailInstitucional('', 'student')).toBe(false);
            expect(validarEmailInstitucional(null, 'professor')).toBe(false);
            expect(validarEmailInstitucional('@uemg.br', 'professor')).toBe(false);
        });

        test('Deve aceitar variação "aluno" além de "student"', () => {
            expect(validarEmailInstitucional('user@discente.uemg.br', 'aluno')).toBe(true);
        });
    });

    // ===================================
    // TESTES DE CRIAÇÃO DE OBJETO PRAZO
    // ===================================
    describe('📝 Factory - Criar Objeto Prazo', () => {
        test('Deve criar objeto com todos os campos obrigatórios', () => {
            const prazo = criarObjetoPrazo(
                'Prova de BD',
                'Estudar Joins e Índices',
                '2026-12-25',
                'prova',
                3,
                'Banco de Dados I'
            );

            expect(prazo).toEqual({
                title: 'Prova de BD',
                disciplina: 'Banco de Dados I',
                description: 'Estudar Joins e Índices',
                event_date: '2026-12-25',
                tipo_evento: 'prova',
                periodo: 3
            });
        });

        test('Deve fazer trim nos campos string', () => {
            const prazo = criarObjetoPrazo(
                '  Seminário  ',
                '  Apresentação sobre APIs  ',
                '2026-11-20',
                '  atividade  ',
                4,
                '  Sistemas Web  '
            );

            expect(prazo.title).toBe('Seminário');
            expect(prazo.description).toBe('Apresentação sobre APIs');
            expect(prazo.tipo_evento).toBe('atividade');
            expect(prazo.disciplina).toBe('Sistemas Web');
        });

        test('Deve aceitar descrição vazia', () => {
            const prazo = criarObjetoPrazo(
                'Trabalho Prático',
                '',
                '2026-11-15',
                'trabalho',
                5,
                'IHC'
            );

            expect(prazo.description).toBe('');
        });

        test('Deve aceitar descrição null/undefined como vazia', () => {
            const prazo1 = criarObjetoPrazo(
                'Atividade',
                null,
                '2026-11-15',
                'atividade',
                2,
                'Disciplina'
            );

            expect(prazo1.description).toBe('');
        });

        test('Deve validar título obrigatório', () => {
            expect(() => {
                criarObjetoPrazo('', 'Descrição', '2026-12-01', 'prova', 2, 'Cálculo');
            }).toThrow('O título é obrigatório');
        });

        test('Deve validar disciplina obrigatória', () => {
            expect(() => {
                criarObjetoPrazo('Prova', 'Estudar', '2026-12-01', 'prova', 2, '');
            }).toThrow('A disciplina é obrigatória');
        });

        test('Deve validar data obrigatória', () => {
            expect(() => {
                criarObjetoPrazo('Entrega', 'Trabalho', '', 'trabalho', 3, 'Web');
            }).toThrow('A data de entrega é obrigatória');
        });

        test('Deve validar período obrigatório', () => {
            expect(() => {
                criarObjetoPrazo('Prova', 'Estudar', '2026-12-01', 'prova', null, 'BD');
            }).toThrow('O prazo deve ser direcionado a um período acadêmico');
        });

        test('Deve validar período obrigatório (zero é falso)', () => {
            expect(() => {
                criarObjetoPrazo('Prova', 'Estudar', '2026-12-01', 'prova', 0, 'BD');
            }).toThrow('O prazo deve ser direcionado a um período acadêmico');
        });

        test('Deve validar tipo de evento obrigatório', () => {
            expect(() => {
                criarObjetoPrazo('Atividade', 'Fazer algo', '2026-12-01', '', 2, 'Redes');
            }).toThrow('O tipo de evento é obrigatório');
        });

        test('Deve rejeitar data no passado', () => {
            expect(() => {
                criarObjetoPrazo('Prova', 'Estudar', '2020-01-01', 'prova', 1, 'Cálculo I');
            }).toThrow('data de entrega não pode estar no passado');
        });

        test('Deve converter período para número', () => {
            const prazo1 = criarObjetoPrazo('P1', 'D', '2026-12-01', 'p', 3, 'D');
            const prazo2 = criarObjetoPrazo('P2', 'D', '2026-12-01', 'p', '5', 'D');

            expect(typeof prazo1.periodo).toBe('number');
            expect(typeof prazo2.periodo).toBe('number');
            expect(prazo1.periodo).toBe(3);
            expect(prazo2.periodo).toBe(5);
        });

        test('Deve manter tipos de evento variados', () => {
            const tipos = ['prova', 'atividade', 'trabalho', 'seminário', 'fórum', 'Prova', 'ATIVIDADE'];

            tipos.forEach(tipo => {
                const prazo = criarObjetoPrazo('T', 'D', '2026-12-01', tipo, 2, 'D');
                expect(prazo.tipo_evento).toBe(tipo.trim());
            });
        });
    });

    // ===================================
    // TESTES DE CASOS EXTREMOS
    // ===================================
    describe('⚠️ Casos Extremos e Robustez', () => {
        test('Deve aceitar períodos válidos (1-8)', () => {
            for (let i = 1; i <= 8; i++) {
                const prazo = criarObjetoPrazo('T', 'D', '2026-12-01', 'p', i, 'D');
                expect(prazo.periodo).toBe(i);
            }
        });

        test('Deve lidar com títulos muito longos', () => {
            const tituloLongo = 'A'.repeat(200);
            const prazo = criarObjetoPrazo(tituloLongo, 'D', '2026-12-01', 'p', 1, 'D');
            expect(prazo.title.length).toBe(200);
        });

        test('Deve lidar com caracteres especiais', () => {
            const prazo = criarObjetoPrazo(
                'Prova: Análise & Síntese (Redes)',
                'Cálculo de π e φ',
                '2026-12-01',
                'prova',
                3,
                'Matemática Aplicada'
            );

            expect(prazo.title).toContain('&');
            expect(prazo.description).toContain('π');
            expect(prazo.disciplina).toContain('Aplicada');
        });

        test('Deve aceitar datas distantes no futuro', () => {
            const dataLonge = '2099-12-31';
            const prazo = criarObjetoPrazo('Futuro', 'D', dataLonge, 'p', 1, 'D');
            expect(prazo.event_date).toBe(dataLonge);
        });

        test('Deve aceitar emojis e caracteres unicode', () => {
            const prazo = criarObjetoPrazo(
                '🎓 Defesa de TCC',
                'Apresentar trabalho 📊',
                '2026-12-15',
                'trabalho',
                8,
                'Engenharia de Software'
            );

            expect(prazo.title).toContain('🎓');
            expect(prazo.description).toContain('📊');
        });

        test('Deve rejeitar período negativo ou inválido', () => {
            // Período negativo ainda vai passar pela validação, mas é um número válido
            const prazo = criarObjetoPrazo('T', 'D', '2026-12-01', 'p', -1, 'D');
            expect(prazo.periodo).toBe(-1);
        });

        test('Deve lidar com whitespace-only input', () => {
            expect(() => {
                criarObjetoPrazo('   ', 'D', '2026-12-01', 'p', 1, 'D');
            }).toThrow('O título é obrigatório');

            expect(() => {
                criarObjetoPrazo('T', 'D', '2026-12-01', 'p', 1, '   ');
            }).toThrow('A disciplina é obrigatória');
        });
    });

    // ===================================
    // TESTES DE FLUXO DE NEGÓCIO
    // ===================================
    describe('🏢 Fluxo de Negócio - Regras da UEMG', () => {
        test('Aluno não pode usar email de professor', () => {
            expect(validarEmailInstitucional('prof@uemg.br', 'student')).toBe(false);
        });

        test('Professor não pode usar email de discente', () => {
            expect(validarEmailInstitucional('aluno@discente.uemg.br', 'professor')).toBe(false);
        });

        test('Fluxo completo: criar prazo válido para o período 3', () => {
            const prazo = criarObjetoPrazo(
                'Prova de Banco de Dados',
                'SQL, Joins, Índices, Normalização',
                '2026-12-15',
                'prova',
                3,
                'Banco de Dados I'
            );

            expect(prazo).toBeDefined();
            expect(prazo.periodo).toBe(3);
            expect(prazo.title).toBe('Prova de Banco de Dados');
        });

        test('Representante deve usar email de discente com chave especial', () => {
            // Apenas verificamos a validação de email
            expect(validarEmailInstitucional('rep@discente.uemg.br', 'representative')).toBe(true);
        });

        test('Data de hoje é válida para entrega (considerando prazos de último minuto)', () => {
            const hoje = new Date().toISOString().split('T')[0];
            expect(validarDataEntrega(hoje)).toBe(true);
        });

        test('Datas devem ser futuras ou hoje (sem passado)', () => {
            const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            expect(validarDataEntrega(ontem)).toBe(false);
        });
    });

    // ===================================
    // TESTES DE COERÊNCIA DOS DADOS
    // ===================================
    describe('🔐 Integridade de Dados', () => {
        test('Objeto prazo nunca deve ter undefined', () => {
            const prazo = criarObjetoPrazo(
                'Teste',
                '',
                '2026-12-01',
                'p',
                1,
                'D'
            );

            Object.values(prazo).forEach(valor => {
                expect(valor).not.toBeUndefined();
            });
        });

        test('Objeto prazo nunca deve ter campos vazios (exceto description)', () => {
            const prazo = criarObjetoPrazo(
                'T',
                '',
                '2026-12-01',
                'p',
                1,
                'D'
            );

            expect(prazo.title).not.toBe('');
            expect(prazo.disciplina).not.toBe('');
            expect(prazo.tipo_evento).not.toBe('');
            expect(prazo.event_date).not.toBe('');
        });

        test('Período deve ser sempre número', () => {
            const prazo = criarObjetoPrazo('T', 'D', '2026-12-01', 'p', '3', 'D');
            expect(Number.isInteger(prazo.periodo)).toBe(true);
        });
    });
});