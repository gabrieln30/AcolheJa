/* =========================================================================
   0. DARK MODE — SISTEMA COMPLETO
   Executa PRIMEIRO para evitar flash do tema errado (FOUC)
   ========================================================================= */

// 0.1 Aplica o tema salvo IMEDIATAMENTE (antes do DOM estar pronto)
(function() {
    const tema = localStorage.getItem('acolheja_tema') || 'light';
    document.documentElement.setAttribute('data-theme', tema);
})();

// 0.2 Gerenciador completo do Dark Mode
const DarkModeManager = {
    
    // Verificar tema atual
    getTema: function() {
        return localStorage.getItem('acolheja_tema') || 'light';
    },
    
    // Aplicar tema
    aplicar: function(tema) {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('acolheja_tema', tema);
        
        // Atualiza ícone do toggle se existir
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.title = tema === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
            toggle.setAttribute('aria-label', toggle.title);
        }
        
        console.log(`🌙 Tema aplicado: ${tema}`);
    },
    
    // Alternar tema
    alternar: function() {
        const atual = this.getTema();
        const novo  = atual === 'dark' ? 'light' : 'dark';
        this.aplicar(novo);
        
        // Pequena animação de feedback
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.style.transform = 'scale(0.85) rotate(360deg)';
            setTimeout(() => { toggle.style.transform = ''; }, 300);
        }
    },
    
    // Criar e injetar o botão toggle na navbar
    criarToggle: function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // Evita duplicatas
        if (navbar.querySelector('.dark-mode-toggle')) return;
        
        const btn = document.createElement('button');
        btn.className = 'dark-mode-toggle';
        btn.title = this.getTema() === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
        btn.setAttribute('aria-label', btn.title);
        btn.innerHTML = `
            <i class="fas fa-sun  toggle-icon icon-sun"></i>
            <i class="fas fa-moon toggle-icon icon-moon"></i>
        `;
        
        btn.addEventListener('click', () => this.alternar());
        
        // Insere antes do último elemento (login btn ou logout btn)
        const menuNav = navbar.querySelector('.menu-navegacao');
        if (menuNav) {
            menuNav.appendChild(btn);
        } else {
            navbar.appendChild(btn);
        }
    }
};

// 0.3 Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    DarkModeManager.criarToggle();
    DarkModeManager.aplicar(DarkModeManager.getTema());
});

/* =========================================================================
   1. FUNÇÕES GERAIS E COMPARTILHADAS (Executam em todas as páginas)
   ========================================================================= */

// 1.1 NAVBAR INTELIGENTE (EFEITO DE SCROLL)
const navbar = document.querySelector('.navbar');
const logo = document.querySelector('.logo1');

if (navbar && logo) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 5%';
            navbar.style.background = '#1a417a';
            logo.style.height = '60px';
        } else {
            navbar.style.padding = '1rem 5%';
            navbar.style.background = '#2b5da7';
            logo.style.height = '80px';
        }
    });
}

// 1.2 SISTEMA DE BUSCA ATIVO
const inputBusca = document.querySelector('.search-input');
if (inputBusca) {
    inputBusca.addEventListener('keyup', (e) => {
        const termo = e.target.value.toLowerCase();
        if (e.key === 'Enter') {
            alert('Você está buscando por: ' + termo);
            // Aqui pode entrar a lógica futura de redirecionamento
        }
    });
}

// 1.3 MENU MOBILE (BOTÃO HAMBÚRGUER)
function setupMenuMobile() {
    const menuNavegacao = document.querySelector('.menu-navegacao');
    const navPrincipal = document.querySelector('.navbar');
    
    if (menuNavegacao && navPrincipal && !document.querySelector('.menu-toggle')) {
        const btnMenu = document.createElement('i');
        btnMenu.className = 'fas fa-bars menu-toggle';
        // Estilos iniciais dinâmicos. O display none será sobrescrito pelo CSS no mobile se necessário
        btnMenu.style.display = 'none'; 
        btnMenu.style.color = 'white';
        btnMenu.style.fontSize = '1.5rem';
        btnMenu.style.cursor = 'pointer';
        
        navPrincipal.prepend(btnMenu);

        btnMenu.addEventListener('click', () => {
            menuNavegacao.classList.toggle('active');
            btnMenu.classList.toggle('fa-times');
        });
    }
}
setupMenuMobile();


/* =========================================================================
   1.4 SISTEMA DE GERENCIAMENTO DE COOKIES
   ========================================================================= */

// Funções para gerenciar cookies
const CookieManager = {
    // Definir um cookie
    set: function(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Lax";
        console.log(`🍪 Cookie definido: ${name}`);
    },

    // Obter um cookie
    get: function(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if(cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    },

    // Deletar um cookie
    delete: function(name) {
        this.set(name, "", -1);
        console.log(`🗑️ Cookie deletado: ${name}`);
    },

    // Listar todos os cookies
    getAll: function() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if(name) {
                cookies[name] = decodeURIComponent(value);
            }
        });
        return cookies;
    },

    // Limpar todos os cookies
    deleteAll: function() {
        const cookies = this.getAll();
        for(let name in cookies) {
            this.delete(name);
        }
        console.log('🗑️ Todos os cookies foram deletados');
    }
};

// 1.4.1 BANNER DE CONSENTIMENTO DE COOKIES
function criarBannerCookies() {
    // 1. VERIFICAÇÃO ADICIONADA: Checa no LocalStorage e nos Cookies
    if (localStorage.getItem('cookieConsent') || CookieManager.get('cookieConsent')) {
        console.log('✅ Consentimento já foi dado. O banner não será exibido.');
        return; // Para a função aqui e não cria o banner
    }

    // Cria o banner
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #2b5da7 0%, #1a417a 100%);
        color: white;
        padding: 1.5rem;
        z-index: 9999;
        box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        font-family: Arial, sans-serif;
    `;

    banner.innerHTML = `
        <div style="flex: 1; min-width: 250px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">🍪 Política de Cookies</h3>
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa política de cookies.
                <a href="politica-cookies.html" style="color: #32bcad; text-decoration: underline;">Saiba mais</a>
            </p>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button id="btnRejeitar" style="
                background: transparent;
                border: 2px solid white;
                color: white;
                padding: 0.6rem 1.2rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Rejeitar</button>
            <button id="btnConfigurar" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid white;
                color: white;
                padding: 0.6rem 1.2rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Configurar</button>
            <button id="btnAceitar" style="
                background: #32bcad;
                border: none;
                color: white;
                padding: 0.6rem 1.2rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Aceitar Tudo</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Eventos dos botões
    document.getElementById('btnAceitar').addEventListener('click', function() {
        CookieManager.set('cookieConsent', 'accepted', 365);
        // 2. SALVA NO LOCAL STORAGE
        localStorage.setItem('cookieConsent', 'accepted'); 
        
        banner.style.display = 'none';
        console.log('✅ Todos os cookies foram aceitos');
    });

    document.getElementById('btnRejeitar').addEventListener('click', function() {
        CookieManager.set('cookieConsent', 'rejected', 365);
        // 2. SALVA NO LOCAL STORAGE
        localStorage.setItem('cookieConsent', 'rejected');
        
        banner.style.display = 'none';
        console.log('❌ Cookies não essenciais foram rejeitados');
    });

    document.getElementById('btnConfigurar').addEventListener('click', function() {
        // Abre modal de configuração
        abrirModalConfiguracaoCookies();
        banner.style.display = 'none';
    });

    // Hover nos botões
    const botoes = banner.querySelectorAll('button');
    botoes.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
            this.style.transform = 'translateY(0)';
        });
    });
}

// 1.4.2 MODAL DE CONFIGURAÇÃO DE COOKIES
function abrirModalConfiguracaoCookies() {
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('cookieModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'cookieModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 1rem;
        font-family: Arial, sans-serif;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: #2b5da7;">⚙️ Preferências de Cookies</h2>
                <button id="btnFecharModal" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>

            <div style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
                <h3 style="margin: 0 0 1rem 0; color: #2b5da7;">Tipos de Cookies</h3>
                
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f5f7fa; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="checkbox" id="cookieEssential" checked disabled style="width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <h4 style="margin: 0; color: #2b5da7;">Cookies Essenciais ✓</h4>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                                Necessários para o funcionamento do site (obrigatório)
                            </p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f5f7fa; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="checkbox" id="cookieAnalytics" style="width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <h4 style="margin: 0; color: #2b5da7;">Cookies de Análise</h4>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                                Ajudam-nos a entender como você usa o site
                            </p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 0; padding: 1rem; background: #f5f7fa; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="checkbox" id="cookieAdvertising" style="width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <h4 style="margin: 0; color: #2b5da7;">Cookies de Publicidade</h4>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                                Usados para exibir anúncios relevantes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="btnSalvarPrefs" style="
                    background: #32bcad;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                ">Salvar Preferências</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Carregar preferências atuais
    document.getElementById('cookieAnalytics').checked = CookieManager.get('cookieAnalytics') === 'true';
    document.getElementById('cookieAdvertising').checked = CookieManager.get('cookieAdvertising') === 'true';

    // Fechar modal
    document.getElementById('btnFecharModal').addEventListener('click', function() {
        modal.remove();
    });

    // Salvar preferências
    document.getElementById('btnSalvarPrefs').addEventListener('click', function() {
        CookieManager.set('cookieConsent', 'customized', 365);
        // 3. SALVA A ESCOLHA PERSONALIZADA NO LOCAL STORAGE
        localStorage.setItem('cookieConsent', 'customized');

        alert('✅ Suas preferências de cookies foram salvas!');
        modal.remove();
    });

    // Hover no botão
    document.getElementById('btnSalvarPrefs').addEventListener('mouseenter', function() {
        this.style.opacity = '0.9';
        this.style.transform = 'translateY(-2px)';
    });
    document.getElementById('btnSalvarPrefs').addEventListener('mouseleave', function() {
        this.style.opacity = '1';
        this.style.transform = 'translateY(0)';
    });
}

// 1.4.3 INICIALIZAR COOKIES QUANDO PÁGINA CARREGAR
document.addEventListener('DOMContentLoaded', function() {
    criarBannerCookies();
    
    // Armazenar dados de navegação
    CookieManager.set('ultimaPaginaVisitada', window.location.pathname, 30);
    CookieManager.set('horaUltimaVisita', new Date().toLocaleString('pt-BR'), 30);
    
    console.log('🍪 Sistema de cookies inicializado');
});


/* =========================================================================
   2. SCRIPTS ESPECÍFICOS: HOME PAGE
   ========================================================================= */

// 2.1 CARROSSEL
const carrosselImg = document.querySelector('.carrossel-placeholder img');
const btnEsq = document.querySelector('.fa-chevron-left');
const btnDir = document.querySelector('.fa-chevron-right');

if (carrosselImg && btnEsq && btnDir) {
    const imagensCarrossel = [
        "imagens/abraco1.png",
        "imagens/imagem2.png",
        "imagens/imagem3.jpg"
    ];
    let index = 0;

    function atualizarCarrossel() {
        carrosselImg.style.opacity = '0';
        setTimeout(() => {
            carrosselImg.src = imagensCarrossel[index];
            carrosselImg.style.opacity = '1';
        }, 300);
    }

    btnDir.addEventListener('click', () => {
        index = (index + 1) % imagensCarrossel.length;
        atualizarCarrossel();
    });

    btnEsq.addEventListener('click', () => {
        index = (index - 1 + imagensCarrossel.length) % imagensCarrossel.length;
        atualizarCarrossel();
    });

    setInterval(() => {
        index = (index + 1) % imagensCarrossel.length;
        atualizarCarrossel();
    }, 4000);
}

// 2.2 ANIMAÇÕES DE ENTRADA DA HOME (SCROLL REVEAL)
const blocosParaAnimarHome = document.querySelectorAll('.hero-text, .hero-visual-grid');
if (blocosParaAnimarHome.length > 0) {
    const observarHome = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observarHome.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, { threshold: 0.1 });

    blocosParaAnimarHome.forEach(bloco => {
        bloco.style.opacity = '0';
        bloco.style.transform = 'translateY(30px)';
        bloco.style.transition = 'all 0.8s ease-out';
        observarHome.observe(bloco);
    });
}


/* =========================================================================
   3. SCRIPTS ESPECÍFICOS: PÁGINA DE LOGIN
   ========================================================================= */

// 3.1 LOGIN — tratado diretamente em login.html (sistema acolheja_usuarios)
// 3.2 LOGIN PARCEIROS — tratado diretamente em login.html
// (Blocos removidos para evitar conflito com o listener do HTML)

// 3.3 VERIFICAR SESSAO AO CARREGAR PAGINA
// Compativel com o novo sistema (acolheja_sessao) e o legado (usuarioLogado/empresaLogada)
function verificarSessao() {
    // Novo sistema: sessao gravada no login
    const sessaoNova = localStorage.getItem('acolheja_sessao');
    if (sessaoNova) {
        try {
            const dados = JSON.parse(sessaoNova);
            console.log('Usuario logado:', dados);
            return dados;
        } catch(e) {}
    }
    // Legado (compatibilidade com outros modulos do sistema)
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (usuarioLogado || empresaLogada) {
        const dados = usuarioLogado ? JSON.parse(usuarioLogado) : JSON.parse(empresaLogada);
        console.log('Usuario logado (legado):', dados);
        return dados;
    }
    return null;
}

// 3.4 FUNCAO DE LOGOUT
function fazerLogout() {
    localStorage.removeItem('acolheja_sessao');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('empresaLogada');
    window.location.href = 'index.html';
}

// 3.5 ADICIONAR BOTÃO DE LOGOUT NA NAVBAR (se usuário está logado)
// 3.5 ADICIONAR/OCULTAR BOTÕES NA NAVBAR (Login / Painel / Logout)
function atualizarNavbar() {
    const usuarioLogado = verificarSessao();
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        const menuNav = navbar.querySelector('.menu-navegacao');
        const btnLogin = menuNav.querySelector('.btn-login-nav'); // O botão de login original da home

        if (usuarioLogado) {
            // 1. Oculta o botão de Login padrão
            if (btnLogin) {
                btnLogin.style.display = 'none'; 
            }

            // 2. Adiciona o atalho direto para o "Meu Painel"
            if (!menuNav.querySelector('.link-painel-nav')) {
                const linkPainel = document.createElement('a');
                linkPainel.href = 'painel.html';
                linkPainel.className = 'link-painel-nav';
                linkPainel.style.cssText = `
                    color: #f3824a;
                    font-weight: 800;
                    margin-right: 10px;
                `;
                linkPainel.innerHTML = '<i class="fas fa-columns"></i> Meu Painel';
                
                // Insere antes da barra de pesquisa ou no final
                const searchBox = menuNav.querySelector('.search-box');
                if (searchBox) {
                    menuNav.insertBefore(linkPainel, searchBox);
                } else {
                    menuNav.appendChild(linkPainel);
                }
            }

            // 3. Adiciona o botão de Logout corretamente estilizado
            if (!menuNav.querySelector('.btn-logout')) {
                const btnLogout = document.createElement('button');
                btnLogout.className = 'btn-logout';
                btnLogout.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
                btnLogout.style.cssText = `
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                `;
                
                // Efeito hover
                btnLogout.addEventListener('mouseenter', () => btnLogout.style.background = '#c0392b');
                btnLogout.addEventListener('mouseleave', () => btnLogout.style.background = '#e74c3c');
                
                btnLogout.addEventListener('click', fazerLogout);
                menuNav.appendChild(btnLogout);
            }
        } else {
            // Se o usuário DESLOGAR, garantimos que o botão "Login" volte e o "Painel/Sair" suma
            if (btnLogin) {
                btnLogin.style.display = 'inline-block';
            }
            
            const linkPainel = menuNav.querySelector('.link-painel-nav');
            if (linkPainel) linkPainel.remove();

            const btnLogout = menuNav.querySelector('.btn-logout');
            if (btnLogout) btnLogout.remove();
        }
    }
}
atualizarNavbar();
atualizarNavbar();

/* =========================================================================
   3.6 SISTEMA DE HISTÓRICO DE ATIVIDADES
   ========================================================================= */

const HistoricoManager = {
    // Registrar uma atividade
    registrar: function(tipo, descricao) {
        try {
            let historico = JSON.parse(localStorage.getItem('historicoAtividades')) || [];
            
            const evento = {
                id: Date.now(),
                tipo: tipo,
                descricao: descricao,
                data: new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString()
            };
            
            historico.unshift(evento); // Adiciona no início
            
            // Manter apenas os últimos 100 eventos
            if (historico.length > 100) {
                historico = historico.slice(0, 100);
            }
            
            localStorage.setItem('historicoAtividades', JSON.stringify(historico));
            console.log(`📝 Evento registrado: ${tipo} - ${descricao}`);
        } catch (e) {
            console.error('Erro ao registrar histórico:', e);
        }
    },
    
    // Obter todo o histórico
    obter: function() {
        try {
            return JSON.parse(localStorage.getItem('historicoAtividades')) || [];
        } catch (e) {
            console.error('Erro ao obter histórico:', e);
            return [];
        }
    },
    
    // Deletar um evento
    deletar: function(id) {
        try {
            let historico = JSON.parse(localStorage.getItem('historicoAtividades')) || [];
            historico = historico.filter(evento => evento.id !== id);
            localStorage.setItem('historicoAtividades', JSON.stringify(historico));
            console.log(`🗑️ Evento deletado`);
        } catch (e) {
            console.error('Erro ao deletar evento:', e);
        }
    },
    
    // Limpar todo o histórico
    limpar: function() {
        try {
            localStorage.removeItem('historicoAtividades');
            console.log(`🧹 Histórico limpo`);
        } catch (e) {
            console.error('Erro ao limpar histórico:', e);
        }
    },
    
    // Contar eventos
    contar: function() {
        const historico = this.obter();
        return historico.length;
    }
};

// Registrar ao fazer login
window.addEventListener('load', function() {
    const usuario = verificarSessao();
    if (usuario) {
        const tipo = usuario.tipo === 'usuario' ? '👤 Usuário' : '🏢 Empresa';
        const identificacao = usuario.tipo === 'usuario' ? usuario.email : usuario.cnpj;
        HistoricoManager.registrar('LOGIN', `${tipo} logou: ${identificacao}`);
    }
});

// Registrar logout
const originalLogout = fazerLogout;
window.fazerLogout = function() {
    const usuario = verificarSessao();
    if (usuario) {
        const tipo = usuario.tipo === 'usuario' ? '👤 Usuário' : '🏢 Empresa';
        HistoricoManager.registrar('LOGOUT', `${tipo} deslogou`);
    }
    originalLogout();
};

// Registrar mudanças de página
window.addEventListener('beforeunload', function() {
    const usuario = verificarSessao();
    if (usuario) {
        const pagina = window.location.pathname.split('/').pop() || 'index.html';
        HistoricoManager.registrar('NAVEGAÇÃO', `Visitou página: ${pagina}`);
    }
});

// Função para abrir modal de histórico
function abrirHistorico() {
    const historico = HistoricoManager.obter();
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('historicoModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'historicoModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        font-family: Arial, sans-serif;
    `;
    
    let conteudoHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #2b5da7; padding-bottom: 1rem;">
                <h2 style="margin: 0; color: #2b5da7;">📊 Histórico de Atividades</h2>
                <button id="btnFecharHistorico" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 1rem; background: #e8f4f8; border-radius: 4px; border-left: 4px solid #3498db;">
                <p style="margin: 0; color: #2c3e50;">
                    <strong>Total de eventos:</strong> ${historico.length}
                </p>
            </div>
    `;
    
    if (historico.length === 0) {
        conteudoHTML += `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <p><i class="fas fa-inbox" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i></p>
                <p>Nenhuma atividade registrada ainda.</p>
            </div>
        `;
    } else {
        conteudoHTML += `<div style="margin-bottom: 1rem;">`;
        historico.forEach(evento => {
            const iconeTipo = evento.tipo === 'LOGIN' ? '🔓' : 
                            evento.tipo === 'LOGOUT' ? '🔐' : 
                            evento.tipo === 'NAVEGAÇÃO' ? '📍' : '📝';
            
            conteudoHTML += `
                <div class="historico-item" style="
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    background: #f5f7fa;
                    border-radius: 4px;
                    border-left: 4px solid #32bcad;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; color: #2b5da7; margin-bottom: 0.25rem;">
                            ${iconeTipo} ${evento.tipo}
                        </div>
                        <div style="color: #555; font-size: 0.95rem; margin-bottom: 0.25rem;">
                            ${evento.descricao}
                        </div>
                        <div style="color: #999; font-size: 0.85rem;">
                            ${evento.data}
                        </div>
                    </div>
                    <button class="btn-deletar-evento" data-id="${evento.id}" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 0.5rem 0.75rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.85rem;
                        margin-left: 1rem;
                    ">🗑️ Deletar</button>
                </div>
            `;
        });
        conteudoHTML += `</div>`;
    }
    
    conteudoHTML += `
        <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #eee;">
            <button id="btnLimparHistorico" style="
                background: #e67e22;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">🧹 Limpar Tudo</button>
            <button id="btnFecharHistoricoBtn" style="
                background: #95a5a6;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">Fechar</button>
        </div>
    `;
    
    modal.innerHTML = conteudoHTML;
    document.body.appendChild(modal);
    
    // Eventos dos botões
    document.getElementById('btnFecharHistorico').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnFecharHistoricoBtn').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnLimparHistorico').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            HistoricoManager.limpar();
            modal.remove();
            abrirHistorico(); // Reabrir modal vazio
            alert('✅ Histórico limpo com sucesso!');
        }
    });
    
    // Eventos para deletar itens individuais
    document.querySelectorAll('.btn-deletar-evento').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            HistoricoManager.deletar(id);
            this.parentElement.style.opacity = '0.5';
            this.disabled = true;
            setTimeout(() => {
                modal.remove();
                abrirHistorico();
            }, 300);
        });
    });
}

/* =========================================================================
   3.7 SISTEMA DE CONFIGURAÇÕES DE PERFIL
   ========================================================================= */

const ConfiguracoesManager = {
    // Obter configurações atuais
    obter: function() {
        try {
            const usuario = verificarSessao();
            if (!usuario) return null;
            
            return {
                email: usuario.email,
                cnpj: usuario.cnpj,
                tipo: usuario.tipo,
                notificacoes: localStorage.getItem('notificacoes') === 'true',
                tema: localStorage.getItem('tema') || 'claro',
                idioma: localStorage.getItem('idioma') || 'pt-BR'
            };
        } catch (e) {
            console.error('Erro ao obter configurações:', e);
            return null;
        }
    },
    
    // Salvar configurações
    salvar: function(dados) {
        try {
            const usuario = verificarSessao();
            if (!usuario) return false;
            
            // Atualizar dados do usuário
            if (usuario.tipo === 'usuario' && dados.email) {
                usuario.email = dados.email;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            } else if (usuario.tipo === 'empresa' && dados.cnpj) {
                usuario.cnpj = dados.cnpj;
                localStorage.setItem('empresaLogada', JSON.stringify(usuario));
            }
            
            // Salvar preferências
            localStorage.setItem('notificacoes', dados.notificacoes ? 'true' : 'false');
            localStorage.setItem('tema', dados.tema);
            localStorage.setItem('idioma', dados.idioma);
            
            // Registrar no histórico
            HistoricoManager.registrar('CONFIGURAÇÕES', 'Perfil atualizado');
            
            console.log('✅ Configurações salvas com sucesso');
            return true;
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
            return false;
        }
    }
};

// Função para abrir modal de configurações
function abrirConfiguracoes() {
    const usuario = verificarSessao();
    if (!usuario) {
        alert('❌ Você não está logado');
        return;
    }
    
    const config = ConfiguracoesManager.obter();
    const ehUsuario = usuario.tipo === 'usuario';
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('configModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'configModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        font-family: Arial, sans-serif;
    `;
    
    const corPrimaria = ehUsuario ? '#2b5da7' : '#27ae60';
    
    let conteudoHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid ${corPrimaria}; padding-bottom: 1rem;">
                <h2 style="margin: 0; color: ${corPrimaria};">⚙️ Configurações</h2>
                <button id="btnFecharConfig" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>
            
            <!-- Seção de Perfil -->
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f5f7fa; border-radius: 8px;">
                <h3 style="margin-top: 0; color: ${corPrimaria};">👤 Informações da Conta</h3>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: bold;">
                        ${ehUsuario ? 'Email' : 'CNPJ'}
                    </label>
                    <input type="text" id="inputIdentificacao" value="${ehUsuario ? config.email : config.cnpj}" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                        box-sizing: border-box;
                    " placeholder="${ehUsuario ? 'seu@email.com' : '00.000.000/0000-00'}">
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: bold;">
                        Tipo de Conta
                    </label>
                    <div style="
                        padding: 0.75rem;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        color: ${corPrimaria};
                        font-weight: bold;
                    ">
                        ${ehUsuario ? '👤 Usuário' : '🏢 Empresa'}
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: bold;">
                        Senha Atual
                    </label>
                    <input type="password" id="inputSenha" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                        box-sizing: border-box;
                    " placeholder="Digite sua senha para confirmar">
                </div>
            </div>
            
            <!-- Seção de Preferências -->
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f5f7fa; border-radius: 8px;">
                <h3 style="margin-top: 0; color: ${corPrimaria};">🎯 Preferências</h3>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="inputNotificacoes" ${config.notificacoes ? 'checked' : ''} style="
                            width: 18px;
                            height: 18px;
                            margin-right: 0.75rem;
                            cursor: pointer;
                        ">
                        <span style="color: #333;">Ativar Notificações</span>
                    </label>
                    <p style="margin: 0.5rem 0 0 2rem; font-size: 0.85rem; color: #999;">
                        Receber alertas sobre atividades importantes
                    </p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: bold;">
                        Tema Visual
                    </label>
                    <select id="inputTema" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                    ">
                        <option value="claro" ${config.tema === 'claro' ? 'selected' : ''}>☀️ Claro</option>
                        <option value="escuro" ${config.tema === 'escuro' ? 'selected' : ''}>🌙 Escuro</option>
                        <option value="auto" ${config.tema === 'auto' ? 'selected' : ''}>⚙️ Automático</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: bold;">
                        Idioma
                    </label>
                    <select id="inputIdioma" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                    ">
                        <option value="pt-BR" ${config.idioma === 'pt-BR' ? 'selected' : ''}>🇧🇷 Português (Brasil)</option>
                        <option value="en-US" ${config.idioma === 'en-US' ? 'selected' : ''}>🇺🇸 English</option>
                        <option value="es-ES" ${config.idioma === 'es-ES' ? 'selected' : ''}>🇪🇸 Español</option>
                    </select>
                </div>
            </div>
            
            <!-- Seção de Segurança -->
            <div style="padding: 1.5rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #f39c12; margin-bottom: 2rem;">
                <h3 style="margin-top: 0; color: #f39c12;">🔒 Segurança</h3>
                <button id="btnMudarSenha" style="
                    background: #f39c12;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                ">🔑 Alterar Senha</button>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="btnCancelarConfig" style="
                    background: #95a5a6;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">Cancelar</button>
                <button id="btnSalvarConfig" style="
                    background: ${corPrimaria};
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">✓ Salvar Alterações</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = conteudoHTML;
    document.body.appendChild(modal);
    
    // Eventos dos botões
    document.getElementById('btnFecharConfig').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnCancelarConfig').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnMudarSenha').addEventListener('click', function() {
        const novaSenha = prompt('Digite sua nova senha:');
        if (novaSenha && novaSenha.length >= 3) {
            const usuario = verificarSessao();
            if (usuario) {
                usuario.senha = novaSenha;
                if (usuario.tipo === 'usuario') {
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                } else {
                    localStorage.setItem('empresaLogada', JSON.stringify(usuario));
                }
                HistoricoManager.registrar('SEGURANÇA', 'Senha alterada');
                alert('✅ Senha alterada com sucesso!');
                document.getElementById('inputSenha').value = '';
            }
        } else if (novaSenha) {
            alert('❌ A senha deve ter no mínimo 3 caracteres');
        }
    });
    
    document.getElementById('btnSalvarConfig').addEventListener('click', function() {
        const senhaAtual = document.getElementById('inputSenha').value;
        const usuario = verificarSessao();
        
        // Verificar senha
        if (!senhaAtual) {
            alert('❌ Digite sua senha para confirmar as alterações');
            return;
        }
        
        if (usuario.senha && usuario.senha !== senhaAtual) {
            alert('❌ Senha incorreta');
            return;
        }
        
        // Preparar dados
        const dadosAtualizados = {
            email: document.getElementById('inputIdentificacao').value || config.email,
            cnpj: document.getElementById('inputIdentificacao').value || config.cnpj,
            notificacoes: document.getElementById('inputNotificacoes').checked,
            tema: document.getElementById('inputTema').value,
            idioma: document.getElementById('inputIdioma').value
        };
        
        // Salvar
        if (ConfiguracoesManager.salvar(dadosAtualizados)) {
            alert('✅ Configurações salvas com sucesso!');
            modal.remove();
            // Recarregar página para aplicar mudanças
            setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            alert('❌ Erro ao salvar configurações');
        }
    });
    
    // Hover nos botões
    document.getElementById('btnSalvarConfig').addEventListener('mouseenter', function() {
        this.style.opacity = '0.9';
        this.style.transform = 'translateY(-2px)';
    });
    document.getElementById('btnSalvarConfig').addEventListener('mouseleave', function() {
        this.style.opacity = '1';
        this.style.transform = 'translateY(0)';
    });
}

/* =========================================================================
   3.8 SISTEMA DE NOTIFICAÇÕES
   ========================================================================= */

const NotificacaoManager = {
    // Registrar uma notificação
    registrar: function(tipo, titulo, mensagem, urgencia = 'normal') {
        try {
            let notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];
            
            const notificacao = {
                id: Date.now(),
                tipo: tipo,
                titulo: titulo,
                mensagem: mensagem,
                urgencia: urgencia,
                data: new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString(),
                lida: false
            };
            
            notificacoes.unshift(notificacao);
            
            // Manter apenas as últimas 50
            if (notificacoes.length > 50) {
                notificacoes = notificacoes.slice(0, 50);
            }
            
            localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
            console.log(`🔔 Notificação: ${titulo}`);
        } catch (e) {
            console.error('Erro ao registrar notificação:', e);
        }
    },
    
    // Obter todas as notificações
    obter: function() {
        try {
            return JSON.parse(localStorage.getItem('notificacoes')) || [];
        } catch (e) {
            console.error('Erro ao obter notificações:', e);
            return [];
        }
    },
    
    // Marcar como lida
    marcarComoLida: function(id) {
        try {
            let notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];
            const notif = notificacoes.find(n => n.id === id);
            if (notif) {
                notif.lida = true;
                localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
            }
        } catch (e) {
            console.error('Erro ao marcar notificação como lida:', e);
        }
    },
    
    // Deletar notificação
    deletar: function(id) {
        try {
            let notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];
            notificacoes = notificacoes.filter(n => n.id !== id);
            localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
            console.log(`🗑️ Notificação deletada`);
        } catch (e) {
            console.error('Erro ao deletar notificação:', e);
        }
    },
    
    // Limpar todas
    limpar: function() {
        try {
            localStorage.removeItem('notificacoes');
            console.log(`🧹 Notificações limpas`);
        } catch (e) {
            console.error('Erro ao limpar notificações:', e);
        }
    },
    
    // Contar não lidas
    contarNaoLidas: function() {
        const notificacoes = this.obter();
        return notificacoes.filter(n => !n.lida).length;
    }
};

// Registrar notificações automáticas ao fazer login
window.addEventListener('load', function() {
    const usuario = verificarSessao();
    if (usuario) {
        NotificacaoManager.registrar(
            'LOGIN',
            '✅ Login Realizado',
            `Bem-vindo de volta! Você acessou o sistema.`,
            'normal'
        );
    }
});

// Função para abrir modal de notificações
function abrirNotificacoes() {
    const notificacoes = NotificacaoManager.obter();
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('notificacoesModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'notificacoesModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        font-family: Arial, sans-serif;
    `;
    
    let conteudoHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 700px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #3498db; padding-bottom: 1rem;">
                <h2 style="margin: 0; color: #3498db;">🔔 Notificações</h2>
                <button id="btnFecharNotif" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 1rem; background: #e8f8f5; border-radius: 4px; border-left: 4px solid #1abc9c;">
                <p style="margin: 0; color: #16a085;">
                    <strong>Total:</strong> ${notificacoes.length} | <strong>Não lidas:</strong> ${NotificacaoManager.contarNaoLidas()}
                </p>
            </div>
    `;
    
    if (notificacoes.length === 0) {
        conteudoHTML += `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <p><i class="fas fa-bell-slash" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i></p>
                <p>Você não tem notificações.</p>
            </div>
        `;
    } else {
        conteudoHTML += `<div style="margin-bottom: 1rem;">`;
        notificacoes.forEach(notif => {
            const icone = notif.tipo === 'LOGIN' ? '🔓' :
                         notif.tipo === 'AVISO' ? '⚠️' :
                         notif.tipo === 'SUCESSO' ? '✅' :
                         notif.tipo === 'ERRO' ? '❌' : '📌';
            
            const cor = notif.urgencia === 'alta' ? '#e74c3c' :
                       notif.urgencia === 'média' ? '#f39c12' : '#3498db';
            
            const fundoBg = notif.lida ? '#f8f9fa' : '#fff9e6';
            
            conteudoHTML += `
                <div class="notif-item" style="
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    background: ${fundoBg};
                    border-radius: 4px;
                    border-left: 4px solid ${cor};
                    cursor: pointer;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex-grow: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 0.25rem; font-size: 1rem;">
                                ${icone} ${notif.titulo}
                            </div>
                            <div style="color: #555; font-size: 0.95rem; margin-bottom: 0.25rem;">
                                ${notif.mensagem}
                            </div>
                            <div style="color: #999; font-size: 0.85rem;">
                                ${notif.data}
                            </div>
                        </div>
                        <button class="btn-deletar-notif" data-id="${notif.id}" style="
                            background: #e74c3c;
                            color: white;
                            border: none;
                            padding: 0.4rem 0.7rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 0.75rem;
                            margin-left: 1rem;
                            flex-shrink: 0;
                        ">Deletar</button>
                    </div>
                </div>
            `;
        });
        conteudoHTML += `</div>`;
    }
    
    conteudoHTML += `
        <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #eee;">
            <button id="btnLimparNotif" style="
                background: #e67e22;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">🧹 Limpar Tudo</button>
            <button id="btnFecharNotifBtn" style="
                background: #95a5a6;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">Fechar</button>
        </div>
    `;
    
    modal.innerHTML = conteudoHTML;
    document.body.appendChild(modal);
    
    // Eventos
    document.getElementById('btnFecharNotif').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnFecharNotifBtn').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnLimparNotif').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            NotificacaoManager.limpar();
            modal.remove();
            abrirNotificacoes();
            alert('✅ Notificações limpas!');
        }
    });
    
    // Deletar notificações
    document.querySelectorAll('.btn-deletar-notif').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            NotificacaoManager.deletar(id);
            this.parentElement.parentElement.style.opacity = '0.5';
            this.disabled = true;
            setTimeout(() => {
                modal.remove();
                abrirNotificacoes();
            }, 300);
        });
    });
    
    // Marcar como lida ao clicar
    document.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', function() {
            // Recupera o id da notificação via botão deletar (que carrega data-id)
            const btnDeletar = this.querySelector('.btn-deletar-notif');
            if (!btnDeletar) return;

            const id = parseInt(btnDeletar.getAttribute('data-id'));
            if (!Number.isFinite(id)) return;

            NotificacaoManager.marcarComoLida(id);

            // Atualiza contagem e reabre para refletir visualmente
            setTimeout(() => {
                modal.remove();
                abrirNotificacoes();
            }, 50);
        });
    });
}


/* =========================================================================
   3.9 SISTEMA DE DOCUMENTOS
   ========================================================================= */

const DocumentoManager = {
    // Registrar um documento
    registrar: function(nome, tipo, tamanho, data) {
        try {
            let documentos = JSON.parse(localStorage.getItem('documentos')) || [];
            
            const documento = {
                id: Date.now(),
                nome: nome,
                tipo: tipo,
                tamanho: tamanho,
                data: data || new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString(),
                conteudo: 'Documento de exemplo'
            };
            
            documentos.unshift(documento);
            
            // Manter apenas os últimos 100
            if (documentos.length > 100) {
                documentos = documentos.slice(0, 100);
            }
            
            localStorage.setItem('documentos', JSON.stringify(documentos));
            console.log(`📄 Documento: ${nome}`);
        } catch (e) {
            console.error('Erro ao registrar documento:', e);
        }
    },
    
    // Obter todos os documentos
    obter: function() {
        try {
            return JSON.parse(localStorage.getItem('documentos')) || [];
        } catch (e) {
            console.error('Erro ao obter documentos:', e);
            return [];
        }
    },
    
    // Deletar documento
    deletar: function(id) {
        try {
            let documentos = JSON.parse(localStorage.getItem('documentos')) || [];
            documentos = documentos.filter(d => d.id !== id);
            localStorage.setItem('documentos', JSON.stringify(documentos));
            console.log(`🗑️ Documento deletado`);
        } catch (e) {
            console.error('Erro ao deletar documento:', e);
        }
    },
    
    // Limpar todos
    limpar: function() {
        try {
            localStorage.removeItem('documentos');
            console.log(`🧹 Documentos limpados`);
        } catch (e) {
            console.error('Erro ao limpar documentos:', e);
        }
    },
    
    // Contar documentos
    contar: function() {
        return this.obter().length;
    }
};

// Registrar alguns documentos de exemplo
document.addEventListener('DOMContentLoaded', function() {
    const usuario = verificarSessao();
    if (usuario && DocumentoManager.contar() === 0) {
        DocumentoManager.registrar('Termo de Serviço', 'PDF', '245 KB', new Date(Date.now() - 86400000).toLocaleString('pt-BR'));
        DocumentoManager.registrar('Política de Privacidade', 'PDF', '156 KB', new Date(Date.now() - 172800000).toLocaleString('pt-BR'));
        DocumentoManager.registrar('Guia do Usuário', 'PDF', '512 KB', new Date(Date.now() - 259200000).toLocaleString('pt-BR'));
    }
});

/* =========================================================================
   3.10 SISTEMA DE IMPACTO & DASHBOARD
   ========================================================================= */

const ImpactoManager = {
    // Registrar uma transação
    registrar: function(tipo, valor, descricao, categoria = 'geral') {
        try {
            let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
            
            const transacao = {
                id: Date.now(),
                tipo: tipo, // 'doacao' ou 'recebimento'
                valor: parseFloat(valor),
                descricao: descricao,
                categoria: categoria,
                data: new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString()
            };
            
            transacoes.unshift(transacao);
            
            // Manter apenas as últimas 200
            if (transacoes.length > 200) {
                transacoes = transacoes.slice(0, 200);
            }
            
            localStorage.setItem('transacoes', JSON.stringify(transacoes));
            console.log(`💰 Transação registrada: R$ ${valor}`);
        } catch (e) {
            console.error('Erro ao registrar transação:', e);
        }
    },
    
    // Obter todas as transações
    obter: function() {
        try {
            return JSON.parse(localStorage.getItem('transacoes')) || [];
        } catch (e) {
            console.error('Erro ao obter transações:', e);
            return [];
        }
    },
    
    // Calcular total doado
    totalDoado: function() {
        const transacoes = this.obter();
        return transacoes
            .filter(t => t.tipo === 'doacao')
            .reduce((acc, t) => acc + t.valor, 0);
    },
    
    // Calcular total recebido
    totalRecebido: function() {
        const transacoes = this.obter();
        return transacoes
            .filter(t => t.tipo === 'recebimento')
            .reduce((acc, t) => acc + t.valor, 0);
    },
    
    // Obter últimas transações
    obterUltimas: function(limite = 5) {
        return this.obter().slice(0, limite);
    },
    
    // Obter transações deste mês
    obterEssesMes: function() {
        const transacoes = this.obter();
        const agora = new Date();
        const mesAtual = agora.getMonth();
        const anoAtual = agora.getFullYear();
        
        return transacoes.filter(t => {
            const data = new Date(t.timestamp);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        });
    },
    
    // Calcular dados por categoria
    porCategoria: function() {
        const transacoes = this.obter();
        const categorias = {};
        
        transacoes.forEach(t => {
            if (!categorias[t.categoria]) {
                categorias[t.categoria] = {
                    total: 0,
                    quantidade: 0
                };
            }
            categorias[t.categoria].total += t.valor;
            categorias[t.categoria].quantidade += 1;
        });
        
        return categorias;
    },
    
    // Gerar dados de exemplo
    inicializar: function() {
        try {
            if (this.obter().length === 0) {
                const categorias = ['Alimentação', 'Saúde', 'Educação', 'Moradia', 'Outros'];
                
                // Gerar 15 transações de exemplo
                for (let i = 0; i < 15; i++) {
                    const tipo = Math.random() > 0.5 ? 'doacao' : 'recebimento';
                    const valor = Math.floor(Math.random() * 1000) + 50;
                    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
                    const diasAtras = Math.floor(Math.random() * 30);
                    
                    const transacao = {
                        id: Date.now() + i,
                        tipo: tipo,
                        valor: valor,
                        descricao: tipo === 'doacao' ? `Doação para ${categoria}` : `Recebimento de ${categoria}`,
                        categoria: categoria,
                        data: new Date(Date.now() - diasAtras * 86400000).toLocaleString('pt-BR'),
                        timestamp: new Date(Date.now() - diasAtras * 86400000).toISOString()
                    };
                    
                    let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
                    transacoes.unshift(transacao);
                    localStorage.setItem('transacoes', JSON.stringify(transacoes));
                }
                
                console.log('✅ Dados de exemplo de impacto inicializados');
            }
        } catch (e) {
            console.error('Erro ao inicializar impacto:', e);
        }
    }
};

// Inicializar dados na primeira vez
document.addEventListener('DOMContentLoaded', function() {
    ImpactoManager.inicializar();
});

// Função para abrir dashboard de impacto
function abrirDashboardImpacto() {
    const usuario = verificarSessao();
    if (!usuario) {
        alert('❌ Você não está logado');
        return;
    }
    
    const ehUsuario = usuario.tipo === 'usuario';
    const totalDoado = ImpactoManager.totalDoado();
    const totalRecebido = ImpactoManager.totalRecebido();
    const ultimasTransacoes = ImpactoManager.obterUltimas(8);
    const porCategoria = ImpactoManager.porCategoria();
    const esseMes = ImpactoManager.obterEssesMes();
    
    // Calcular totais do mês
    const totalMesDoado = esseMes
        .filter(t => t.tipo === 'doacao')
        .reduce((acc, t) => acc + t.valor, 0);
    const totalMesRecebido = esseMes
        .filter(t => t.tipo === 'recebimento')
        .reduce((acc, t) => acc + t.valor, 0);
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('impactoModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'impactoModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        font-family: Arial, sans-serif;
        overflow-y: auto;
    `;
    
    const corPrimaria = ehUsuario ? '#2b5da7' : '#27ae60';
    const labelDoado = ehUsuario ? 'Doado' : 'Investido';
    const labelRecebido = ehUsuario ? 'Recebido' : 'Retorno Social';
    
    let conteudoHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 1000px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid ${corPrimaria}; padding-bottom: 1rem;">
                <h2 style="margin: 0; color: ${corPrimaria};">📊 Meu Impacto</h2>
                <button id="btnFecharImpacto" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>
            
            <!-- Cards de Impacto -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="
                    background: linear-gradient(135deg, ${corPrimaria} 0%, rgba(43, 93, 167, 0.7) 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">💰 Total ${labelDoado}</div>
                    <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">R$ ${totalDoado.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Este mês: R$ ${totalMesDoado.toFixed(2)}</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #27ae60 0%, rgba(39, 174, 96, 0.7) 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">🤲 Total ${labelRecebido}</div>
                    <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">R$ ${totalRecebido.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Este mês: R$ ${totalMesRecebido.toFixed(2)}</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #3498db 0%, rgba(52, 152, 219, 0.7) 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">📈 Meta Mensal</div>
                    <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">R$ 5.000</div>
                    <div style="
                        background: rgba(255,255,255,0.3);
                        height: 8px;
                        border-radius: 4px;
                        margin-top: 0.5rem;
                        overflow: hidden;
                    ">
                        <div style="
                            background: white;
                            height: 100%;
                            width: ${Math.min((totalMesDoado + totalMesRecebido) / 50, 100)}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #9b59b6 0%, rgba(155, 89, 182, 0.7) 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">🎯 Transações</div>
                    <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${ultimasTransacoes.length}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Últimas ações registradas</div>
                </div>
            </div>
            
            <!-- Gráfico de Categorias -->
            <div style="
                background: #f5f7fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            ">
                <h3 style="margin-top: 0; color: ${corPrimaria};">📊 Distribuição por Categoria</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
    `;
    
    // Adicionar categorias
    Object.entries(porCategoria).forEach(([categoria, dados]) => {
        conteudoHTML += `
            <div style="
                background: white;
                padding: 1rem;
                border-radius: 4px;
                border-left: 4px solid ${corPrimaria};
            ">
                <div style="font-weight: bold; color: #2c3e50; margin-bottom: 0.5rem;">${categoria}</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: ${corPrimaria}; margin-bottom: 0.25rem;">
                    R$ ${dados.total.toFixed(2)}
                </div>
                <div style="font-size: 0.85rem; color: #999;">
                    ${dados.quantidade} transação(ões)
                </div>
            </div>
        `;
    });
    
    conteudoHTML += `
                </div>
            </div>
            
            <!-- Últimas Transações -->
            <div style="
                background: #f5f7fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            ">
                <h3 style="margin-top: 0; color: ${corPrimaria};">📋 Últimas Transações</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: white; border-bottom: 2px solid #ddd;">
                                <th style="padding: 0.75rem; text-align: left; color: #2c3e50; font-weight: bold;">Data</th>
                                <th style="padding: 0.75rem; text-align: left; color: #2c3e50; font-weight: bold;">Tipo</th>
                                <th style="padding: 0.75rem; text-align: left; color: #2c3e50; font-weight: bold;">Descrição</th>
                                <th style="padding: 0.75rem; text-align: left; color: #2c3e50; font-weight: bold;">Categoria</th>
                                <th style="padding: 0.75rem; text-align: right; color: #2c3e50; font-weight: bold;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    ultimasTransacoes.forEach(t => {
        const icone = t.tipo === 'doacao' ? '💸' : '💰';
        const cor = t.tipo === 'doacao' ? '#e74c3c' : '#27ae60';
        
        conteudoHTML += `
            <tr style="border-bottom: 1px solid #eee; background: white;">
                <td style="padding: 0.75rem; color: #666; font-size: 0.9rem;">${t.data}</td>
                <td style="padding: 0.75rem; color: #2c3e50; font-weight: bold;">${icone} ${t.tipo}</td>
                <td style="padding: 0.75rem; color: #555;">${t.descricao}</td>
                <td style="padding: 0.75rem; color: #999;">${t.categoria}</td>
                <td style="padding: 0.75rem; text-align: right; color: ${cor}; font-weight: bold;">R$ ${t.valor.toFixed(2)}</td>
            </tr>
        `;
    });
    
    conteudoHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Botões de Ação -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="btnRegistrarTransacao" style="
                    background: ${corPrimaria};
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">➕ Nova Transação</button>
                <button id="btnFecharImpactoBtn" style="
                    background: #95a5a6;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">Fechar</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = conteudoHTML;
    document.body.appendChild(modal);
    
    // Eventos
    document.getElementById('btnFecharImpacto').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnFecharImpactoBtn').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnRegistrarTransacao').addEventListener('click', function() {
        const tipo = prompt('Tipo (doacao/recebimento):');
        if (tipo && (tipo === 'doacao' || tipo === 'recebimento')) {
            const valor = prompt('Valor (R$):');
            if (valor && !isNaN(valor)) {
                const descricao = prompt('Descrição:');
                if (descricao) {
                    const categorias = ['Alimentação', 'Saúde', 'Educação', 'Moradia', 'Outros'];
                    const categoria = prompt(`Categoria (${categorias.join(', ')}):`) || 'Outros';
                    
                    ImpactoManager.registrar(tipo, valor, descricao, categoria);
                    HistoricoManager.registrar('TRANSAÇÃO', `${tipo === 'doacao' ? 'Doação' : 'Recebimento'}: R$ ${valor}`);
                    NotificacaoManager.registrar('TRANSAÇÃO', '✅ Transação Registrada', `${descricao} - R$ ${valor}`, 'normal');
                    
                    alert('✅ Transação registrada com sucesso!');
                    modal.remove();
                    abrirDashboardImpacto();
                }
            }
        } else {
            alert('❌ Tipo inválido');
        }
    });
}

// Função para abrir modal de documentos
function abrirDocumentos() {
    const documentos = DocumentoManager.obter();
    const usuario = verificarSessao();
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('documentosModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'documentosModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        font-family: Arial, sans-serif;
    `;
    
    let conteudoHTML = `
        <div style="
            background: white;
            border-radius: 8px;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #2980b9; padding-bottom: 1rem;">
                <h2 style="margin: 0; color: #2980b9;">📄 Meus Documentos</h2>
                <button id="btnFecharDocs" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">✕</button>
            </div>
            
            <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                <button id="btnUploadDoc" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    flex: 1;
                ">📤 Enviar Novo Documento</button>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196F3;">
                <p style="margin: 0; color: #1565c0;">
                    <strong>Total de documentos:</strong> ${documentos.length}
                </p>
            </div>
    `;
    
    if (documentos.length === 0) {
        conteudoHTML += `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <p><i class="fas fa-folder-open" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i></p>
                <p>Você não tem documentos.</p>
            </div>
        `;
    } else {
        conteudoHTML += `
            <div style="margin-bottom: 1rem;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f7fa; border-bottom: 2px solid #ddd;">
                            <th style="padding: 1rem; text-align: left; color: #2c3e50; font-weight: bold;">Nome</th>
                            <th style="padding: 1rem; text-align: left; color: #2c3e50; font-weight: bold;">Tipo</th>
                            <th style="padding: 1rem; text-align: left; color: #2c3e50; font-weight: bold;">Tamanho</th>
                            <th style="padding: 1rem; text-align: left; color: #2c3e50; font-weight: bold;">Data</th>
                            <th style="padding: 1rem; text-align: center; color: #2c3e50; font-weight: bold;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        documentos.forEach(doc => {
            const icone = doc.tipo === 'PDF' ? '📄' :
                         doc.tipo === 'DOC' ? '📝' :
                         doc.tipo === 'XLS' ? '📊' :
                         doc.tipo === 'IMG' ? '🖼️' : '📎';
            
            conteudoHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 1rem; color: #2c3e50;">
                        <div style="font-weight: bold;">${icone} ${doc.nome}</div>
                    </td>
                    <td style="padding: 1rem; color: #666;">${doc.tipo}</td>
                    <td style="padding: 1rem; color: #666;">${doc.tamanho}</td>
                    <td style="padding: 1rem; color: #999; font-size: 0.9rem;">${doc.data}</td>
                    <td style="padding: 1rem; text-align: center;">
                        <button class="btn-deletar-doc" data-id="${doc.id}" style="
                            background: #e74c3c;
                            color: white;
                            border: none;
                            padding: 0.4rem 0.7rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 0.75rem;
                        ">🗑️ Deletar</button>
                    </td>
                </tr>
            `;
        });
        
        conteudoHTML += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    conteudoHTML += `
        <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #eee;">
            <button id="btnLimparDocs" style="
                background: #e67e22;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">🗑️ Limpar Tudo</button>
            <button id="btnFecharDocsBtn" style="
                background: #95a5a6;
                border: none;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">Fechar</button>
        </div>
    `;
    
    modal.innerHTML = conteudoHTML;
    document.body.appendChild(modal);
    
    // Eventos
    document.getElementById('btnFecharDocs').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnFecharDocsBtn').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('btnUploadDoc').addEventListener('click', function() {
        const nomeDoc = prompt('Nome do documento:');
        if (nomeDoc) {
            const tipoDoc = prompt('Tipo (PDF, DOC, XLS, IMG):');
            const tamanhoDoc = prompt('Tamanho (ex: 256 KB):');
            if (tipoDoc && tamanhoDoc) {
                DocumentoManager.registrar(nomeDoc, tipoDoc, tamanhoDoc);
                HistoricoManager.registrar('DOCUMENTO', `Documento enviado: ${nomeDoc}`);
                modal.remove();
                abrirDocumentos();
                alert('✅ Documento enviado com sucesso!');
            }
        }
    });
    
    document.getElementById('btnLimparDocs').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja deletar todos os documentos?')) {
            DocumentoManager.limpar();
            modal.remove();
            abrirDocumentos();
            alert('✅ Documentos deletados!');
        }
    });
    
    document.querySelectorAll('.btn-deletar-doc').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            DocumentoManager.deletar(id);
            this.parentElement.parentElement.style.opacity = '0.5';
            this.disabled = true;
            setTimeout(() => {
                modal.remove();
                abrirDocumentos();
            }, 300);
        });
    });
}

/* =========================================================================
   4. SCRIPTS ESPECÍFICOS: PÁGINA DE DOAÇÕES
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 3.1 SELEÇÃO DE VALORES DA DOAÇÃO
    const botoesValor = document.querySelectorAll('.valor-btn');
    const containerValorCustom = document.querySelector('.custom-valor-container');
    const inputValorCustom = document.getElementById('valorCustom');

    if (botoesValor.length > 0) {
        botoesValor.forEach(botao => {
            botao.addEventListener('click', () => {
                botoesValor.forEach(btn => btn.classList.remove('ativo'));
                botao.classList.add('ativo');

                const valor = botao.getAttribute('data-valor');
                if (valor === 'outro') {
                    if(containerValorCustom) containerValorCustom.style.display = 'block';
                    if(inputValorCustom) inputValorCustom.focus();
                } else {
                    if(containerValorCustom) containerValorCustom.style.display = 'none';
                }
            });
        });
    }

    // 3.2 BOTÃO COPIAR CHAVE PIX
    const btnCopiarPix = document.getElementById('btnCopiarPix');
    const inputChavePix = document.getElementById('chavePix');
    const pixFeedback = document.getElementById('pixFeedback');

    if (btnCopiarPix && inputChavePix) {
        btnCopiarPix.addEventListener('click', () => {
            navigator.clipboard.writeText(inputChavePix.value).then(() => {
                btnCopiarPix.innerHTML = '<i class="fas fa-check"></i> Copiado';
                btnCopiarPix.style.background = '#27ae60';
                if(pixFeedback) pixFeedback.style.opacity = '1';

                setTimeout(() => {
                    btnCopiarPix.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                    btnCopiarPix.style.background = '#32bcad';
                    if(pixFeedback) pixFeedback.style.opacity = '0';
                }, 3000);
            }).catch(err => {
                console.error('Erro ao copiar chave PIX: ', err);
            });
        });
    }

    // 3.3 ALTERNÂNCIA DE MÉTODO DE PAGAMENTO (PIX / CARTÃO)
    const metodoPagamento = document.getElementById('metodoPagamento');
    const secaoPix = document.getElementById('secaoPix');
    const secaoCartao = document.getElementById('secaoCartao');

    function atualizarMetodoPagamento() {
        if (!metodoPagamento || !secaoPix || !secaoCartao) return;

        const metodo = metodoPagamento.value;

        if (metodo === 'pix') {
            secaoPix.style.display = 'block';
            secaoCartao.style.display = 'none';
            // Animação suave ao revelar
            secaoPix.style.opacity = '0';
            secaoPix.style.transform = 'translateY(10px)';
            setTimeout(() => {
                secaoPix.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                secaoPix.style.opacity = '1';
                secaoPix.style.transform = 'translateY(0)';
            }, 10);
        } else if (metodo === 'credito' || metodo === 'debito') {
            secaoCartao.style.display = 'block';
            secaoPix.style.display = 'none';
            // Animação suave ao revelar
            secaoCartao.style.opacity = '0';
            secaoCartao.style.transform = 'translateY(10px)';
            setTimeout(() => {
                secaoCartao.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                secaoCartao.style.opacity = '1';
                secaoCartao.style.transform = 'translateY(0)';
            }, 10);

            // Atualiza o label do tipo de cartão
            const labelTipoCartao = document.getElementById('labelTipoCartao');
            if (labelTipoCartao) {
                labelTipoCartao.textContent = metodo === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito';
            }

            // Mostra/oculta campo de parcelas só para crédito
            const grupoParcelamento = document.getElementById('grupoParcelamento');
            if (grupoParcelamento) {
                grupoParcelamento.style.display = metodo === 'credito' ? 'block' : 'none';
            }
        } else {
            secaoPix.style.display = 'none';
            secaoCartao.style.display = 'none';
        }
    }

    if (metodoPagamento) {
        metodoPagamento.addEventListener('change', atualizarMetodoPagamento);
        // Executa ao carregar para respeitar o valor padrão
        atualizarMetodoPagamento();
    }

    // Formatação automática do número do cartão (grupos de 4)
    const inputNumCartao = document.getElementById('numCartao');
    if (inputNumCartao) {
        inputNumCartao.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
            e.target.value = valor.replace(/(.{4})/g, '$1 ').trim();

            // Detecta bandeira pelo primeiro dígito
            const bandeira = document.getElementById('bandeiraCartao');
            if (bandeira) {
                const primeiro = valor[0];
                if (primeiro === '4') {
                    bandeira.className = 'fab fa-cc-visa bandeira-icon';
                } else if (primeiro === '5') {
                    bandeira.className = 'fab fa-cc-mastercard bandeira-icon';
                } else if (valor.startsWith('34') || valor.startsWith('37')) {
                    bandeira.className = 'fab fa-cc-amex bandeira-icon';
                } else {
                    bandeira.className = 'fas fa-credit-card bandeira-icon';
                }
            }
        });
    }

    // Formatação da validade (MM/AA)
    const inputValidade = document.getElementById('validadeCartao');
    if (inputValidade) {
        inputValidade.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (valor.length >= 3) {
                valor = valor.substring(0, 2) + '/' + valor.substring(2);
            }
            e.target.value = valor;
        });
    }

    // Formatação do CVV (apenas números)
    const inputCVV = document.getElementById('cvvCartao');
    if (inputCVV) {
        inputCVV.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    // 3.4 SIMULAÇÃO DE SUBMIT DO FORMULÁRIO DE DOAÇÃO
    const formDoacao = document.getElementById('formDoacao');
    if (formDoacao) {
        formDoacao.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnSubmit = formDoacao.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            btnSubmit.style.opacity = '0.8';

            setTimeout(() => {
                alert('Obrigado por sua doação! Você será redirecionado para o ambiente seguro de pagamento.');
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.style.opacity = '1';
                formDoacao.reset();
                atualizarMetodoPagamento(); // Reseta exibição do método
                if(botoesValor[1]) botoesValor[1].click(); // Retorna ao valor padrão (R$ 50)
            }, 1500);
        });
    }

    // 3.5 ACCORDION (FAQ)
    const faqItens = document.querySelectorAll('.faq-pergunta');
    if (faqItens.length > 0) {
        faqItens.forEach(item => {
            item.addEventListener('click', () => {
                const resposta = item.nextElementSibling;
                
                // Fecha as outras respostas ao abrir uma nova
                faqItens.forEach(outroItem => {
                    if(outroItem !== item) {
                        outroItem.classList.remove('ativa');
                        if(outroItem.nextElementSibling) outroItem.nextElementSibling.style.maxHeight = null;
                    }
                });

                item.classList.toggle('ativa');
                if (item.classList.contains('ativa')) {
                    resposta.style.maxHeight = resposta.scrollHeight + "px";
                } else {
                    resposta.style.maxHeight = null;
                }
            });
        });
    }

    // 3.6 BARRAS DE TRANSPARÊNCIA (Animação)
    const barrasProgresso = document.querySelectorAll('.barra-progresso');
    if (barrasProgresso.length > 0) {
        const progressoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const barra = entry.target;
                    const width = barra.getAttribute('data-width');
                    barra.style.width = width;
                    progressoObserver.unobserve(barra); 
                }
            });
        }, { threshold: 0.5 });

        barrasProgresso.forEach(barra => progressoObserver.observe(barra));
    }

    // 3.7 ANIMAÇÕES SCROLL E CONTADORES DA DOAÇÃO
    const elementosAnimadosDoacao = document.querySelectorAll('.anima-scroll');
    if (elementosAnimadosDoacao.length > 0) {
        
        function animarContador(elemento) {
            const target = +elemento.getAttribute('data-target');
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / target));
            let atual = 0;
            
            const timer = setInterval(() => {
                let incremento = target > 1000 ? 15 : (target > 100 ? 5 : 1);
                atual += incremento;
                
                if (atual >= target) {
                    elemento.innerText = target + "+";
                    clearInterval(timer);
                } else {
                    elemento.innerText = atual;
                }
            }, stepTime || 10);
        }

        const fadeObserverDoacao = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    if (entry.target.classList.contains('impacto-card')) {
                        const contador = entry.target.querySelector('.contador');
                        if (contador && !contador.classList.contains('animado')) {
                            animarContador(contador);
                            contador.classList.add('animado');
                        }
                    }
                    fadeObserverDoacao.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elementosAnimadosDoacao.forEach(elemento => {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(30px)';
            elemento.style.transition = 'all 0.8s ease-out';
            fadeObserverDoacao.observe(elemento);
        });
    }

});

/* =========================================================================
   5. SCRIPTS ESPECÍFICOS: CENTRAL DE COOKIES (cookies.html)
   ========================================================================= */

// 5.1 SISTEMA DE ABAS (TABS)
window.abrirAbaCookies = function(evt, abaId) {
    // Esconde todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostra a aba clicada
    const tabElement = document.getElementById(abaId);
    if (tabElement) {
        tabElement.classList.add('active');
        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add('active');
        } else {
            // Se chamado sem evento de clique (ex: via URL hash), encontra o botão correspondente
            const btn = document.querySelector(`.tab-btn[onclick*="${abaId}"]`);
            if (btn) btn.classList.add('active');
        }
    }

    // Atualiza URL sem recarregar a página
    history.pushState(null, null, '#' + abaId);

    // Carrega dados dinâmicos se necessário
    if (abaId === 'aba-gerenciar') exibirCookiesPainel();
    if (abaId === 'aba-teste') verificarConsentimentoPainel();
};

// 5.2 FUNÇÕES DA ABA: GERENCIAR
window.exibirCookiesPainel = function() {
    if (typeof CookieManager === 'undefined') return;
    
    const cookies = CookieManager.getAll();
    const listContainer = document.getElementById('cookiesList');
    if (!listContainer) return; // Não está na página de cookies
    
    let totais = { essenciais: 0, todos: Object.keys(cookies).length };
    let html = '';

    if (totais.todos === 0) {
        listContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">Nenhum cookie encontrado.</p>';
    } else {
        for (let name in cookies) {
            const value = cookies[name];
            const isEssencial = name.toLowerCase().includes('consent') || name.toLowerCase().includes('session') || name.toLowerCase().includes('essential');
            if (isEssencial) totais.essenciais++;

            html += `
                <div class="cookie-row">
                    <div style="flex: 1;">
                        <strong style="color: #2b5da7;">${name}</strong>
                        ${isEssencial ? '<span class="cookie-badge" style="margin-left:10px;">Essencial</span>' : ''}
                        <div class="cookie-value">${value.substring(0, 80)}${value.length > 80 ? '...' : ''}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 10px; margin-left: 1rem;">
                        <button class="btn-cookies secondary" style="padding: 0.5rem 1rem;" onclick="navigator.clipboard.writeText('${value.replace(/'/g, "\'")}')"><i class="fas fa-copy"></i> Copiar</button>
                        ${!isEssencial ? `<button class="btn-cookies danger" style="padding: 0.5rem 1rem;" onclick="deletarCookieUI('${name}')"><i class="fas fa-trash"></i> Deletar</button>` : ''}
                    </div>
                </div>
            `;
        }
        listContainer.innerHTML = html;
    }

    const totalCookiesEl = document.getElementById('totalCookies');
    const essentialCookiesEl = document.getElementById('essentialCookies');
    if (totalCookiesEl) totalCookiesEl.textContent = totais.todos;
    if (essentialCookiesEl) essentialCookiesEl.textContent = totais.essenciais;
};

window.deletarCookieUI = function(name) {
    if (confirm(`Deletar o cookie "${name}"?`)) {
        CookieManager.delete(name);
        exibirCookiesPainel();
    }
};

window.confirmarLimparTodos = function() {
    if (confirm('Limpar TODOS os cookies? Isso pode afetar o funcionamento do site.')) {
        CookieManager.deleteAll();
        exibirCookiesPainel();
    }
};

// 5.3 FUNÇÕES DA ABA: TESTE
window.criarCookieTeste = function() {
    const nameInput = document.getElementById('testCookieName');
    const valueInput = document.getElementById('testCookieValue');
    
    if (!nameInput || !valueInput) return;
    
    const name = nameInput.value;
    const value = valueInput.value;
    
    if (!name || !value) return alert('Preencha nome e valor!');
    
    CookieManager.set(name, value, 30);
    alert(`Cookie "${name}" criado! Vá na aba Gerenciar para vê-lo.`);
    nameInput.value = '';
    valueInput.value = '';
};

window.verificarConsentimentoPainel = function() {
    const outputContainer = document.getElementById('consentOutput');
    if (!outputContainer) return;
    
    const consent = CookieManager.get('cookieConsent') || 'Não definido';
    const analytics = CookieManager.get('cookieAnalytics') === 'true' ? '✅ Ativado' : '❌ Desativado';
    
    outputContainer.innerHTML = `
        <p><strong>Consentimento Geral LGPD:</strong> ${consent}</p>
        <p><strong>Cookies de Análise:</strong> ${analytics}</p>
    `;
};

// Inicialização específica da página de cookies
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página de cookies
    if (document.querySelector('.unified-container')) {
        // Abre aba baseada na URL ao carregar a página
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            abrirAbaCookies(null, hash);
        } else {
            // Se não houver hash, apenas inicializa a aba padrão ativando seus scripts (ex: aba Política)
            // Se a aba padrão fosse Gerenciar, chamaríamos exibirCookiesPainel() aqui.
        }
    }
});