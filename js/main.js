let   posts = [];
let   currentFilter = 'all';
let   currentPage = 1;
const PER_PAGE = 4;
let   searchQuery = '';

function copyCode(id)
{
  const   el = document.getElementById(id);
  const   codeLines = el.querySelectorAll('.code-line');
  let     text = '';

  codeLines.forEach(line =>
  {
    const clone = line.cloneNode(true);
    const lineNum = clone.querySelector('.line-num');
    if (lineNum) lineNum.remove();
    text += clone.textContent + '\n';
  });
  
  text = text.trim();
  
  navigator.clipboard.writeText(text).then(() =>
  {
    const btn = el.closest('.code-block').querySelector('.copy-btn');
    btn.classList.add('copied');
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>Copied!';
    setTimeout(() =>
    {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/></svg>Copy';
    }, 2000);
  });
}

function parseMd(md) {
  let     html = '';
  const   lines = md.split('\n');
  let     inCode = false;
  let     codeBlock = '';
  let     codeLang = '';
  let     inUl = false;

  for (let i = 0; i < lines.length; i++)
  {
    const line = lines[i];
    if (line.trim().startsWith('```'))
    {
      if (inCode)
      {
        const codeId = 'code-' + Math.random().toString(36).substr(2, 8);
        const lines = escapeHtml(codeBlock.trim()).split('\n');
        const numberedLines = lines.map((l, i) =>
        {
          let content = l;
          if (l.trimStart().startsWith('#'))
          {
            content = `<span class="code-comment">${l}</span>`;
          }
          else if (l.includes(' #'))
          {
            const idx = l.indexOf(' #');
            content = l.substring(0, idx) + `<span class="code-comment">${l.substring(idx)}</span>`;
          }
          return `<span class="code-line"><span class="line-num">${i + 1}</span>${content}</span>`;
        }).join('\n');

        html += `<div class="code-block">`;
        html += `<div class="code-header"><div class="code-header-inner"><div class="dots"><span></span><span></span><span></span></div><span class="code-lang">${codeLang || 'shell'}</span><button class="copy-btn" onclick="copyCode('${codeId}')"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/></svg>Copy</button></div></div>`;
        html += `<pre><code id="${codeId}">${numberedLines}</code></pre></div>\n`;
        codeBlock = '';
        codeLang = '';
        inCode = false;
      }
      else
      {
        if (inUl)
        {
          html += '</ul>\n'; inUl = false;
        }
        codeLang = line.trim().slice(3).trim();
        inCode = true;
      }
      continue;
    }
    if (inCode)
    {
      codeBlock += line + '\n';
      continue;
    }

    if (line.trim() === '')
    {
      if (inUl)
      {
        html += '</ul>\n'; inUl = false;
      }
      continue;
    }

    if (line.trim().match(/^-{3,}$/) || line.trim().match(/^\*{3,}$/))
    {
      if (inUl)
      {
        html += '</ul>\n'; inUl = false;
      }
      html += '<hr>\n';
      continue;
    }

    if (line.trim().match(/^!\[.*\]\(.*\)$/))
    {
      if (inUl)
      {
        html += '</ul>\n'; inUl = false;
      }
      const m = line.trim().match(/^!\[(.*)\]\((.*)\)$/);
      if (m)
        html += `<div class="md-img"><img src="${m[2]}" alt="${m[1]}" loading="lazy"></div>\n`;
      continue;
    }

    if (line.startsWith('## '))
    {
      if (inUl)
      {
        html += '</ul>\n'; inUl = false;
      }
      html += `<h2>${inlineFormat(line.slice(3))}</h2>\n`;
      continue;
    }

    if (line.startsWith('> '))
    {
      if (inUl)
      {
        html += '</ul>\n'; inUl = false;
      }
      html += `<div class="note">${inlineFormat(line.slice(2))}</div>\n`;
      continue;
    }

    if (line.match(/^[-*] /))
    {
      if (!inUl)
      {
        html += '<ul>\n'; inUl = true;
      }
      html += `<li>${inlineFormat(line.replace(/^[-*] /, ''))}</li>\n`;
      continue;
    }

    if (inUl)
    {
      html += '</ul>\n'; inUl = false;
    }
    
    html += `<p>${inlineFormat(line)}</p>\n`;
  }

  if (inUl)
    html += '</ul>\n';
  if (inCode)
    html += `<pre><code>${escapeHtml(codeBlock.trim())}</code></pre>\n`;
  return html;
}

function escapeHtml(s)
{
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFormat(s)
{
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" class="md-inline-img">');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}

async function loadPosts()
{
  try
  {
    const resp = await fetch('writeups/posts.json');
    const manifest = await resp.json();
    const loaded = await Promise.all(manifest.map(async (entry) => {
    try
    {
      const mdResp = await fetch(`writeups/${entry.file}`);
      if (!mdResp.ok)
        return null;
      const mdText = await mdResp.text();
      return {
        id: entry.id,
        category: entry.category,
        tags: entry.tags,
        title: entry.title,
        date: entry.date,
        readTime: entry.readTime,
        excerpt: entry.excerpt,
        body: parseMd(mdText)
      };
    }
    catch
    {
      return null;
    }
    }));

    posts = loaded.filter(Boolean);
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderPosts();
  }
  catch (e)
  {
    console.error('Failed to load posts:', e);
    document.getElementById('postList').innerHTML =
      `<p style="color:var(--muted);font-size:0.76rem;padding:2rem 0;">Failed to load writeups. Make sure you're serving from a web server.</p>`;
  }
}

function getFiltered()
{
  let result = posts;
  if (currentFilter !== 'all')
  {
    result = result.filter(p =>
      p.category === currentFilter ||
      p.tags.map(t => t.toLowerCase()).includes(currentFilter.toLowerCase())
    );
  }
  if (searchQuery)
  {
    const q = searchQuery.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return result;
}

function renderPosts()
{
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (currentPage - 1) * PER_PAGE;
  const page = filtered.slice(start, start + PER_PAGE);

  document.getElementById('postList').innerHTML = page.length === 0
    ? `<p style="color:var(--muted);font-size:0.76rem;padding:2rem 0;">No writeups found.</p>`
    : page.map(p => `
      <div class="post-item" onclick="openPost(${p.id})">
        <div class="post-meta">
          <span class="p-cat">${p.category}</span>
          <span class="p-time">◷ ${p.readTime}</span>
          <span class="p-date">${formatDate(p.date)}</span>
        </div>
        <div class="post-title">${p.title}</div>
        <div class="post-excerpt">${p.excerpt}</div>
        <div class="post-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>`).join('');

  const pag = document.getElementById('pagination');
  if (totalPages <= 1)
  {
    pag.innerHTML = '';
    return;
  }
  let html = `<button class="pg-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
  for (let i = 1; i <= totalPages; i++)
  {
    html += `<button class="pg-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
  pag.innerHTML = html;
}

function goPage(n)
{
  const total = Math.ceil(getFiltered().length / PER_PAGE);
  if (n < 1 || n > total)
    return;
  currentPage = n;
  renderPosts();
  window.scrollTo(0, 0);
}

function filterPosts(cat)
{
  currentFilter = cat;
  currentPage = 1;
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  const labels =
  {
    all: 'Recent Posts',
    web: 'Web Security',
    sqli: 'SQLi',
    xss: 'XSS',
    rce: 'RCE',
    ssrf: 'SSRF',
    ssti: 'SSTI',
    xxe: 'XXE',
    idor: 'IDOR',
    csrf: 'CSRF',
    lfi: 'LFI / RFI',
    'auth-bypass': 'Auth Bypass',
    bypass: 'WAF Bypass',
    privesc: 'Privilege Escalation',
    linux: 'Linux',
    windows: 'Windows',
    ad: 'Active Directory',
    network: 'Network',
    crypto: 'Cryptography',
    reversing: 'Reversing',
    forensics: 'Forensics',
    malware: 'Malware',
    osint: 'OSINT',
    cloud: 'Cloud Security',
    api: 'API Security',
    mobile: 'Mobile Security',
    ctf: 'CTF Writeups',
    htb: 'HackTheBox',
    thm: 'TryHackMe',
    bugbounty: 'Bug Bounty',
    technique: 'Techniques',
    tool: 'Tools'
  };
  document.getElementById('secTitle').textContent = labels[cat] || 'Writeups';
  renderPosts();
}

function sidebarFilter(tag, el)
{
  document.querySelectorAll('.stag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  filterPosts(tag);
}

function handleSearch()
{
  const val = document.getElementById('searchInput').value;
  const xssPattern = /<\s*script|onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=|onfocus\s*=|javascript\s*:|<\s*img[^>]+on|<\s*svg|<\s*iframe|<\s*embed|<\s*object|alert\s*\(|document\.|eval\s*\(|<\s*body[^>]+on|<\s*input[^>]+on|<\s*marquee|<\s*details[^>]+on|<\s*video[^>]+on|<\s*audio[^>]+on|prompt\s*\(|confirm\s*\(/i;
  if (xssPattern.test(val))
  {
    showXssToast();
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderPosts();
    return;
  }
  searchQuery = val;
  currentPage = 1;
  renderPosts();
}

function showXssToast()
{
  const old = document.getElementById('xssToast');
  if (old)
    old.remove();

  const toast = document.createElement('div');
  toast.id = 'xssToast';
  toast.className = 'xss-toast';
  toast.innerHTML = `
    <div class="xss-toast-icon">⚠</div>
    <div class="xss-toast-msg">bro really tried XSS on a security blog…??! 💀💀💀</div>
    <button class="xss-toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() =>
  {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function openPost(id)
{
  const post = posts.find(p => p.id === id);
  if (!post)
    return;
  document.getElementById('aCat').textContent = '';
  document.getElementById('aTitle').textContent = post.title;
  document.getElementById('aDate').textContent = formatDate(post.date);
  document.getElementById('aTime').textContent = post.readTime;
  document.getElementById('pvDate').textContent = formatDate(post.date);
  document.getElementById('aBody').innerHTML = post.body;
  const v = document.getElementById('postView');
  v.classList.add('open');
  v.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closePost()
{
  document.getElementById('postView').classList.remove('open');
  document.body.style.overflow = '';
}

function showHome()
{
  closePost();
}

function formatDate(d)
{
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePost(); });
loadPosts();
