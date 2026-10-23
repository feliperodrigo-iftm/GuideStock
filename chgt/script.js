const stores = [
  {
    id:'caderno-central', type:'produto', name:'Papelaria Central', product:'Caderno universitário 10 matérias', category:'papelaria', price:32.90, stock:true,
    service:'Encadernação', distanceKm:1.1, distance:'1,1 km', address:'Centro, Uberaba - MG', tags:['caderno','papelaria','material escolar']
  },
  {
    id:'desodorante-verde', type:'produto', name:'Mercado Bairro Verde', product:'Desodorante aerosol 150 ml', category:'higiene', price:14.99, stock:true,
    service:'', distanceKm:2.4, distance:'2,4 km', address:'Abadia, Uberaba - MG', tags:['desodorante','higiene','mercado']
  },
  {
    id:'ar-condicionado', type:'produto', name:'Casa & Conforto', product:'Ar-condicionado 12.000 BTUs', category:'casa', price:2199.00, stock:true,
    service:'Instalação', distanceKm:1.8, distance:'1,8 km', address:'Shopping / entorno, Uberaba - MG', tags:['ar condicionado','climatização','instalação']
  },
  {
    id:'smartwatch', type:'produto', name:'Tech Ponto', product:'Smartwatch esportivo', category:'eletronicos', price:249.90, stock:true,
    service:'Assistência técnica', distanceKm:3.2, distance:'3,2 km', address:'São Benedito, Uberaba - MG', tags:['smartwatch','relógio','eletrônicos']
  },
  {
    id:'bateria-auto', type:'produto', name:'Auto Center Região Sul', product:'Bateria automotiva 60 Ah', category:'automotivo', price:429.00, stock:false,
    service:'Instalação', distanceKm:5.4, distance:'5,4 km', address:'Região Sul, Uberaba - MG', tags:['bateria','automotivo','carro']
  },
  {
    id:'limpeza-piscina', type:'servico', name:'Piscina & Jardim', product:'Limpeza de piscina', category:'piscina', price:120.00, stock:true,
    service:'Limpeza e manutenção', distanceKm:4.0, distance:'4,0 km', address:'Tutunas, Uberaba - MG', tags:['piscina','limpeza','manutenção','jardim']
  },
  {
    id:'instalacao-ar', type:'servico', name:'Clima Fácil Serviços', product:'Instalação de ar-condicionado', category:'servicos', price:380.00, stock:true,
    service:'Instalação residencial', distanceKm:3.5, distance:'3,5 km', address:'Abadia, Uberaba - MG', tags:['ar condicionado','instalação','climatização']
  },
  {
    id:'manutencao-pc', type:'servico', name:'TechCare Assistência', product:'Manutenção de computador', category:'servicos', price:95.00, stock:true,
    service:'Diagnóstico e manutenção', distanceKm:2.9, distance:'2,9 km', address:'Centro, Uberaba - MG', tags:['computador','manutenção','assistência']
  }
];

const state = {
  searchType:'all', sort:'relevance', results:[...stores], authMode:'register', authRole:'consumer', currentUser:null
};

const USER_STORAGE_KEY = 'guidestock_demo_users';
const SESSION_STORAGE_KEY = 'guidestock_demo_session';
const PASSWORD_ITERATIONS = 120000;

const els = {
  brandLogo: document.getElementById('brandLogo'), footerLogo: document.getElementById('footerLogo'),
  searchForm: document.getElementById('searchForm'), searchInput: document.getElementById('searchInput'), category: document.getElementById('categorySelect'),
  radius: document.getElementById('radiusSelect'), stockOnly: document.getElementById('stockOnly'), serviceOnly: document.getElementById('serviceOnly'),
  clearSearch: document.getElementById('clearSearch'), suggestions: document.getElementById('searchSuggestions'), resultsList: document.getElementById('resultsList'),
  resultCount: document.getElementById('resultCount'), resultsSubtitle: document.getElementById('resultsSubtitle'), resultsStatus: document.getElementById('resultsStatus'),
  openCityMap: document.getElementById('openCityMap'), useCurrentLocation: document.getElementById('useCurrentLocation'),
  mapFrameWrap: document.getElementById('mapFrameWrap'), googleMapIframe: document.getElementById('googleMapIframe'), merchantCta: document.getElementById('merchantCta'), navMenuBtn: document.getElementById('navMenuBtn'), navWrap: document.querySelector('.nav-wrap'), navPanel: document.getElementById('mobileNavPanel'), nav: document.querySelector('.main-nav'),
  toast: document.getElementById('toast'), navAccount: document.getElementById('navAccount'), authModal: document.getElementById('authModal'), authClose: document.getElementById('authClose'), authForm: document.getElementById('authForm'),
  authMode: document.getElementById('authMode'), authRole: document.getElementById('authRole'), authTitle: document.getElementById('authTitle'), authSubtitle: document.getElementById('authSubtitle'), authSubmit: document.getElementById('authSubmit'), authTabs: document.getElementById('authTabs'), basicFields: document.getElementById('basicFields'), authSwitchText: document.getElementById('authSwitchText'), authSwitchBtn: document.getElementById('authSwitchBtn'),
  fullName: document.getElementById('fullName'), phone: document.getElementById('phone'), merchantFields: document.getElementById('merchantFields'), storeName: document.getElementById('storeName'), cnpj: document.getElementById('cnpj'),
  address: document.getElementById('address'), merchantCategory: document.getElementById('merchantCategory'), email: document.getElementById('email'), password: document.getElementById('password'), passwordConfirm: document.getElementById('passwordConfirm'), terms: document.getElementById('terms')
};

function normalize(text='') {
  return String(text).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>\"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  }[character]));
}

function formatPrice(value) {
  return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function googleMapsSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsDirections(destination) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>els.toast.classList.remove('show'),3200);
}

function categoryLabel(category) {
  return {
    papelaria:'Papelaria', higiene:'Higiene', eletronicos:'Eletrônicos', casa:'Casa', automotivo:'Automotivo', piscina:'Piscina e jardim', servicos:'Serviço'
  }[category] || 'Outros';
}

function setResultsStatus(text) {
  els.resultsStatus.textContent = text;
}

function relevanceScore(item, term) {
  if (!term) return 0;
  const product = normalize(item.product);
  const name = normalize(item.name);
  const service = normalize(item.service || '');
  const tags = (item.tags || []).map(normalize);
  if (product === term) return 100;
  if (product.startsWith(term)) return 90;
  if (product.includes(term)) return 80;
  if (service === term || service.includes(term)) return 70;
  if (name.includes(term)) return 60;
  if (tags.some(tag => tag === term)) return 55;
  if (tags.some(tag => tag.includes(term))) return 45;
  return 0;
}

function filterStores() {
  const term = normalize(els.searchInput.value.trim());
  const category = els.category.value;
  const radius = els.radius.value;
  const stockOnly = els.stockOnly.checked;
  const serviceOnly = els.serviceOnly.checked;

  let items = stores.filter(item => {
    const haystack = normalize([item.type, item.name, item.product, item.service, item.category, item.address, ...(item.tags || [])].join(' '));
    const matchesTerm = !term || haystack.includes(term);
    const matchesType = state.searchType === 'all' || item.type === state.searchType;
    // A categoria Serviços reúne todos os anúncios do tipo serviço, inclusive os de piscina e jardim.
    const matchesCategory = category === 'todos' || (category === 'servicos' ? item.type === 'servico' : item.category === category);
    const matchesRadius = radius === 'cidade' || item.distanceKm <= Number(radius);
    const matchesStock = !stockOnly || item.stock;
    // Anúncios do tipo serviço sempre correspondem; produtos só entram se tiverem um serviço associado.
    const matchesService = !serviceOnly || item.type === 'servico' || Boolean(item.service);
    return matchesTerm && matchesType && matchesCategory && matchesRadius && matchesStock && matchesService;
  });

  if (state.sort === 'price') items.sort((a,b)=>a.price-b.price);
  else if (state.sort === 'distance') items.sort((a,b)=>a.distanceKm-b.distanceKm);
  else if (term) items.sort((a,b)=>relevanceScore(b, term)-relevanceScore(a, term));
  return items;
}

function renderResults(items) {
  state.results = items;
  els.resultCount.textContent = `${items.length} ${items.length === 1 ? 'opção' : 'opções'}`;
  els.resultsSubtitle.textContent = items.length ? 'Dados de demonstração para Uberaba-MG. Confirme preço, estoque e endereço diretamente com o estabelecimento.' : 'Nenhuma opção correspondeu aos filtros selecionados.';
  setResultsStatus(items.length ? 'Busca atualizada' : 'Tente mudar os filtros');

  if (!items.length) {
    els.resultsList.innerHTML = `
      <div class="result-card">
        <div>
          <div class="result-top"><div class="store-mark">⌕</div><div><h3>Nenhum resultado encontrado</h3><p class="product">Experimente outro termo, categoria ou raio.</p></div></div>
          <div class="result-meta"><span class="tag">Sugestão</span><span class="tag">Amplie o raio</span><span class="tag">Remova um filtro</span></div>
        </div>
      </div>`;
    return;
  }

  els.resultsList.innerHTML = items.map((item,index)=>{
    const location = `${item.name}, ${item.address}`;
    const serviceTag = item.type === 'servico' ? item.service : (item.service ? `Serviço: ${item.service}` : '');
    const stockLabel = item.type === 'servico'
      ? (item.stock ? 'Disponível para atendimento' : 'Consultar disponibilidade')
      : (item.stock ? 'Em estoque' : 'Consultar disponibilidade');
    const serviceTagHtml = serviceTag ? `<span class="tag">${escapeHtml(serviceTag)}</span>` : '';
    return `
      <article class="result-card">
        <div>
          <div class="result-top">
            <div class="store-mark">${index+1}</div>
            <div>
              <h3>${escapeHtml(item.product)}</h3>
              <p class="product">${escapeHtml(item.name)} • demonstração • ${escapeHtml(item.distance)}</p>
            </div>
          </div>
          <div class="result-meta">
            <span class="tag">${escapeHtml(categoryLabel(item.category))}</span>
            <span class="tag">${escapeHtml(stockLabel)}</span>
            ${serviceTagHtml}
          </div>
        </div>
        <div class="price-block">
          <div class="price">${formatPrice(item.price)}</div>
          <span class="stock">${escapeHtml(item.address)}</span>
          <div class="result-actions">
            <button class="mini-btn map-focus" type="button" data-map-query="${escapeHtml(location)}">Ver no mapa</button>
            <a class="mini-btn primary" href="${googleMapsDirections(location)}" target="_blank" rel="noopener">Como chegar</a>
          </div>
        </div>
      </article>`;
  }).join('');
}

function runSearch({scroll=true}={}) {
  const items = filterStores();
  renderResults(items);
  if (scroll) document.getElementById('resultados').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderSuggestions() {
  const term = normalize(els.searchInput.value.trim());
  const base = stores.filter(item=>!term || normalize([item.product,item.service,...item.tags].join(' ')).includes(term));
  const suggestions = [...new Set(base.flatMap(item=>[item.product,item.service]).filter(Boolean))].slice(0,5);
  els.suggestions.innerHTML = suggestions.map(value=>`<button class="search-suggestion" type="button" data-suggestion="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join('');
}

function openAuth(mode='register', role='consumer') {
  els.authForm.reset();
  els.password.type = 'password';
  els.passwordConfirm.type = 'password';
  document.querySelectorAll('[data-password-target]').forEach(btn => btn.textContent = 'Mostrar');
  state.authMode = mode;
  state.authRole = role;
  els.authMode.value = mode;
  els.authRole.value = role;
  els.authModal.hidden = false;
  document.body.classList.add('modal-open');
  updateAuthView();
  setTimeout(() => (mode === 'login' ? els.email : els.fullName).focus(), 50);
}

function closeAuth() {
  els.authModal.hidden = true;
  document.body.classList.remove('modal-open');
}

function updateAuthView() {
  const isLogin = state.authMode === 'login';
  const isMerchant = state.authRole === 'merchant';
  document.querySelectorAll('[data-role-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.roleTab === state.authRole));
  els.authTitle.textContent = isLogin ? 'Entrar no GuideStock' : 'Crie sua conta';
  els.authSubtitle.textContent = isLogin ? 'Entre com o e-mail e a senha que você cadastrou neste navegador.' : 'Escolha o tipo de cadastro e preencha seus dados.';
  els.authSubmit.textContent = isLogin ? 'Entrar' : (isMerchant ? 'Cadastrar minha loja' : 'Criar minha conta');
  els.authTabs.hidden = isLogin;
  els.basicFields.hidden = isLogin;
  els.merchantFields.hidden = !isMerchant || isLogin;
  [els.storeName, els.cnpj, els.address].forEach(input => { input.required = isMerchant && !isLogin; });
  els.merchantCategory.required = false;
  els.password.setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
  // O campo Senha e o campo Confirmar senha compartilham uma grade no cadastro.
  // No login, escondemos somente Confirmar senha; esconder a grade inteira ocultava a própria senha.
  els.passwordConfirm.closest('label').hidden = isLogin;
  els.password.closest('.field-grid').classList.toggle('password-grid-login', isLogin);
  els.passwordConfirm.required = !isLogin;
  els.terms.closest('.terms-check').hidden = isLogin;
  els.terms.required = !isLogin;
  els.fullName.required = !isLogin;
  els.phone.required = false;
  els.authSwitchText.textContent = isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?';
  els.authSwitchBtn.textContent = isLogin ? 'Criar uma conta' : 'Entrar';
}

function getDemoUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function saveDemoUsers(users) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    showToast('Não foi possível salvar os dados neste navegador. Verifique o espaço disponível e as permissões.');
    return false;
  }
}

function makeAccountId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return `gs-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function hashPassword(password, existingSalt = null) {
  if (!window.crypto || !window.crypto.subtle || !window.crypto.getRandomValues) {
    throw new Error('SECURE_CRYPTO_UNAVAILABLE');
  }
  const salt = existingSalt || window.crypto.getRandomValues(new Uint8Array(16));
  const material = await window.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await window.crypto.subtle.deriveBits({
    name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256'
  }, material, 256);
  return {
    passwordSalt: bytesToBase64(salt),
    passwordHash: bytesToBase64(new Uint8Array(bits)),
    passwordAlgorithm: 'PBKDF2-SHA-256',
    passwordIterations: PASSWORD_ITERATIONS
  };
}

function safeStringEqual(first, second) {
  if (typeof first !== 'string' || typeof second !== 'string' || first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index++) difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return difference === 0;
}

async function passwordMatches(user, password) {
  // Contas criadas por uma versão anterior do protótipo são convertidas ao novo formato no próximo login.
  if (user.passwordHash && user.passwordSalt) {
    const calculated = await hashPassword(password, base64ToBytes(user.passwordSalt));
    return safeStringEqual(calculated.passwordHash, user.passwordHash);
  }
  if (typeof user.password === 'string' && user.password === password) {
    const calculated = await hashPassword(password);
    const users = getDemoUsers();
    const userIndex = users.findIndex(item => item.email === user.email);
    if (userIndex >= 0) {
      if (!users[userIndex].id) users[userIndex].id = makeAccountId();
      delete users[userIndex].password;
      Object.assign(users[userIndex], calculated);
      saveDemoUsers(users);
      user.id = users[userIndex].id;
      Object.assign(user, calculated);
      delete user.password;
    }
    return true;
  }
  return false;
}

function setCurrentSession(user) {
  state.currentUser = user;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ userId: user.id, signedInAt: new Date().toISOString() }));
  } catch (error) {
    // A sessão ainda funciona nesta página, mas não sobreviverá ao recarregamento se o navegador bloquear armazenamento.
  }
  renderAccountState();
}

function restoreSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
    if (session && session.userId) {
      const user = getDemoUsers().find(item => item.id === session.userId);
      if (user) state.currentUser = user;
      else localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    state.currentUser = null;
  }
  // Renderiza os controles mesmo quando ainda não existe sessão, para que Entrar/Criar conta funcionem.
  renderAccountState();
}

function renderAccountState() {
  if (!els.navAccount) return;
  if (state.currentUser) {
    const firstName = (state.currentUser.fullName || 'usuário').trim().split(/\s+/)[0];
    els.navAccount.innerHTML = '<span class="nav-user" id="navUserName"></span><button class="btn btn-ghost btn-small" type="button" id="logoutBtn">Sair</button>';
    const name = document.getElementById('navUserName');
    name.textContent = `Olá, ${firstName}`;
    name.title = state.currentUser.role === 'merchant' ? 'Conta de comerciante' : 'Conta de consumidor';
    document.getElementById('logoutBtn').addEventListener('click', () => { closeMobileMenu(); logout(); });
  } else {
    els.navAccount.innerHTML = '<button class="btn btn-ghost btn-small" type="button" data-auth-open="login">Entrar</button><button class="btn btn-primary btn-small" type="button" data-auth-open="register">Criar conta</button>';
    els.navAccount.querySelectorAll('[data-auth-open]').forEach(button => {
      button.addEventListener('click', () => { closeMobileMenu(); openAuth(button.dataset.authOpen || 'register', button.dataset.authRole || 'consumer'); });
    });
  }
}

function logout() {
  try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (error) { /* A sessão local será encerrada nesta página. */ }
  state.currentUser = null;
  renderAccountState();
  showToast('Você saiu da sua conta.');
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const isLogin = state.authMode === 'login';
  const email = els.email.value.trim().toLowerCase();
  const password = els.password.value;

  if (!window.crypto || !window.crypto.subtle || !window.crypto.getRandomValues) {
    showToast('Para criar conta com proteção de senha, abra o site usando HTTPS ou localhost em um navegador atualizado.');
    return;
  }

  try {
    const users = getDemoUsers();
    if (isLogin) {
      const found = users.find(user => (user.email || '').toLowerCase() === email);
      if (!found || !(await passwordMatches(found, password))) {
        showToast('E-mail ou senha incorretos. Confira os dados ou crie uma conta.');
        return;
      }
      const latestUser = getDemoUsers().find(user => user.id && user.id === found.id) || found;
      if (!latestUser.id) {
        latestUser.id = makeAccountId();
        saveDemoUsers(getDemoUsers().map(user => user.email === latestUser.email ? latestUser : user));
      }
      setCurrentSession(latestUser);
      closeAuth();
      els.authForm.reset();
      showToast(`Bem-vindo(a), ${(latestUser.fullName || 'ao GuideStock').split(/\s+/)[0]}! Você entrou na sua conta.`);
      return;
    }

    const fullName = els.fullName.value.trim();
    if (!fullName) { showToast('Informe seu nome completo.'); return; }
    if (password !== els.passwordConfirm.value) { showToast('As senhas não coincidem.'); return; }
    if (users.some(user => (user.email || '').toLowerCase() === email)) {
      showToast('Este e-mail já está cadastrado neste navegador. Entre com sua conta.');
      return;
    }

    const credentials = await hashPassword(password);
    const newUser = {
      id: makeAccountId(), role: state.authRole, fullName, phone: els.phone.value.trim(), email,
      storeName: els.storeName.value.trim(), cnpj: els.cnpj.value.trim(), address: els.address.value.trim(),
      merchantCategory: els.merchantCategory.value, createdAt: new Date().toISOString(), ...credentials
    };
    if (!saveDemoUsers([...users, newUser])) return;

    // Depois do cadastro, a pessoa já entra na conta recém-criada.
    setCurrentSession(newUser);
    closeAuth();
    els.authForm.reset();
    showToast(state.authRole === 'merchant' ? 'Loja cadastrada! Você já entrou na sua conta de comerciante.' : 'Conta criada! Você já está conectado ao GuideStock.');
  } catch (error) {
    console.error('Falha no cadastro/login do GuideStock:', error);
    if (error && error.message === 'SECURE_CRYPTO_UNAVAILABLE') {
      showToast('A proteção de senha não está disponível neste contexto. Abra o site em HTTPS ou localhost.');
    } else {
      showToast('Não foi possível concluir a operação. Tente novamente neste navegador.');
    }
  }
}

function setEmbeddedMapQuery(query) {
  if (!els.googleMapIframe) return;
  const key = window.GUIDESTOCK_CONFIG?.googleMapsApiKey?.trim();
  if (key) {
    els.googleMapIframe.src = `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}`;
  } else {
    els.googleMapIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  }
}

function initEmbeddedMap() {
  setEmbeddedMapQuery('Uberaba, MG, Brasil');
}

function removeLogoBlackBackground(img) {
  if (!img || !img.complete) { img?.addEventListener('load',()=>removeLogoBlackBackground(img),{once:true}); return; }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height);
    for (let i=0; i<data.data.length; i+=4) {
      const r=data.data[i], g=data.data[i+1], b=data.data[i+2];
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      if (max < 24 && (max-min) < 10) data.data[i+3]=0;
    }
    ctx.putImageData(data,0,0);
    img.src=canvas.toDataURL('image/png');
  } catch (error) {
    // A origem do arquivo pode bloquear canvas; o logo original continua funcionando.
  }
}

// Pesquisa
els.searchForm.addEventListener('submit',event=>{event.preventDefault();runSearch({scroll:true});});
els.searchInput.addEventListener('input',()=>{renderSuggestions(); if(!els.searchInput.value.trim()) runSearch({scroll:false});});
els.clearSearch.addEventListener('click',()=>{els.searchInput.value='';renderSuggestions();runSearch({scroll:false});els.searchInput.focus();});
els.suggestions.addEventListener('click',event=>{const btn=event.target.closest('[data-suggestion]');if(!btn)return;els.searchInput.value=btn.dataset.suggestion;renderSuggestions();runSearch({scroll:true});});

els.resultsList.addEventListener('click', event => {
  const btn = event.target.closest('[data-map-query]');
  if (!btn) return;
  const query = btn.dataset.mapQuery;
  setEmbeddedMapQuery(query);
  els.openCityMap.href = googleMapsSearch(query);
  els.openCityMap.textContent = 'Abrir este local no Google Maps ↗';
  document.getElementById('mapa').scrollIntoView({behavior:'smooth', block:'center'});
  showToast('Mapa centralizado neste resultado.');
});

document.querySelectorAll('[data-search-type]').forEach(btn=>btn.addEventListener('click',()=>{
  state.searchType=btn.dataset.searchType;
  document.querySelectorAll('[data-search-type]').forEach(item=>{const active=item===btn;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',active?'true':'false');});
  runSearch({scroll:false});
}));

document.querySelectorAll('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>{
  state.sort=btn.dataset.sort;
  document.querySelectorAll('[data-sort]').forEach(item=>item.classList.toggle('is-active',item===btn));
  renderResults(filterStores());
}));

// Google Maps
const cityMapUrl = googleMapsSearch('Uberaba, MG, Brasil');
els.openCityMap.href = cityMapUrl;
els.useCurrentLocation.addEventListener('click',()=>{
  if (!navigator.geolocation) { showToast('Seu navegador não oferece geolocalização.'); return; }
  showToast('Solicitando sua localização…');
  navigator.geolocation.getCurrentPosition(position=>{
    const coords=`${position.coords.latitude},${position.coords.longitude}`;
    setEmbeddedMapQuery(coords);
    els.openCityMap.href = googleMapsSearch(coords);
    els.openCityMap.textContent = 'Abrir minha localização no Google Maps ↗';
    showToast('Mapa centralizado na sua localização. Use o botão ao lado para abrir no Google Maps.');
  },()=>showToast('Não foi possível obter sua localização agora.'));
});

// Cadastro / login
[...document.querySelectorAll('[data-auth-open]:not(#navAccount [data-auth-open])')].forEach(btn=>btn.addEventListener('click',()=>{closeMobileMenu();openAuth(btn.dataset.authOpen || 'register',btn.dataset.authRole || 'consumer');}));
[...document.querySelectorAll('[data-role-tab]')].forEach(btn=>btn.addEventListener('click',()=>{state.authRole=btn.dataset.roleTab;els.authRole.value=state.authRole;updateAuthView();}));
els.authClose.addEventListener('click',closeAuth);
els.authModal.addEventListener('click',event=>{if(event.target===els.authModal)closeAuth();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!els.authModal.hidden)closeAuth();});
els.authForm.addEventListener('submit', handleAuthSubmit);
els.authSwitchBtn.addEventListener('click', () => {
  const savedEmail = els.email.value.trim();
  const nextMode = state.authMode === 'login' ? 'register' : 'login';
  openAuth(nextMode, state.authRole);
  els.email.value = savedEmail;
});

document.querySelectorAll('[data-password-target]').forEach(btn=>btn.addEventListener('click',()=>{const target=document.getElementById(btn.dataset.passwordTarget);target.type=target.type==='password'?'text':'password';btn.textContent=target.type==='password'?'Mostrar':'Ocultar';}));
els.merchantCta.addEventListener('click',()=>openAuth('register','merchant'));

// Menu responsivo: navegação e ações de conta compartilham o mesmo painel em telas menores.
function closeMobileMenu() {
  if (!els.navWrap || !els.navMenuBtn) return;
  els.navWrap.classList.remove('menu-open');
  els.navMenuBtn.setAttribute('aria-expanded', 'false');
  els.navMenuBtn.setAttribute('aria-label', 'Abrir menu');
  els.navMenuBtn.textContent = '☰';
}

els.navMenuBtn.addEventListener('click', () => {
  const shouldOpen = els.navMenuBtn.getAttribute('aria-expanded') !== 'true';
  els.navWrap.classList.toggle('menu-open', shouldOpen);
  els.navMenuBtn.setAttribute('aria-expanded', String(shouldOpen));
  els.navMenuBtn.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
  els.navMenuBtn.textContent = shouldOpen ? '×' : '☰';
});

document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', closeMobileMenu));
document.addEventListener('click', event => {
  if (!els.navWrap || !els.navWrap.classList.contains('menu-open')) return;
  if (!els.navWrap.contains(event.target)) closeMobileMenu();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileMenu(); });
window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 981px)').matches) closeMobileMenu();
});

restoreSession();
removeLogoBlackBackground(els.brandLogo);
removeLogoBlackBackground(els.footerLogo);
renderSuggestions();
renderResults(filterStores());
initEmbeddedMap();
